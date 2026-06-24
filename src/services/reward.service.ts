import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Reward, RewardStatus } from '@/types/database'

function assertSupabase() {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado.')
}

export type RewardInput = {
  name: string
  description?: string
  image_url?: string
  category?: string
  points_required: number
  quantity?: number | null
  status?: RewardStatus
  sort_order?: number
}

export async function listRewardsAdmin(): Promise<Reward[]> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('rewards')
    .select('*')
    .order('sort_order')
    .order('points_required')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createReward(input: RewardInput): Promise<Reward> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('rewards')
    .insert({
      name: input.name,
      description: input.description || null,
      image_url: input.image_url || null,
      category: input.category || null,
      points_required: input.points_required,
      quantity: input.quantity ?? null,
      status: input.status ?? 'active',
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateReward(id: string, input: Partial<RewardInput>): Promise<Reward> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('rewards')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.image_url !== undefined && { image_url: input.image_url || null }),
      ...(input.category !== undefined && { category: input.category || null }),
      ...(input.points_required !== undefined && { points_required: input.points_required }),
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
