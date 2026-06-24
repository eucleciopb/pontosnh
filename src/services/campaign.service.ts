import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Campaign, CampaignType, Json } from '@/types/database'

function assertSupabase() {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado.')
}

export type CampaignInput = {
  name: string
  description?: string
  type: CampaignType
  multiplier?: number
  config?: Json
  start_date: string
  end_date: string
  is_active?: boolean
}

export async function listCampaigns(): Promise<Campaign[]> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('campaigns')
    .insert({
      name: input.name,
      description: input.description || null,
      type: input.type,
      multiplier: input.multiplier ?? 2,
      config: input.config ?? {},
      start_date: input.start_date,
      end_date: input.end_date,
      is_active: input.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateCampaign(id: string, input: Partial<CampaignInput>): Promise<Campaign> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('campaigns')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.multiplier !== undefined && { multiplier: input.multiplier }),
      ...(input.config !== undefined && { config: input.config }),
      ...(input.start_date !== undefined && { start_date: input.start_date }),
      ...(input.end_date !== undefined && { end_date: input.end_date }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  double_points: 'Pontos em dobro',
  birthday: 'Aniversário',
  product: 'Produto específico',
  category: 'Categoria',
  weekday: 'Dia da semana',
}
