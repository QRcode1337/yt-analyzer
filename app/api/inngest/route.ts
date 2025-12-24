import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { analyzeVideo } from '@/inngest/functions/analyze-video'
import { extractTranscript } from '@/inngest/functions/extract-transcript'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeVideo, extractTranscript],
})

