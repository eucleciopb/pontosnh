import {
  LayoutDashboard,
  Users,
  Ticket,
  Coins,
  Gift,
  Megaphone,
  ArrowLeftRight,
  BarChart3,
  Settings,
  UserCog,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'

export const ADMIN_ROUTES = {
  login: '/admin/login',
  dashboard: '/admin',
  customers: '/admin/clientes',
  coupons: '/admin/cupons',
  points: '/admin/pontos',
  rewards: '/admin/premios',
  campaigns: '/admin/campanhas',
  redemptions: '/admin/resgates',
  reports: '/admin/relatorios',
  settings: '/admin/configuracoes',
  users: '/admin/usuarios',
  logs: '/admin/logs',
} as const

export interface AdminNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  adminOnly?: boolean
  module?: number
}

export const ADMIN_NAV: AdminNavItem[] = [
  { to: ADMIN_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: ADMIN_ROUTES.customers, label: 'Clientes', icon: Users },
  { to: ADMIN_ROUTES.coupons, label: 'Cupons', icon: Ticket },
  { to: ADMIN_ROUTES.points, label: 'Pontos', icon: Coins },
  { to: ADMIN_ROUTES.rewards, label: 'Prêmios', icon: Gift },
  { to: ADMIN_ROUTES.campaigns, label: 'Campanhas', icon: Megaphone },
  { to: ADMIN_ROUTES.redemptions, label: 'Resgates', icon: ArrowLeftRight },
  { to: ADMIN_ROUTES.reports, label: 'Relatórios', icon: BarChart3 },
  { to: ADMIN_ROUTES.settings, label: 'Configurações', icon: Settings, adminOnly: true },
  { to: ADMIN_ROUTES.users, label: 'Usuários', icon: UserCog, adminOnly: true },
  { to: ADMIN_ROUTES.logs, label: 'Logs', icon: ScrollText, adminOnly: true },
]
