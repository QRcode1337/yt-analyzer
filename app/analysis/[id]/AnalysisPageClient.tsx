'use client'

import { useState, useEffect } from 'react'
import { Prisma } from '@prisma/client'
import Image from 'next/image'
import type {
  Overview,
  HeroJourney,
  EmotionDecoder,
  MoneyShots,
  TitleDecode,
  ThumbnailXRay,
  ContentHighlights,
  FullArticle,
} from '@/lib/schemas/analysis-schemas'
import { PillTabs } from '@/components/ui/PillTabs'
import { Card } from '@/components/ui/Card'
import { StatPill } from '@/components/ui/StatPill'
import { OverviewTab } from '@/components/analysis/OverviewTab'
import { HerosJourneyTab } from '@/components/analysis/HerosJourneyTab'
import { EmotionTab } from '@/components/analysis/EmotionTab'
import { MoneyShotsTab } from '@/components/analysis/MoneyShotsTab'
import { TitleDecodeTab } from '@/components/analysis/TitleDecodeTab'
import { ThumbnailXRayTab } from '@/components/analysis/ThumbnailXRayTab'
import { ContentHighlightsTab } from '@/components/analysis/ContentHighlightsTab'
import { FullArticleTab } from '@/components/analysis/FullArticleTab'
import { TranscriptInput } from '@/components/TranscriptInput'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatNumber, formatDuration } from '@/lib/utils'
import { createSectionsMap } from '@/lib/utils/analysis'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'heros-journey', label: "Hero's Journey" },
  { id: 'emotion', label: 'Emotion Rollercoaster' },
  { id: 'money-shots', label: 'Money Shots' },
  { id: 'title-decode', label: 'Title Decode' },
  { id: 'thumbnail-xray', label: 'Thumbnail X-Ray' },
  { id: 'content-highlights', label: 'Content Highlights' },
  { id: 'full-article', label: 'Full Article' },
]

type AnalysisWithRelations = Prisma.AnalysisGetPayload<{
  include: {
    video: {
      include: {
        transcript: true
      }
    }
    sections: true
  }
}>

interface AnalysisPageClientProps {
  analysis: AnalysisWithRelations
}

export function AnalysisPageClient({ analysis }: AnalysisPageClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isRunning, setIsRunning] = useState(false)

  // Auto-poll for status updates if analysis is running with exponential backoff
  useEffect(() => {
    if (analysis.status !== 'RUNNING') return

    let pollInterval = 2000 // Start at 2 seconds
    const maxInterval = 10000 // Max 10 seconds
    const maxAttempts = 50 // Max ~5 minutes total
    let attempts = 0

    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.warn('Max polling attempts reached')
        return
      }

      attempts++

      try {
        const statusResponse = await fetch(`/api/analysis/${analysis.id}`)
        const data = await statusResponse.json()

        if (data.status === 'DONE' || data.status === 'FAILED') {
          router.refresh() // Refresh server-side data without full page reload
        } else {
          // Exponential backoff: 2s → 3s → 4.5s → 6.75s → 10s (max)
          pollInterval = Math.min(pollInterval * 1.5, maxInterval)
          setTimeout(poll, pollInterval)
        }
      } catch (error) {
        console.error('Error polling status:', error)
        // Retry with backoff on error
        pollInterval = Math.min(pollInterval * 2, maxInterval)
        setTimeout(poll, pollInterval)
      }
    }

    // Start first poll
    const timeoutId = setTimeout(poll, pollInterval)

    return () => clearTimeout(timeoutId)
  }, [analysis.id, analysis.status, router])

  const handleRunAnalysis = async () => {
    setIsRunning(true)
    try {
      const response = await fetch(`/api/analysis/${analysis.id}/run`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to start analysis')
      }
      // Trigger immediate refresh to show "RUNNING" status
      router.refresh()
    } catch (error) {
      console.error('Error running analysis:', error)
      setIsRunning(false)
    }
  }

  const sectionsMap = createSectionsMap(analysis.sections)

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={sectionsMap.get('OVERVIEW') as Overview | undefined} />
      case 'heros-journey':
        return <HerosJourneyTab data={sectionsMap.get('HEROS_JOURNEY') as HeroJourney | undefined} />
      case 'emotion':
        return <EmotionTab data={sectionsMap.get('EMOTION_ROLLERCOASTER') as EmotionDecoder | undefined} />
      case 'money-shots':
        return <MoneyShotsTab data={sectionsMap.get('MONEY_SHOTS') as MoneyShots | undefined} />
      case 'title-decode':
        return <TitleDecodeTab data={sectionsMap.get('TITLE_DECODE') as TitleDecode | undefined} />
      case 'thumbnail-xray':
        return <ThumbnailXRayTab data={sectionsMap.get('THUMBNAIL_XRAY') as ThumbnailXRay | undefined} />
      case 'content-highlights':
        return (
          <ContentHighlightsTab data={sectionsMap.get('CONTENT_HIGHLIGHTS') as ContentHighlights | undefined} />
        )
      case 'full-article':
        return <FullArticleTab data={sectionsMap.get('FULL_ARTICLE') as FullArticle | undefined} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 mb-4 inline-block"
          >
            ← Back
          </Link>

          <div className="flex gap-6 mb-6">
            {analysis.video.thumbnailUrl && (
              <div className="relative w-64 h-36 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={analysis.video.thumbnailUrl}
                  alt={analysis.video.title}
                  fill
                  sizes="256px"
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {analysis.video.title}
              </h1>
              <p className="text-gray-600 mb-4">{analysis.video.channel}</p>
              <a
                href={`https://youtube.com/watch?v=${analysis.video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Watch on YouTube ↗
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <StatPill
              icon="👁"
              value={`${formatNumber(analysis.video.viewCount)} VIEWS`}
            />
            <StatPill
              icon="👍"
              value={`${formatNumber(analysis.video.likeCount)} LIKES`}
            />
            <StatPill
              icon="💬"
              value={`${formatNumber(analysis.video.commentCount)} COMMENTS`}
            />
            <StatPill
              icon="⏱"
              value={`${formatDuration(analysis.video.duration)} RUNTIME`}
            />
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <PillTabs
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Transcript Input */}
          {!analysis.video.transcript && (
            <div className="mb-8">
              <TranscriptInput
                videoId={analysis.video.id}
                onTranscriptSaved={() => router.refresh()}
              />
            </div>
          )}

          {/* Analysis Status */}
          {analysis.status === 'PENDING' && analysis.video.transcript && (
            <div className="mb-6">
              <button
                onClick={handleRunAnalysis}
                disabled={isRunning}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {isRunning ? 'Running Analysis...' : 'Run Analysis'}
              </button>
            </div>
          )}

          {analysis.status === 'RUNNING' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700">Analysis in progress...</p>
            </div>
          )}

          {analysis.status === 'FAILED' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">Analysis failed: {analysis.error}</p>
            </div>
          )}

          {/* Export Button */}
          {analysis.status === 'DONE' && (
            <div className="mb-6">
              <a
                href={`/api/analysis/${analysis.id}/export`}
                download
                className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Export Blueprint
              </a>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {analysis.status === 'DONE' && renderTabContent()}
        {analysis.status !== 'DONE' && (
          <Card>
            <p className="text-gray-600">
              {analysis.status === 'PENDING'
                ? 'Add a transcript and run analysis to see results.'
                : 'Analysis in progress...'}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

