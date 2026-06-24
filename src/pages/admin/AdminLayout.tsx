import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminSidebar } from '@/features/admin/components/AdminSidebar'
import { ADMIN_ROUTES } from '@/features/admin/constants'
import { useAuth } from '@/hooks/useAuth'

export function AdminLayout() {
  const { isLoading, isStaff, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nh-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
      </div>
    )
  }

  if (!isStaff) {
    return <Navigate to={ADMIN_ROUTES.login} replace />
  }

  return (
    <div className="flex min-h-screen bg-nh-gray-100">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-nh-gray-200 bg-white px-4 py-3 lg:px-6">
          <button
            type="button"
            className="rounded-xl border border-nh-gray-200 p-2.5 text-nh-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <p className="hidden text-sm font-medium text-nh-gray-600 lg:block">
            Painel Administrativo — NH+ Clube
          </p>

          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
