import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Json } from '@/types/database'

function assertSupabase() {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado.')
}

export async function listSettings() {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client.from('settings').select('*').order('key')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateSetting(key: string, value: Json) {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('settings')
    .update({ value })
    .eq('key', key)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function listStaffProfiles() {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('staff_profiles')
    .select('*, stores(name, code)')
    .order('full_name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateStaffProfile(
  id: string,
  payload: { full_name?: string; role?: 'admin' | 'manager' | 'operator'; is_active?: boolean },
) {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('staff_profiles')
    .update(payload)
    .eq('id', id)
    .select('*, stores(name, code)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function listPointTransactions(limit = 100) {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('point_transactions')
    .select('*, customers(first_name, last_name, phone)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function adjustPoints(customerId: string, points: number, description: string) {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client.rpc('admin_adjust_points', {
    p_customer_id: customerId,
    p_points: points,
    p_description: description,
  })

  if (error) throw new Error(error.message)
  return data as { success: boolean; message: string; balance?: number }
}

export async function listAuditLogs(limit = 100) {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}
