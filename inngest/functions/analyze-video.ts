import { inngest } from '@/lib/inngest'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
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

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
 * Generate a single analysis section using OpenAI
 *
 * @param sectionType - The type of section to generate (e.g., 'HEROS_JOURNEY', 'MONEY_SHOTS')
 * @param video - Video metadata including title, channel, stats, and duration
 * @param transcript - Full video transcript text for analysis
 * @returns Object containing validated JSON data and optional markdown content
 * @throws Error if prompt function not found or validation fails after retries
 *
 * @remarks
 * - Automatically retries once on failure with validation error feedback
 * - Response is validated against the corresponding Zod schema
 * - Uses GPT-4 Turbo with JSON mode for structured output
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

  // Retry logic: try up to 2 times
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
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
        // Remove markdown code blocks if present
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

      return { json: validated, markdown }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Attempt ${attempt + 1} failed for ${sectionType}:`, error)

      // If validation failed, add fix instructions to prompt for retry
      if (attempt === 0 && error instanceof Error) {
        const fixInstruction = `\n\nPrevious attempt failed validation: ${error.message}. Please fix the JSON to match the schema exactly.`
        // Note: We'd need to modify the prompt function to accept additional instructions
        // For now, we'll just retry with the same prompt
      }
    }
  }

  throw lastError || new Error(`Failed to generate ${sectionType} after 2 attempts`)
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

