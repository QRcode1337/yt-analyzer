import { cn } from '@/lib/utils'

interface BadgePillProps {
  label: string
  variant?: 'default' | 'purple' | 'green' | 'yellow'
  className?: string
}

export function BadgePill({ label, variant = 'default', className }: BadgePillProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  )
}

