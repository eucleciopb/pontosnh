import { subDays, format, parseISO, startOfDay } from 'date-fns'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'

function assertSupabase() {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado.')
}

export interface DashboardStats {
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  totalCoupons: number
  pendingCoupons: number
  usedCoupons: number
  expiredCoupons: number
  totalPointsIssued: number
  totalRedemptions: number
  avgTicket: number
}

export interface DailyCouponChart {
  date: string
  label: string
  generated: number
  used: number
}

export interface DailyPointsChart {
  date: string
  label: string
  earned: number
  redeemed: number
}

export interface LevelDistribution {
  name: string
  value: number
  color: string
}

export interface CouponStatusChart {
  name: string
  value: number
  color: string
}

export interface DashboardChartData {
  couponsDaily: DailyCouponChart[]
  pointsDaily: DailyPointsChart[]
  levelDistribution: LevelDistribution[]
  couponStatus: CouponStatusChart[]
}

const STATUS_COLORS: Record<string, string> = {
  Pendente: '#8FD4A8',
  Utilizado: '#00843D',
  Expirado: '#C8102E',
  Cancelado: '#A50D26',
}

function buildDateRange(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = subDays(new Date(), days - 1 - i)
    return format(startOfDay(d), 'yyyy-MM-dd')
  })
}

export async function getDashboardStats(): Promise<DashboardStats> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client.from('v_dashboard_stats').select('*').single()

  if (error) throw new Error(error.message)

  return {
    totalCustomers: data.total_customers ?? 0,
    activeCustomers: data.active_customers ?? 0,
    inactiveCustomers: data.inactive_customers ?? 0,
    totalCoupons: data.total_coupons ?? 0,
    pendingCoupons: data.pending_coupons ?? 0,
    usedCoupons: data.used_coupons ?? 0,
    expiredCoupons: data.expired_coupons ?? 0,
    totalPointsIssued: data.total_points_issued ?? 0,
    totalRedemptions: data.total_redemptions ?? 0,
    avgTicket: Number(data.avg_ticket ?? 0),
  }
}

export async function getDashboardCharts(days = 7): Promise<DashboardChartData> {
  assertSupabase()
  const client = getSupabase()
  const since = subDays(new Date(), days).toISOString()
  const dateRange = buildDateRange(days)

  const [couponsRes, transactionsRes, customersRes, levelsRes] = await Promise.all([
    client
      .from('coupons')
      .select('created_at, status, used_at')
      .gte('created_at', since),
    client
      .from('point_transactions')
      .select('created_at, type, points')
      .gte('created_at', since),
    client.from('customers').select('level_id'),
    client.from('levels').select('id, name, color, sort_order').order('sort_order'),
  ])

  if (couponsRes.error) throw new Error(couponsRes.error.message)
  if (transactionsRes.error) throw new Error(transactionsRes.error.message)
  if (customersRes.error) throw new Error(customersRes.error.message)
  if (levelsRes.error) throw new Error(levelsRes.error.message)

  const coupons = couponsRes.data ?? []
  const transactions = transactionsRes.data ?? []
  const customers = customersRes.data ?? []
  const levels = levelsRes.data ?? []

  const couponsDaily: DailyCouponChart[] = dateRange.map((date) => {
    const generated = coupons.filter(
      (c) => format(startOfDay(parseISO(c.created_at)), 'yyyy-MM-dd') === date,
    ).length
    const used = coupons.filter(
      (c) =>
        c.used_at &&
        format(startOfDay(parseISO(c.used_at)), 'yyyy-MM-dd') === date,
    ).length
    return {
      date,
      label: format(parseISO(date), 'dd/MM'),
      generated,
      used,
    }
  })

  const pointsDaily: DailyPointsChart[] = dateRange.map((date) => {
    const dayTx = transactions.filter(
      (t) => format(startOfDay(parseISO(t.created_at)), 'yyyy-MM-dd') === date,
    )
    const earned = dayTx
      .filter((t) => t.type === 'earn' || t.type === 'campaign_bonus')
      .reduce((sum, t) => sum + Math.abs(t.points), 0)
    const redeemed = dayTx
      .filter((t) => t.type === 'redeem')
      .reduce((sum, t) => sum + Math.abs(t.points), 0)
    return { date, label: format(parseISO(date), 'dd/MM'), earned, redeemed }
  })

  const levelCounts = new Map<string, number>()
  for (const level of levels) {
    levelCounts.set(level.id, 0)
  }
  let noLevel = 0
  for (const c of customers) {
    if (c.level_id && levelCounts.has(c.level_id)) {
      levelCounts.set(c.level_id, (levelCounts.get(c.level_id) ?? 0) + 1)
    } else {
      noLevel++
    }
  }

  const levelDistribution: LevelDistribution[] = levels.map((l) => ({
    name: l.name,
    value: levelCounts.get(l.id) ?? 0,
    color: l.color,
  }))
  if (noLevel > 0) {
    levelDistribution.push({ name: 'Sem nível', value: noLevel, color: '#8FD4A8' })
  }

  // Status chart — todos os cupons
  const allCouponsRes = await client.from('coupons').select('status')
  if (allCouponsRes.error) throw new Error(allCouponsRes.error.message)
  const allCoupons = allCouponsRes.data ?? []

  const couponStatus: CouponStatusChart[] = [
    { name: 'Pendente', value: allCoupons.filter((c) => c.status === 'pending').length, color: STATUS_COLORS.Pendente },
    { name: 'Utilizado', value: allCoupons.filter((c) => c.status === 'used').length, color: STATUS_COLORS.Utilizado },
    { name: 'Expirado', value: allCoupons.filter((c) => c.status === 'expired').length, color: STATUS_COLORS.Expirado },
    { name: 'Cancelado', value: allCoupons.filter((c) => c.status === 'cancelled').length, color: STATUS_COLORS.Cancelado },
  ].filter((s) => s.value > 0)

  return { couponsDaily, pointsDaily, levelDistribution, couponStatus }
}
