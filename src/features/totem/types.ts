import type {
  Reward,
  TotemLookupResult,
  TotemRedeemResult,
} from '@/types/database'

export type TotemFlow = 'earn' | 'balance' | 'redeem' | 'rewards'

export interface CustomerProfile {
  found: boolean
  message?: string
  customerId?: string
  firstName?: string
  lastName?: string
  fullName?: string
  balance?: number
  lifetimePoints?: number
  levelName?: string
  levelColor?: string
  nextLevelName?: string
  pointsToNextLevel?: number | null
  nextLevelMinPoints?: number | null
}

export interface RedeemRewardResult {
  success: boolean
  message: string
  rewardName?: string
  pointsSpent?: number
  balance?: number
  redemptionId?: string
  nextAvailableAt?: string
}

export interface RewardCooldown {
  rewardId: string
  lastRedeemedAt: string | null
  nextAvailableAt: string | null
  onCooldown: boolean
}

export function mapLookupResult(data: TotemLookupResult): CustomerProfile {
  return {
    found: data.found,
    customerId: data.customer_id,
    firstName: data.first_name,
    lastName: data.last_name,
    fullName:
      data.first_name && data.last_name
        ? `${data.first_name} ${data.last_name}`
        : undefined,
    balance: data.balance,
    levelName: data.level_name,
  }
}

export function mapProfileResult(data: Record<string, unknown>): CustomerProfile {
  return {
    found: Boolean(data.found),
    message: data.message as string | undefined,
    customerId: data.customer_id as string | undefined,
    firstName: data.first_name as string | undefined,
    lastName: data.last_name as string | undefined,
    fullName: data.full_name as string | undefined,
    balance: data.balance as number | undefined,
    lifetimePoints: data.lifetime_points as number | undefined,
    levelName: data.level_name as string | undefined,
    levelColor: data.level_color as string | undefined,
    nextLevelName: data.next_level_name as string | undefined,
    pointsToNextLevel: data.points_to_next_level as number | null | undefined,
    nextLevelMinPoints: data.next_level_min_points as number | null | undefined,
  }
}

export function mapRedeemCouponResult(data: TotemRedeemResult): TotemRedeemResult {
  return data
}

export function mapRedeemRewardResult(data: Record<string, unknown>): RedeemRewardResult {
  return {
    success: Boolean(data.success),
    message: (data.message as string) ?? 'Erro desconhecido',
    rewardName: data.reward_name as string | undefined,
    pointsSpent: data.points_spent as number | undefined,
    balance: data.balance as number | undefined,
    redemptionId: data.redemption_id as string | undefined,
    nextAvailableAt: data.next_available_at as string | undefined,
  }
}

export function mapRewardCooldowns(data: Record<string, unknown>): RewardCooldown[] {
  const rows = data.cooldowns
  if (!Array.isArray(rows)) return []

  return rows.map((row) => {
    const item = row as Record<string, unknown>
    return {
      rewardId: item.reward_id as string,
      lastRedeemedAt: (item.last_redeemed_at as string) ?? null,
      nextAvailableAt: (item.next_available_at as string) ?? null,
      onCooldown: Boolean(item.on_cooldown),
    }
  })
}

export type { Reward }
