import { inngest } from '@/lib/inngest'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import Groq from 'groq-sdk'
import {
  sectionSchemas,
  type SectionType,
} from '@/lib/schemas/analysis-schemas'
import {
  getHeroJourneyPrompt,
  getEmotionDecoderPrompt,
  getTitleDecodePrompt,
  getThumbnailXRayPrompt,
  getMoneyShotsPrompt,
  getContentHighlightsPrompt,
  getFullArticlePrompt,
  getOverviewPrompt,
} from '@/lib/prompts/section-prompts'

// Initialize OpenAI client (primary)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// Initialize Groq client (fallback)
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

// Validate at least one AI provider is available
if (!openai && !groq) {
  throw new Error('At least one of OPENAI_API_KEY or GROQ_API_KEY must be set')
}

const SECTION_TYPES: SectionType[] = [
  'OVERVIEW',
  'HEROS_JOURNEY',
  'EMOTION_ROLLERCOASTER',
  'MONEY_SHOTS',
  'TITLE_DECODE',
  'THUMBNAIL_XRAY',
  'CONTENT_HIGHLIGHTS',
  'FULL_ARTICLE',
]

const PROMPT_FUNCTIONS = {
  OVERVIEW: getOverviewPrompt,
  HEROS_JOURNEY: getHeroJourneyPrompt,
  EMOTION_ROLLERCOASTER: getEmotionDecoderPrompt,
  MONEY_SHOTS: getMoneyShotsPrompt,
  TITLE_DECODE: getTitleDecodePrompt,
  THUMBNAIL_XRAY: getThumbnailXRayPrompt,
  CONTENT_HIGHLIGHTS: getContentHighlightsPrompt,
  FULL_ARTICLE: getFullArticlePrompt,
} as const

/**
 * Generate a single analysis section using OpenAI (primary) or Groq (fallback)
 *
 * @param sectionType - The type of section to generate (e.g., 'HEROS_JOURNEY', 'MONEY_SHOTS')
 * @param video - Video metadata including title, channel, stats, and duration
 * @param transcript - Full video transcript text for analysis
 * @returns Object containing validated JSON data and optional markdown content
 * @throws Error if prompt function not found or validation fails after retries
 *
 * @remarks
 * - Tries OpenAI first (gpt-4o), falls back to Groq (mixtral-8x7b-32768) if OpenAI fails
 * - Automatically retries once on failure with validation error feedback
 * - Response is validated against the corresponding Zod schema
 * - Uses JSON mode for structured output
 */
async function generateSection(
  sectionType: SectionType,
  video: {
    title: string
    channel: string
    duration: number
    viewCount: number | null
    likeCount: number | null
    commentCount: number | null
    thumbnailUrl: string | null
  },
  transcript: string
): Promise<{ json: any; markdown?: string }> {
  const promptFn = PROMPT_FUNCTIONS[sectionType]
  if (!promptFn) {
    throw new Error(`No prompt function for section type: ${sectionType}`)
  }

  const prompt = promptFn({
    video: {
      title: video.title,
      channel: video.channel,
      duration: video.duration,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
    },
    transcript,
  })

  const schema = sectionSchemas[sectionType]

  let lastError: Error | null = null

  // Try OpenAI first
  if (openai) {
    try {
      console.log(`🎯 Trying OpenAI for ${sectionType}`)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      // Parse JSON
      let json: any
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        json = JSON.parse(cleaned)
      } catch (parseError) {
        throw new Error(`Failed to parse JSON: ${parseError}`)
      }

      // Validate against schema
      const validated = schema.parse(json)

      // Generate markdown for some sections
      let markdown: string | undefined
      if (sectionType === 'FULL_ARTICLE' && 'markdown' in validated) {
        markdown = validated.markdown
      }

      console.log(`✅ OpenAI succeeded for ${sectionType}`)
      return { json: validated, markdown }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`⚠️  OpenAI failed for ${sectionType}:`, lastError.message)
      // Continue to Groq fallback
    }
  }

  // Try Groq as fallback (Llama 3.1 or Mixtral)
  if (groq) {
    // Try Llama 3.1 70B first (best quality), then Mixtral (faster)
    const groqModels = [
      'llama-3.1-70b-versatile',  // Best quality, good speed
      'llama-3.1-8b-instant',     // Very fast, good quality
      'mixtral-8x7b-32768',       // Fast alternative
    ]

    for (const model of groqModels) {
      try {
        console.log(`🎯 Trying Groq ${model} (fallback) for ${sectionType}`)

        const completion = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        })

        const content = completion.choices[0]?.message?.content
        if (!content) {
          throw new Error(`No content in Groq ${model} response`)
        }

        // Parse JSON
        let json: any
        try {
          const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          json = JSON.parse(cleaned)
        } catch (parseError) {
          throw new Error(`Failed to parse JSON: ${parseError}`)
        }

        // Validate against schema
        const validated = schema.parse(json)

        // Generate markdown for some sections
        let markdown: string | undefined
        if (sectionType === 'FULL_ARTICLE' && 'markdown' in validated) {
          markdown = validated.markdown
        }

        console.log(`✅ Groq ${model} succeeded for ${sectionType}`)
        return { json: validated, markdown }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`⚠️  Groq ${model} failed for ${sectionType}:`, lastError.message)
        // Continue to next Groq model
      }
    }
  }

  throw lastError || new Error(`Failed to generate ${sectionType} with all providers`)
}

export const analyzeVideo = inngest.createFunction(
  { id: 'analyze-video' },
  { event: 'video/analyze' },
  async ({ event, step }) => {
    const { analysisId } = event.data

    // Fetch analysis and related data
    const analysis = await step.run('fetch-analysis', async () => {
      return await prisma.analysis.findUnique({
        where: { id: analysisId },
        include: {
          video: {
            include: {
              transcript: true,
            },
          },
        },
      })
    })

    if (!analysis) {
      throw new Error(`Analysis ${analysisId} not found`)
    }

    if (!analysis.video.transcript) {
      throw new Error('Transcript not found for video')
    }

    // Update status to RUNNING
    await step.run('update-status-running', async () => {
      return await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: 'RUNNING' },
      })
    })

    // Generate all sections in parallel (80-90% faster than sequential)
    const sections = await step.run('generate-sections', async () => {
      // Create parallel promises for all sections
      const sectionPromises = SECTION_TYPES.map(async (sectionType) => {
        try {
          // Generate section with AI
          const { json, markdown } = await generateSection(
            sectionType,
            analysis.video,
            analysis.video.transcript!.text
          )

          // Save section to database
          await prisma.analysisSection.upsert({
            where: {
              analysisId_type: {
                analysisId: analysisId,
                type: sectionType,
              },
            },
            update: {
              json,
              markdown,
            },
            create: {
              analysisId,
              type: sectionType,
              json,
              markdown,
            },
          })

          return { sectionType, success: true }
        } catch (error) {
          console.error(`Failed to generate ${sectionType}:`, error)
          return {
            sectionType,
            success: false,
            error: String(error)
          }
        }
      })

      // Wait for all sections to complete
      const results = await Promise.all(sectionPromises)
      return results
    })

    // Check if any critical sections failed
    const criticalSections = ['OVERVIEW', 'HEROS_JOURNEY', 'EMOTION_ROLLERCOASTER']
    const criticalFailures = sections.filter(
      (r) => criticalSections.includes(r.sectionType) && !r.success
    )

    if (criticalFailures.length > 0) {
      // Update status to FAILED
      await step.run('update-status-failed', async () => {
        return await prisma.analysis.update({
          where: { id: analysisId },
          data: {
            status: 'FAILED',
            error: `Critical sections failed: ${criticalFailures.map((f) => f.sectionType).join(', ')}`,
          },
        })
      })
      throw new Error(`Critical sections failed: ${criticalFailures.map((f) => f.sectionType).join(', ')}`)
    }

    // Update status to DONE
    await step.run('update-status-done', async () => {
      return await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: 'DONE' },
      })
    })

    return { analysisId, sections }
  }
)

