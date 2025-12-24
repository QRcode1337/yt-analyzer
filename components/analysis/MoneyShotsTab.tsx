import { Card } from '@/components/ui/Card'
import { BadgePill } from '@/components/ui/BadgePill'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { MoneyShots } from '@/lib/schemas/analysis-schemas'

interface MoneyShotsTabProps {
  data?: MoneyShots
}

export function MoneyShotsTab({ data }: MoneyShotsTabProps) {
  if (!data) {
    return <Card>No Money Shots data available</Card>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.estimatedRevenue.currency || 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="ESTIMATED AD REVENUE"
        title={formatCurrency(data.estimatedRevenue.amount)}
        subtitle={data.estimatedRevenue.description}
      />

      {/* CPM Info */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">CPM Analysis</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Category: <span className="font-semibold">{data.cpm.category}</span>
          </p>
          <p className="text-sm text-gray-600">
            Range: ${data.cpm.range.min} - ${data.cpm.range.max} per thousand views
          </p>
          {data.cpm.description && (
            <p className="text-sm text-gray-700 mt-2">{data.cpm.description}</p>
          )}
        </div>
      </Card>

      {/* Revenue Projections */}
      {data.revenueProjections && data.revenueProjections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.revenueProjections.map((projection, i) => (
            <Card key={i}>
              <h3 className="text-lg font-semibold mb-2">{projection.type}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(projection.range.min)} - {formatCurrency(projection.range.max)}
              </p>
              {projection.description && (
                <p className="text-sm text-gray-600">{projection.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Breakpoints */}
      {data.breakpoints && data.breakpoints.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Natural Breakpoint Design</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use these narrative pauses for seamless mid-rolls.
          </p>
          <div className="space-y-4">
            {data.breakpoints.map((breakpoint, i) => (
              <div key={i} className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-gray-600">@{breakpoint.timestamp}</span>
                  <BadgePill label={breakpoint.type} variant="default" />
                </div>
                {breakpoint.quote && (
                  <p className="text-sm text-gray-700 italic mb-1">"{breakpoint.quote}"</p>
                )}
                {breakpoint.description && (
                  <p className="text-sm text-gray-600">{breakpoint.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Placements */}
      {data.placements && data.placements.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Product Placement Craft</h3>
          <div className="space-y-4">
            {data.placements.map((placement, i) => (
              <div key={i} className="border-l-4 border-purple-300 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-gray-600">@{placement.timestamp}</span>
                  {placement.tag && (
                    <BadgePill label={placement.tag} variant="purple" />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{placement.content}</p>
                <p className="text-sm text-gray-700 mb-1">{placement.description}</p>
                {placement.insight && (
                  <p className="text-xs text-gray-600 italic">{placement.insight}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sponsor Magnetism */}
      {data.sponsorMagnetism && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.sponsorMagnetism.audienceSignals && (
            <Card>
              <h4 className="text-sm font-semibold text-green-700 mb-2">
                HIGH-VALUE AUDIENCE SIGNALS
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {data.sponsorMagnetism.audienceSignals.map((signal, i) => (
                  <li key={i} className="list-disc list-inside">{signal}</li>
                ))}
              </ul>
            </Card>
          )}
          {data.sponsorMagnetism.authorityCredentials && (
            <Card>
              <h4 className="text-sm font-semibold text-green-700 mb-2">
                AUTHORITY CREDENTIALS
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {data.sponsorMagnetism.authorityCredentials.map((cred, i) => (
                  <li key={i} className="list-disc list-inside">{cred}</li>
                ))}
              </ul>
            </Card>
          )}
          {data.sponsorMagnetism.verticalDepth && (
            <Card>
              <h4 className="text-sm font-semibold text-green-700 mb-2">
                VERTICAL DEPTH
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {data.sponsorMagnetism.verticalDepth.map((depth, i) => (
                  <li key={i} className="list-disc list-inside">{depth}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

