import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionHeaderProps {
  label?: string
  title: string
  subtitle?: string
  className?: string
  children?: ReactNode
}

export function SectionHeader({
  label,
  title,
  subtitle,
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {label}
        </p>
      )}
      <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
      {children}
    </div>
  )
}

