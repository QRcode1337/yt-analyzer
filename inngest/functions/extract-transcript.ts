import { inngest } from '@/lib/inngest'
import { prisma } from '@/lib/prisma'
import { AssemblyAI } from 'assemblyai'
import { YoutubeTranscript } from 'youtube-transcript'
import ytdl from '@distube/ytdl-core'
import OpenAI from 'openai'
import Groq from 'groq-sdk'

const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || '',
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

type TranscriptSource = 'supadata' | 'groq-whisper' | 'assemblyai' | 'youtube-transcript' | 'openai-whisper'

interface TranscriptResult {
  text: string
  source: TranscriptSource
}

/**
 * Extract transcript with multiple fallbacks
 * 1. Try Supadata.ai (YouTube-specific, 100 free requests, fast)
 * 2. Try AssemblyAI (general purpose, limited free tier)
 * 3. Try youtube-transcript library (free but often blocked)
 * 4. If fails, use OpenAI Whisper (slower, costs money but works for all videos)
 */
async function extractTranscriptWithFallback(youtubeId: string): Promise<TranscriptResult> {
  const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`

  // Try Supadata.ai first (YouTube-specific, most reliable)
  if (process.env.SUPADATA_API_KEY) {
    try {
      console.log('🎯 [Supadata] Starting transcription for:', youtubeId)

      const response = await fetch(
        `https://api.supadata.ai/v1/youtube/transcript?videoId=${youtubeId}&text=true`,
        {
          headers: {
            'x-api-key': process.env.SUPADATA_API_KEY,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Supadata API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.content) {
        console.log('✅ [Supadata] Successfully transcribed:', youtubeId)
        return { text: data.content, source: 'supadata' }
      }
    } catch (supadataError) {
      console.log('⚠️  [Supadata] Failed, trying Groq Whisper...', supadataError)
    }
  } else {
    console.log('⚠️  [Supadata] API key not configured, skipping...')
  }

  // Try Groq Whisper-large-v3 (very fast, free tier available)
  if (groq) {
    try {
      console.log('🎯 [Groq Whisper] Starting transcription for:', youtubeId)

      // Download audio stream
      const audioStream = ytdl(videoUrl, {
        quality: 'lowestaudio',
        filter: 'audioonly',
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        },
      })

      // Convert stream to buffer
      const chunks: Buffer[] = []
      for await (const chunk of audioStream) {
        chunks.push(chunk)
      }
      const audioBuffer = Buffer.concat(chunks)

      // Create file for Groq Whisper API
      const audioFile = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' })

      // Transcribe with Groq Whisper-large-v3 (much faster than OpenAI)
      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3',
        language: 'en', // Optional: specify language for better accuracy
      })

      console.log('✅ [Groq Whisper] Successfully transcribed:', youtubeId)
      return { text: transcription.text, source: 'groq-whisper' }
    } catch (groqError) {
      console.log('⚠️  [Groq Whisper] Failed, trying AssemblyAI...', groqError)
    }
  } else {
    console.log('⚠️  [Groq Whisper] API key not configured, skipping...')
  }

  // Try AssemblyAI third
  if (process.env.ASSEMBLYAI_API_KEY) {
    try {
      console.log('🎯 [AssemblyAI] Starting transcription for:', youtubeId)

      const transcript = await assemblyai.transcripts.transcribe({
        audio: videoUrl,
      })

      if (transcript.status === 'error') {
        throw new Error(transcript.error || 'AssemblyAI transcription failed')
      }

      if (transcript.text) {
        console.log('✅ [AssemblyAI] Successfully transcribed:', youtubeId)
        return { text: transcript.text, source: 'assemblyai' }
      }
    } catch (assemblyError) {
      console.log('⚠️  [AssemblyAI] Failed, trying youtube-transcript...', assemblyError)
    }
  } else {
    console.log('⚠️  [AssemblyAI] API key not configured, skipping...')
  }

  // Try youtube-transcript library as fallback
  try {
    console.log('🎯 [YouTube Transcript] Attempting for:', youtubeId)
    const transcriptData = await YoutubeTranscript.fetchTranscript(youtubeId)
    const transcriptText = transcriptData.map((item) => item.text).join(' ')
    console.log('✅ [YouTube Transcript] Successfully extracted:', youtubeId)
    return { text: transcriptText, source: 'youtube-transcript' }
  } catch (ytError) {
    console.log('⚠️  [YouTube Transcript] Failed, trying Whisper...', ytError)

    // Fallback to Whisper
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🎯 [Whisper] Starting transcription for:', youtubeId)

        // Download audio stream with bot detection bypass
        const audioStream = ytdl(videoUrl, {
          quality: 'lowestaudio',
          filter: 'audioonly',
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          },
        })

        // Convert stream to buffer
        const chunks: Buffer[] = []
        for await (const chunk of audioStream) {
          chunks.push(chunk)
        }
        const audioBuffer = Buffer.concat(chunks)

        // Create a file-like object for Whisper API
        const audioFile = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' })

        // Transcribe with Whisper
        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: 'whisper-1',
        })

        console.log('✅ [OpenAI Whisper] Successfully transcribed:', youtubeId)
        return { text: transcription.text, source: 'openai-whisper' }
      } catch (whisperError) {
        console.error('❌ [Whisper] Transcription failed:', whisperError)
        throw new Error(`Failed to get transcript: ${whisperError}`)
      }
    } else {
      throw new Error('All transcript extraction methods failed and OpenAI API key not configured')
    }
  }
}

export const extractTranscript = inngest.createFunction(
  {
    id: 'extract-transcript',
    name: 'Extract Video Transcript',
    retries: 2,
  },
  { event: 'video/extract-transcript' },
  async ({ event, step }) => {
    const { videoId, youtubeId } = event.data

    // Step 1: Extract transcript with fallbacks
    const result = await step.run('extract-transcript', async () => {
      console.log(`📝 Starting transcript extraction for video ${videoId} (YouTube: ${youtubeId})`)
      return await extractTranscriptWithFallback(youtubeId)
    })

    // Step 2: Save transcript to database
    await step.run('save-transcript', async () => {
      await prisma.transcript.create({
        data: {
          videoId,
          text: result.text,
          source: result.source,
        },
      })
      console.log(`💾 Saved transcript for video ${videoId} (source: ${result.source})`)
    })

    // Step 3: Find pending analysis and trigger it
    await step.run('trigger-analysis', async () => {
      const pendingAnalysis = await prisma.analysis.findFirst({
        where: {
          videoId,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      })

      if (pendingAnalysis) {
        // Trigger analysis
        await inngest.send({
          name: 'video/analyze',
          data: {
            analysisId: pendingAnalysis.id,
          },
        })

        // Update status
        await prisma.analysis.update({
          where: { id: pendingAnalysis.id },
          data: { status: 'RUNNING' },
        })

        console.log(`🚀 Triggered analysis for ${pendingAnalysis.id}`)
      } else {
        console.log(`⚠️  No pending analysis found for video ${videoId}`)
      }
    })

    return { success: true, source: result.source }
  }
)
