import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Badge } from '@/components/ui/Badge'
import { ADMIN_NAV } from '@/features/admin/constants'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const visibleNav = ADMIN_NAV.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-nh-green-900/40 lg:hidden"
          aria-label="Fechar menu"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-nh-gray-200 bg-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-nh-gray-100 px-4 py-4">
          <Logo size="sm" showSubtitle={false} />
          <button
            type="button"
            className="rounded-lg p-2 text-nh-gray-500 hover:bg-nh-gray-100 lg:hidden"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {visibleNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-nh-green-600 text-white'
                        : 'text-nh-gray-700 hover:bg-nh-gray-100',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {item.module && (
                    <Badge
                      variant="neutral"
                      className="hidden text-[10px] xl:inline-flex"
                    >
                      {item.module}
                    </Badge>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-nh-gray-100 p-4">
          <p className="truncate text-sm font-medium text-nh-gray-900">
            {profile?.full_name}
          </p>
          <p className="text-xs capitalize text-nh-gray-500">{profile?.role}</p>
        </div>
      </aside>
    </>
  )
}
