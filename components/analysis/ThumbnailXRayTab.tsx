import { Card } from '@/components/ui/Card'
import { BadgePill } from '@/components/ui/BadgePill'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ThumbnailXRay } from '@/lib/schemas/analysis-schemas'

interface ThumbnailXRayTabProps {
  data?: ThumbnailXRay
}

export function ThumbnailXRayTab({ data }: ThumbnailXRayTabProps) {
  if (!data) {
    return <Card>No Thumbnail X-Ray data available</Card>
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="THUMBNAIL X-RAY"
        title={data.composition}
      />

      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Composition</h3>
            <p className="text-sm text-gray-700 mb-4">{data.description}</p>
          </div>
          {data.badge && (
            <BadgePill label={data.badge} variant="purple" />
          )}
        </div>

        {data.elements && data.elements.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Visual Elements</h4>
            <div className="flex flex-wrap gap-2">
              {data.elements.map((element, i) => (
                <BadgePill key={i} label={element} variant="default" />
              ))}
            </div>
          </div>
        )}

        {data.layout && (
          <div className="mb-4">
            <BadgePill label={data.layout} variant="default" />
            {data.hasText !== undefined && (
              <BadgePill
                label={data.hasText ? 'Has Text' : 'No Text'}
                variant="default"
                className="ml-2"
              />
            )}
          </div>
        )}

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Promise</h4>
          <p className="text-sm text-gray-700">{data.promise}</p>
        </div>

        {data.emotionalImpact && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Emotional Impact</h4>
            <p className="text-sm text-gray-700">{data.emotionalImpact}</p>
          </div>
        )}

        {data.improvements && data.improvements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Improvements</h4>
            <ul className="space-y-1">
              {data.improvements.map((improvement, i) => (
                <li key={i} className="text-sm text-gray-600 list-disc list-inside">
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}

