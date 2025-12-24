import { Card } from '@/components/ui/Card'
import { BadgePill } from '@/components/ui/BadgePill'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { TitleDecode } from '@/lib/schemas/analysis-schemas'

interface TitleDecodeTabProps {
  data?: TitleDecode
}

export function TitleDecodeTab({ data }: TitleDecodeTabProps) {
  if (!data) {
    return <Card>No Title Decode data available</Card>
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="TITLE DECODE"
        title={data.corePattern}
      />

      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Core Pattern</h3>
            <p className="text-sm text-gray-700 mb-4">{data.explanation}</p>
          </div>
          {data.badge && (
            <BadgePill label={data.badge} variant="purple" />
          )}
        </div>

        {data.formula && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-mono text-gray-900">{data.formula}</p>
          </div>
        )}

        {data.keywords && data.keywords.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((keyword, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <ScoreBar score={data.seoScore} label="SEO POTENTIAL" />
          {data.seoAnalysis && (
            <p className="text-sm text-gray-600 mt-2">{data.seoAnalysis}</p>
          )}
        </div>

        {data.remixes && data.remixes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Example Remixes</h4>
            <ul className="space-y-2">
              {data.remixes.map((remix, i) => (
                <li key={i} className="text-sm text-gray-600 list-disc list-inside">
                  {remix}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}

