import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { FullArticle } from '@/lib/schemas/analysis-schemas'

interface FullArticleTabProps {
  data?: FullArticle
}

export function FullArticleTab({ data }: FullArticleTabProps) {
  if (!data) {
    return <Card>No Full Article data available</Card>
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="FULL ARTICLE"
        title="Complete Analysis Breakdown"
      />

      <Card>
        {data.markdown ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: data.markdown
                .replace(/\n/g, '<br />')
                .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
                .replace(/#{2}\s(.+)/g, '<h2>$1</h2>')
                .replace(/#{1}\s(.+)/g, '<h1>$1</h1>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>'),
            }}
          />
        ) : data.sections ? (
          <div className="space-y-6">
            {data.sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                <div
                  className="prose prose-sm text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: section.content.replace(/\n/g, '<br />'),
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No article content available</p>
        )}
      </Card>
    </div>
  )
}

