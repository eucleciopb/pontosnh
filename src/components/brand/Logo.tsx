import { Pill, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME, COMPANY_NAME } from '@/lib/constants'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  className?: string
}

const sizeStyles = {
  sm: { icon: 'h-8 w-8', title: 'text-lg', subtitle: 'text-xs' },
  md: { icon: 'h-10 w-10', title: 'text-2xl', subtitle: 'text-sm' },
  lg: { icon: 'h-14 w-14', title: 'text-4xl', subtitle: 'text-base' },
}

export function Logo({ size = 'md', showSubtitle = true, className }: LogoProps) {
  const styles = sizeStyles[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-2xl bg-nh-green-600 text-white shadow-nh',
          size === 'sm' && 'h-10 w-10',
          size === 'md' && 'h-12 w-12',
          size === 'lg' && 'h-16 w-16',
        )}
        aria-hidden="true"
      >
        <Pill className={styles.icon} strokeWidth={1.75} />
        <Plus
          className={cn(
            'absolute -right-0.5 -top-0.5 rounded-full bg-nh-red-700 p-0.5',
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5',
          )}
          strokeWidth={3}
        />
      </div>
      <div>
        <p className={cn('font-bold leading-tight text-nh-green-700', styles.title)}>
          {APP_NAME}
        </p>
        {showSubtitle && (
          <p className={cn('text-nh-gray-500', styles.subtitle)}>{COMPANY_NAME}</p>
        )}
      </div>
    </div>
  )
}
