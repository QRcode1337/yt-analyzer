import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StatPillProps {
  icon?: ReactNode
  value: string | number
  label?: string
  className?: string
}

export function StatPill({ icon, value, label, className }: StatPillProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg',
        className
      )}
    >
      {icon && <span className="text-gray-600">{icon}</span>}
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-900">{value}</span>
        {label && <span className="text-xs text-gray-500">{label}</span>}
      </div>
    </div>
  )
}

