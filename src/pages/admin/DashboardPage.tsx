import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeftRight,
  Gift,
  Loader2,
  Ticket,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  Coins,
} from 'lucide-react'
import { StatCard, formatStatCurrency, formatStatPoints } from '@/features/admin/components/StatCard'
import { DashboardCharts } from '@/features/admin/components/DashboardCharts'
import { getDashboardCharts, getDashboardStats } from '@/services/admin.service'
import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const { profile } = useAuth()

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 1000 * 60,
  })

  const chartsQuery = useQuery({
    queryKey: ['admin-charts'],
    queryFn: () => getDashboardCharts(7),
    refetchInterval: 1000 * 60,
  })

  const isLoading = statsQuery.isLoading || chartsQuery.isLoading
  const error = statsQuery.error ?? chartsQuery.error

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-nh-green-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-nh-red-50 p-6 text-center text-nh-red-700">
        {(error as Error).message}
      </div>
    )
  }

  const stats = statsQuery.data!
  const charts = chartsQuery.data!

  const conversionRate =
    stats.totalCoupons > 0
      ? Math.round((stats.usedCoupons / stats.totalCoupons) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nh-gray-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-nh-gray-600">
          Olá, {profile?.full_name}. Visão geral do NH Clube +.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Clientes"
          value={formatStatPoints(stats.totalCustomers)}
          subtitle={`${formatStatPoints(stats.activeCustomers)} ativos`}
          icon={Users}
          accent="green"
        />
        <StatCard
          title="Clientes ativos"
          value={formatStatPoints(stats.activeCustomers)}
          icon={UserCheck}
          accent="red"
        />
        <StatCard
          title="Clientes inativos"
          value={formatStatPoints(stats.inactiveCustomers)}
          icon={UserX}
          accent="white"
        />
        <StatCard
          title="Ticket médio"
          value={formatStatCurrency(stats.avgTicket)}
          subtitle="Compras com cupom utilizado"
          icon={TrendingUp}
          accent="red"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Cupons"
          value={formatStatPoints(stats.totalCoupons)}
          subtitle={`${formatStatPoints(stats.pendingCoupons)} pendentes`}
          icon={Ticket}
          accent="white"
        />
        <StatCard
          title="Cupons utilizados"
          value={formatStatPoints(stats.usedCoupons)}
          trend={{ label: `${conversionRate}% de conversão`, positive: conversionRate > 50 }}
          icon={Ticket}
          accent="green"
        />
        <StatCard
          title="Pontos emitidos"
          value={formatStatPoints(stats.totalPointsIssued)}
          icon={Coins}
          accent="green"
        />
        <StatCard
          title="Resgates"
          value={formatStatPoints(stats.totalRedemptions)}
          icon={ArrowLeftRight}
          accent="red"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Cupons expirados"
          value={formatStatPoints(stats.expiredCoupons)}
          icon={Ticket}
          accent="red"
        />
        <StatCard
          title="Prêmios resgatados"
          value={formatStatPoints(stats.totalRedemptions)}
          icon={Gift}
          accent="red"
        />
        <StatCard
          title="Taxa de conversão"
          value={`${conversionRate}%`}
          subtitle="Cupons utilizados / gerados"
          icon={TrendingUp}
          accent={conversionRate >= 50 ? 'green' : 'red'}
        />
      </div>

      <DashboardCharts data={charts} />
    </div>
  )
}
