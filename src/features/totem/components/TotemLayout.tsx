import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'
import { TOTEM_ROUTES } from '@/features/totem/constants'

interface TotemLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showBack?: boolean
  backTo?: string
  onBack?: () => void
  progress?: React.ReactNode
  className?: string
}

export function TotemLayout({
  children,
  title,
  subtitle,
  showBack = false,
  backTo,
  onBack,
  progress,
  className,
}: TotemLayoutProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="totem-page-bg flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-nh-green-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-nh-green-200 bg-white text-nh-green-700 transition hover:border-nh-green-400 hover:bg-nh-green-50"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <Logo size="sm" showSubtitle={false} />
          </div>

          <Link
            to={TOTEM_ROUTES.home}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-nh-green-200 bg-white text-nh-green-600 transition hover:border-nh-green-400 hover:bg-nh-green-50"
            aria-label="Início do totem"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>

        {progress && (
          <div className="border-t border-nh-green-100 bg-white px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-3xl">{progress}</div>
          </div>
        )}
      </header>

      <main className={cn('mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8', className)}>
        {(title || subtitle) && (
          <div className="mb-6 text-center sm:mb-8">
            {title && (
              <h1 className="text-balance text-2xl font-bold text-nh-green-900 sm:text-3xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 text-balance text-base text-nh-green-700 sm:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
