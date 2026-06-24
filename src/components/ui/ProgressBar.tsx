import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  className?: string
  colorClass?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  className,
  colorClass = 'bg-nh-green-600',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label && <span className="font-medium text-nh-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-nh-gray-500">{percentage}%</span>
          )}
        </div>
      )}
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-nh-gray-200"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
