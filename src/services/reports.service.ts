import { subDays } from 'date-fns'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { getDashboardStats } from '@/services/admin.service'

function assertSupabase() {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado.')
}

export interface ReportSummary {
  totalCustomers: number
  activeCustomers: number
  totalCoupons: number
  usedCoupons: number
  expiredCoupons: number
  pendingCoupons: number
  cancelledCoupons: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  totalRedemptions: number
  avgTicket: number
  conversionRate: number
  redemptionRate: number
  roiEstimate: number
}

export interface TopCustomerRow {
  rank: number
  id: string
  name: string
  phone: string
  balance: number
  lifetimePoints: number
  level: string
  redemptions: number
  isActive: boolean
}

export interface TopRewardRow {
  rank: number
  id: string
  name: string
  category: string
  pointsRequired: number
  redemptionCount: number
  pointsSpent: number
}

export interface CouponReportRow {
  metric: string
  value: number
  percentage?: number
}

export interface FullReportData {
  summary: ReportSummary
  topCustomers: TopCustomerRow[]
  topByPoints: TopCustomerRow[]
  topRewards: TopRewardRow[]
  couponBreakdown: CouponReportRow[]
  generatedAt: string
}

export async function getFullReport(days = 30): Promise<FullReportData> {
  assertSupabase()
  const client = getSupabase()
  const since = subDays(new Date(), days).toISOString()

  const [stats, customersRes, redemptionsRes, rewardsRes, pointsRedeemedRes, allCouponsRes] =
    await Promise.all([
      getDashboardStats(),
      client
        .from('customers')
        .select('id, phone, first_name, last_name, balance_points, lifetime_points, is_active, levels(name)')
        .order('lifetime_points', { ascending: false })
        .limit(50),
      client
        .from('redemptions')
        .select('customer_id, reward_id, points_spent, rewards(name, category, points_required), customers(first_name, last_name, phone)')
        .eq('status', 'completed'),
      client.from('rewards').select('id, name, category, points_required'),
      client
        .from('point_transactions')
        .select('points')
        .eq('type', 'redeem'),
      client.from('coupons').select('status, created_at'),
    ])

  if (customersRes.error) throw new Error(customersRes.error.message)
  if (redemptionsRes.error) throw new Error(redemptionsRes.error.message)
  if (rewardsRes.error) throw new Error(rewardsRes.error.message)
  if (pointsRedeemedRes.error) throw new Error(pointsRedeemedRes.error.message)
  if (allCouponsRes.error) throw new Error(allCouponsRes.error.message)

  const customers = customersRes.data ?? []
  const redemptions = redemptionsRes.data ?? []
  const rewards = rewardsRes.data ?? []
  const allCoupons = allCouponsRes.data ?? []

  const totalPointsRedeemed = (pointsRedeemedRes.data ?? []).reduce(
    (sum, t) => sum + Math.abs(t.points),
    0,
  )

  const cancelledCoupons = allCoupons.filter((c) => c.status === 'cancelled').length
  const recentCoupons = allCoupons.filter((c) => c.created_at >= since).length

  const conversionRate =
    stats.totalCoupons > 0
      ? Math.round((stats.usedCoupons / stats.totalCoupons) * 1000) / 10
      : 0

  const redemptionRate =
    stats.totalPointsIssued > 0
      ? Math.round((totalPointsRedeemed / stats.totalPointsIssued) * 1000) / 10
      : 0

  // ROI estimado: pontos resgatados / pontos emitidos (% de engajamento)
  const roiEstimate = redemptionRate

  const redemptionCountByCustomer = new Map<string, number>()
  for (const r of redemptions) {
    redemptionCountByCustomer.set(
      r.customer_id,
      (redemptionCountByCustomer.get(r.customer_id) ?? 0) + 1,
    )
  }

  const mapCustomer = (
    c: (typeof customers)[0],
    rank: number,
  ): TopCustomerRow => ({
    rank,
    id: c.id,
    name: `${c.first_name} ${c.last_name}`,
    phone: c.phone,
    balance: c.balance_points,
    lifetimePoints: c.lifetime_points,
    level: (c.levels as unknown as { name: string } | null)?.name ?? '—',
    redemptions: redemptionCountByCustomer.get(c.id) ?? 0,
    isActive: c.is_active,
  })

  const topByPoints = customers
    .slice(0, 10)
    .map((c, i) => mapCustomer(c, i + 1))

  const topCustomers = [...customers]
    .sort(
      (a, b) =>
        (redemptionCountByCustomer.get(b.id) ?? 0) -
        (redemptionCountByCustomer.get(a.id) ?? 0),
    )
    .slice(0, 10)
    .map((c, i) => mapCustomer(c, i + 1))

  const rewardStats = new Map<string, { count: number; points: number }>()
  for (const r of redemptions) {
    const current = rewardStats.get(r.reward_id) ?? { count: 0, points: 0 }
    rewardStats.set(r.reward_id, {
      count: current.count + 1,
      points: current.points + r.points_spent,
    })
  }

  const topRewards: TopRewardRow[] = rewards
    .map((reward) => ({
      reward,
      stats: rewardStats.get(reward.id) ?? { count: 0, points: 0 },
    }))
    .sort((a, b) => b.stats.count - a.stats.count)
    .slice(0, 10)
    .map(({ reward, stats: s }, i) => ({
      rank: i + 1,
      id: reward.id,
      name: reward.name,
      category: reward.category ?? '—',
      pointsRequired: reward.points_required,
      redemptionCount: s.count,
      pointsSpent: s.points,
    }))

  const couponBreakdown: CouponReportRow[] = [
    { metric: 'Total gerados', value: stats.totalCoupons, percentage: 100 },
    {
      metric: 'Utilizados',
      value: stats.usedCoupons,
      percentage: stats.totalCoupons > 0 ? (stats.usedCoupons / stats.totalCoupons) * 100 : 0,
    },
    {
      metric: 'Pendentes',
      value: stats.pendingCoupons,
      percentage: stats.totalCoupons > 0 ? (stats.pendingCoupons / stats.totalCoupons) * 100 : 0,
    },
    {
      metric: 'Expirados',
      value: stats.expiredCoupons,
      percentage: stats.totalCoupons > 0 ? (stats.expiredCoupons / stats.totalCoupons) * 100 : 0,
    },
    {
      metric: 'Cancelados',
      value: cancelledCoupons,
      percentage: stats.totalCoupons > 0 ? (cancelledCoupons / stats.totalCoupons) * 100 : 0,
    },
    { metric: `Gerados (${days} dias)`, value: recentCoupons },
  ]

  return {
    summary: {
      totalCustomers: stats.totalCustomers,
      activeCustomers: stats.activeCustomers,
      totalCoupons: stats.totalCoupons,
      usedCoupons: stats.usedCoupons,
      expiredCoupons: stats.expiredCoupons,
      pendingCoupons: stats.pendingCoupons,
      cancelledCoupons,
      totalPointsIssued: stats.totalPointsIssued,
      totalPointsRedeemed,
      totalRedemptions: stats.totalRedemptions,
      avgTicket: stats.avgTicket,
      conversionRate,
      redemptionRate,
      roiEstimate,
    },
    topCustomers,
    topByPoints,
    topRewards,
    couponBreakdown,
    generatedAt: new Date().toISOString(),
  }
}
