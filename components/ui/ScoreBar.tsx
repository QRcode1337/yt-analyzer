import { cn } from '@/lib/utils'

interface ScoreBarProps {
  score: number
  maxScore?: number
  label?: string
  className?: string
}

export function ScoreBar({ score, maxScore = 100, label, className }: ScoreBarProps) {
  const percentage = Math.min((score / maxScore) * 100, 100)

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-600">
            {score}/{maxScore}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

