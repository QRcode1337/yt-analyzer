'use client'

import { cn } from '@/lib/utils'

interface PillTabsProps {
  tabs: Array<{
    id: string
    label: string
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function PillTabs({ tabs, activeTab, onTabChange, className }: PillTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

