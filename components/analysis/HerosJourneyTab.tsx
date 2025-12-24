import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { HeroJourney } from '@/lib/schemas/analysis-schemas'

interface HerosJourneyTabProps {
  data?: HeroJourney
}

export function HerosJourneyTab({ data }: HerosJourneyTabProps) {
  if (!data || !data.beats) {
    return <Card>No Hero's Journey data available</Card>
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="HERO'S JOURNEY"
        title="A Breakdown of Narrative Structure"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.beats.map((beat) => (
          <Card key={beat.number} className="relative">
            <div className="absolute top-4 right-4 text-2xl font-bold text-gray-300">
              {beat.number.toString().padStart(2, '0')}
            </div>
            {beat.icon && (
              <div className="text-3xl mb-3">{beat.icon}</div>
            )}
            <h3 className="text-lg font-semibold mb-2">{beat.title}</h3>
            {beat.subtitle && (
              <p className="text-sm text-gray-600 mb-2">{beat.subtitle}</p>
            )}
            <p className="text-sm text-gray-700 mb-3">{beat.description}</p>
            {beat.timeRange && (
              <p className="text-xs text-gray-500">
                {beat.timeRange.start} - {beat.timeRange.end}
              </p>
            )}
            {beat.bullets && beat.bullets.length > 0 && (
              <ul className="mt-3 space-y-1">
                {beat.bullets.map((bullet, i) => (
                  <li key={i} className="text-xs text-gray-600 list-disc list-inside">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

