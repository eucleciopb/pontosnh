import type { LucideIcon } from 'lucide-react'
import { cn, formatCurrency, formatPoints } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { label: string; positive?: boolean }
  accent?: 'green' | 'red' | 'white'
  className?: string
}

const accentStyles = {
  green: 'bg-nh-green-100 text-nh-green-700 border border-nh-green-200',
  red: 'bg-nh-red-100 text-nh-red-700 border border-nh-red-200',
  white: 'bg-white text-nh-green-700 border border-nh-green-200',
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = 'green',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-nh-green-200 bg-white p-5 shadow-sm transition hover:shadow-nh',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-nh-green-700">{title}</p>
          <p className="mt-1 truncate text-2xl font-bold text-nh-green-900 sm:text-3xl">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-nh-green-600">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                trend.positive ? 'text-nh-green-600' : 'text-nh-red-600',
              )}
            >
              {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            accentStyles[accent],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

export function formatStatPoints(value: number) {
  return formatPoints(value)
}

export function formatStatCurrency(value: number) {
  return formatCurrency(value)
}
