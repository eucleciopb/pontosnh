import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom'
import { Loader2, LogOut, Receipt, Ticket, Zap } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { PDV_ROUTES } from '@/features/pdv/constants'
import { cn } from '@/lib/utils'

const navItems = [
  { to: PDV_ROUTES.sale, label: 'Caixa integrado', icon: Zap },
  { to: PDV_ROUTES.home, label: 'Gerar cupom', icon: Ticket },
  { to: PDV_ROUTES.coupons, label: 'Cupons', icon: Receipt },
] as const

export function PdvProtectedLayout() {
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
      <header className="border-b border-nh-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo size="sm" />
          <div className="text-right">
            <p className="text-sm font-medium text-nh-gray-900">{profile?.full_name}</p>
            <p className="text-xs capitalize text-nh-gray-500">{profile?.role}</p>
          </div>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-1 px-4 pb-2 sm:px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === PDV_ROUTES.home}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-nh-green-600 text-white'
                    : 'text-nh-gray-600 hover:bg-nh-gray-100',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-nh-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl justify-end">
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </footer>
    </div>
  )
}
