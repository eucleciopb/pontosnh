import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { normalizePhone } from '@/lib/utils'
import type { TotemRedeemResult } from '@/types/database'
import {
  mapProfileResult,
  mapRedeemRewardResult,
  mapRewardCooldowns,
  type CustomerProfile,
  type RedeemRewardResult,
  type RewardCooldown,
} from '@/features/totem/types'
import type { RegistrationFormData } from '@/features/totem/schemas/totem.schemas'
import type { Reward } from '@/types/database'

function assertSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase não configurado. Configure o arquivo .env e aplique as migrations.',
    )
  }
}

export async function lookupCustomer(phone: string): Promise<CustomerProfile> {
  assertSupabase()
  const client = getSupabase()
  const normalized = normalizePhone(phone)

  const { data, error } = await client.rpc('totem_lookup_customer', {
    p_phone: normalized,
  })

  if (error) throw new Error(error.message)

  const result = data as Record<string, unknown>
  return {
    found: Boolean(result.found),
    message: result.message as string | undefined,
    customerId: result.customer_id as string | undefined,
    firstName: result.first_name as string | undefined,
    lastName: result.last_name as string | undefined,
    fullName:
      result.first_name && result.last_name
        ? `${result.first_name} ${result.last_name}`
        : undefined,
    balance: result.balance as number | undefined,
    levelName: result.level_name as string | undefined,
  }
}

export async function getCustomerProfile(phone: string): Promise<CustomerProfile> {
  assertSupabase()
  const client = getSupabase()
  const normalized = normalizePhone(phone)

  const { data, error } = await client.rpc('totem_get_customer_profile', {
    p_phone: normalized,
  })

  if (error) throw new Error(error.message)
  return mapProfileResult(data as Record<string, unknown>)
}

export async function redeemCoupon(
  code: string,
  phone: string,
  registration?: RegistrationFormData,
): Promise<TotemRedeemResult> {
  assertSupabase()
  const client = getSupabase()
  const normalized = normalizePhone(phone)

  const { data, error } = await client.rpc('totem_redeem_coupon', {
    p_code: code.toUpperCase().trim(),
    p_phone: normalized,
    p_first_name: registration?.firstName ?? undefined,
    p_last_name: registration?.lastName ?? undefined,
    p_lgpd_accepted: registration?.lgpdAccepted ?? false,
    p_birth_date: registration?.birthDate || undefined,
    p_email: registration?.email || undefined,
    p_city: registration?.city || undefined,
  })

  if (error) throw new Error(error.message)
  return data as unknown as TotemRedeemResult
}

export async function listActiveRewards(): Promise<Reward[]> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('rewards')
    .select('*')
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .order('points_required', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getRewardCooldowns(phone: string): Promise<RewardCooldown[]> {
  assertSupabase()
  const client = getSupabase()
  const normalized = normalizePhone(phone)

  const { data, error } = await client.rpc('totem_get_reward_cooldowns', {
    p_phone: normalized,
  })

  if (error) throw new Error(error.message)
  return mapRewardCooldowns(data as Record<string, unknown>)
}

export async function redeemReward(
  phone: string,
  rewardId: string,
): Promise<RedeemRewardResult> {
  assertSupabase()
  const client = getSupabase()
  const normalized = normalizePhone(phone)

  const { data, error } = await client.rpc('totem_redeem_reward', {
    p_phone: normalized,
    p_reward_id: rewardId,
  })

  if (error) throw new Error(error.message)
  return mapRedeemRewardResult(data as Record<string, unknown>)
}
