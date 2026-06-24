import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumericKeypadProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  className?: string
}

export function NumericKeypad({
  value,
  onChange,
  maxLength = 11,
  className,
}: NumericKeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  const handleKey = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1))
      return
    }
    if (!key || value.length >= maxLength) return
    onChange(value + key)
  }

  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {keys.map((key, index) => {
        if (key === '') {
          return <div key={`empty-${index}`} aria-hidden="true" />
        }

        if (key === 'del') {
          return (
            <button
              key="del"
              type="button"
              onClick={() => handleKey('del')}
              className="flex h-16 items-center justify-center rounded-2xl border-2 border-nh-gray-200 bg-white text-nh-gray-700 transition active:scale-95 active:bg-nh-gray-100 sm:h-20"
              aria-label="Apagar"
            >
              <Delete className="h-6 w-6" />
            </button>
          )
        }

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleKey(key)}
            disabled={value.length >= maxLength}
            className="flex h-16 items-center justify-center rounded-2xl border-2 border-nh-gray-200 bg-white text-2xl font-semibold text-nh-gray-900 transition hover:border-nh-green-300 active:scale-95 active:bg-nh-green-50 disabled:opacity-40 sm:h-20 sm:text-3xl"
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}
