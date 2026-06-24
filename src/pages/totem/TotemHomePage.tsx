import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Coins,
  Gift,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { BRAND } from '@/lib/constants'
import { TOTEM_ROUTES } from '@/features/totem/constants'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    to: TOTEM_ROUTES.earn,
    label: 'Ganhar Pontos',
    description: 'Resgate seu cupom de compra',
    icon: Sparkles,
    color: 'from-nh-green-500 to-nh-green-700',
  },
  {
    to: TOTEM_ROUTES.balance,
    label: 'Consultar Saldo',
    description: 'Veja seus pontos acumulados',
    icon: Wallet,
    color: 'from-nh-green-600 to-nh-green-800',
  },
  {
    to: TOTEM_ROUTES.redeem,
    label: 'Trocar Pontos',
    description: 'Resgate prêmios exclusivos',
    icon: Gift,
    color: 'from-nh-red-500 to-nh-red-700',
  },
  {
    to: TOTEM_ROUTES.rewards,
    label: 'Ver Prêmios',
    description: 'Conheça as recompensas',
    icon: Coins,
    color: 'from-nh-red-600 to-nh-red-800',
  },
] as const

export function TotemHomePage() {
  return (
    <div className="totem-page-bg flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 self-start rounded-xl border border-nh-green-200 bg-white px-4 py-2 text-sm font-medium text-nh-green-700 shadow-sm transition hover:border-nh-green-400 hover:bg-nh-green-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Sair do totem
        </Link>

        <header className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-3xl border border-nh-green-100 bg-white p-4 shadow-nh-lg">
              <Logo size="lg" showSubtitle={false} />
            </div>
          </div>
          <h1 className="text-balance text-3xl font-bold text-nh-green-900 sm:text-5xl">
            Bem-vindo ao {BRAND.name}
          </h1>
          <p className="mt-3 text-lg text-nh-green-700 sm:text-xl">{BRAND.tagline}</p>
          <p className="mt-1 text-sm text-nh-green-600">{BRAND.company}</p>
        </header>

        <div className="grid flex-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <Link
                to={item.to}
                className={cn(
                  'group flex h-full min-h-[140px] flex-col justify-between rounded-3xl bg-gradient-to-br p-6 text-white shadow-nh-lg transition',
                  'hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]',
                  'sm:min-h-[180px] sm:p-8',
                  item.color,
                )}
              >
                <item.icon
                  className="h-10 w-10 opacity-90 transition group-hover:scale-110 sm:h-12 sm:w-12"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">{item.label}</h2>
                  <p className="mt-1 text-sm text-white/80 sm:text-base">
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-nh-green-600">
          Toque em uma opção para começar
        </p>
      </div>
    </div>
  )
}
