import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { analyzeVideo } from '@/inngest/functions/analyze-video'
import { extractTranscript } from '@/inngest/functions/extract-transcript'

// Configure runtime for Vercel
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes (max for Hobby plan)

// Serve Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeVideo, extractTranscript],
  streaming: 'force',
})

