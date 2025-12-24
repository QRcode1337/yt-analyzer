import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { EmotionDecoder } from '@/lib/schemas/analysis-schemas'

interface EmotionTabProps {
  data?: EmotionDecoder
}

export function EmotionTab({ data }: EmotionTabProps) {
  if (!data) {
    return <Card>No emotion data available</Card>
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="EMOTION DECODER"
        title="Emotion-Driven Narrative Analysis"
        subtitle={data.description}
      />

      {/* Core Emotion Shift */}
      <Card className="bg-gray-50">
        <div className="inline-block px-3 py-1 bg-gray-200 rounded-full text-xs font-semibold text-gray-700 mb-3">
          CORE EMOTION SHIFT
        </div>
        <p className="text-xl font-bold text-gray-900">
          "{data.coreShift.from}" → "{data.coreShift.to}"
        </p>
      </Card>

      {/* Emotion Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.pillars.map((pillar, i) => (
          <Card key={i}>
            {pillar.icon && (
              <div className="text-3xl mb-3">{pillar.icon}</div>
            )}
            <h3 className="text-lg font-semibold mb-2">{pillar.title}</h3>
            <p className="text-sm text-gray-700">{pillar.description}</p>
            {pillar.timeRange && (
              <p className="text-xs text-gray-500 mt-2">
                {pillar.timeRange.start} - {pillar.timeRange.end}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

