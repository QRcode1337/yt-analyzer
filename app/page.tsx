import Link from 'next/link'
import { Card } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            YouTube Video Analyzer
          </h1>
          <p className="text-xl text-gray-600">
            Analyze YouTube videos with AI-powered insights
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
          <p className="text-gray-600 mb-6">
            Paste a YouTube URL to begin analyzing a video. You'll be able to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Extract video metadata and statistics</li>
            <li>Add or upload transcripts</li>
            <li>Generate comprehensive AI analysis</li>
            <li>View breakdowns across multiple dimensions</li>
            <li>Export episode blueprints for content creation</li>
          </ul>
          <Link
            href="/ingest"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Analyze a Video
          </Link>
        </Card>
      </div>
    </div>
  )
}

