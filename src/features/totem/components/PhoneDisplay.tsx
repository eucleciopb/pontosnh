import { formatPhoneDisplay } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PhoneDisplayProps {
  phone: string
  className?: string
}

export function PhoneDisplay({ phone, className }: PhoneDisplayProps) {
  const display = phone ? formatPhoneDisplay(phone) : '(  )       -    '

  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-nh-green-200 bg-white px-6 py-5 text-center',
        className,
      )}
      aria-live="polite"
      aria-label={`Telefone: ${phone ? formatPhoneDisplay(phone) : 'vazio'}`}
    >
      <p className="text-sm font-medium text-nh-gray-500">Telefone</p>
      <p className="mt-1 font-mono text-3xl font-bold tracking-wide text-nh-gray-900 sm:text-4xl">
        {display}
      </p>
    </div>
  )
}
