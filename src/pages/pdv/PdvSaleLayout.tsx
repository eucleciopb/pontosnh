import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2, LogOut } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { PDV_ROUTES, LOTHUS_PDV_NAME } from '@/features/pdv/constants'

/** Layout minimalista para integração com o caixa — sem menu de navegação. */
export function PdvSaleLayout() {
  const { isLoading, isStaff, profile, signOut } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
      </div>
    )
  }

  if (!isStaff) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${PDV_ROUTES.login}?redirect=${redirect}`} replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-nh-gray-100">
      <header className="border-b border-nh-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <Logo size="sm" />
            <p className="mt-1 text-xs text-nh-gray-500">Integração {LOTHUS_PDV_NAME}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-nh-gray-600">{profile?.full_name}</p>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
