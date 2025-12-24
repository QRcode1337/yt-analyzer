import { Card } from '@/components/ui/Card'
import { BadgePill } from '@/components/ui/BadgePill'
import { ScoreBar } from '@/components/ui/ScoreBar'
import type { Overview } from '@/lib/schemas/analysis-schemas'

interface OverviewTabProps {
  data?: Overview
}

export function OverviewTab({ data }: OverviewTabProps) {
  if (!data) {
    return <Card>No overview data available</Card>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title Decode Card */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Title Decode</h3>
              <p className="text-sm text-gray-600">{data.titleDecode.corePattern}</p>
            </div>
            {data.titleDecode.badge && (
              <BadgePill label={data.titleDecode.badge} variant="purple" />
            )}
          </div>
          <p className="text-sm text-gray-700 mb-4">{data.titleDecode.explanation}</p>
          {data.titleDecode.keywords && (
            <div className="flex flex-wrap gap-2 mb-4">
              {data.titleDecode.keywords.map((keyword, i) => (
                <span key={i} className="text-xs text-gray-600">
                  {keyword}
                </span>
              ))}
            </div>
          )}
          <ScoreBar
            score={data.titleDecode.seoScore}
            label="SEO POTENTIAL"
            className="mb-2"
          />
          <p className="text-sm text-gray-600">{data.titleDecode.seoAnalysis}</p>
        </Card>

        {/* Thumbnail X-Ray Card */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Thumbnail X-Ray</h3>
              <p className="text-sm text-gray-600">{data.thumbnailXRay.composition}</p>
            </div>
            {data.thumbnailXRay.badge && (
              <BadgePill label={data.thumbnailXRay.badge} variant="purple" />
            )}
          </div>
          <p className="text-sm text-gray-700 mb-4">{data.thumbnailXRay.description}</p>
          {data.thumbnailXRay.elements && (
            <div className="flex flex-wrap gap-2 mb-4">
              {data.thumbnailXRay.elements.map((element, i) => (
                <span key={i} className="text-xs text-gray-600">
                  {element}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-600">{data.thumbnailXRay.promise}</p>
        </Card>
      </div>

      {/* Hero's Journey Summary */}
      {data.herosJourneySummary && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Hero's Journey</h3>
          <p className="text-sm text-gray-600 mb-2">
            A Breakdown of {data.herosJourneySummary.keyPhrase || 'Narrative Structure'}
          </p>
          {data.herosJourneySummary.beats && (
            <div className="flex flex-wrap gap-2">
              {data.herosJourneySummary.beats.map((beat, i) => (
                <span key={i} className="text-xs text-gray-700">
                  {i + 1}. {beat}
                </span>
              ))}
            </div>
          )}
          {data.herosJourneySummary.timeMarker && (
            <p className="text-xs text-gray-500 mt-2">
              Key beat @ {data.herosJourneySummary.timeMarker}
            </p>
          )}
        </Card>
      )}
    </div>
  )
}

