import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-nh-gray-200 bg-white shadow-nh',
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn('mb-4', className)}>
      <h2 className="text-xl font-semibold text-nh-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-nh-gray-500">{description}</p>
      )}
    </div>
  )
}
