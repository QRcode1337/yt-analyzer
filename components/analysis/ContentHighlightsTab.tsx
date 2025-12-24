import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ContentHighlights } from '@/lib/schemas/analysis-schemas'

interface ContentHighlightsTabProps {
  data?: ContentHighlights
}

export function ContentHighlightsTab({ data }: ContentHighlightsTabProps) {
  if (!data || !data.highlights) {
    return <Card>No Content Highlights data available</Card>
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="CONTENT HIGHLIGHTS"
        title="Key Moments & Quotes"
      />

      <div className="space-y-4">
        {data.highlights.map((highlight, i) => (
          <Card key={i}>
            <div className="flex items-start gap-4">
              <span className="font-mono text-sm text-gray-500 min-w-[60px]">
                {highlight.timestamp}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{highlight.title}</h3>
                <p className="text-sm text-gray-700">{highlight.description}</p>
                {highlight.type && (
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {highlight.type}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

