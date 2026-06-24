import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info'
  className?: string
}

const variantStyles = {
  success: 'bg-nh-green-100 text-nh-green-800 border border-nh-green-200',
  warning: 'bg-nh-red-100 text-nh-red-800 border border-nh-red-200',
  error: 'bg-nh-red-200 text-nh-red-900 border border-nh-red-300',
  neutral: 'bg-white text-nh-green-800 border border-nh-green-200',
  info: 'bg-nh-green-50 text-nh-green-700 border border-nh-green-300',
}

export function Badge({
  children,
  variant = 'neutral',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
