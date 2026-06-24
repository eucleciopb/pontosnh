import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { normalizePhone } from '@/lib/utils'
import type { Customer, Coupon, PointTransaction, Redemption } from '@/types/database'

function assertSupabase() {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado.')
}

export type CustomerWithLevel = Customer & {
  levels: { name: string; color: string } | null
}

export async function listCustomers(search?: string, limit = 100): Promise<CustomerWithLevel[]> {
  assertSupabase()
  const client = getSupabase()

  let query = client
    .from('customers')
    .select('*, levels(name, color)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (search?.trim()) {
    const term = search.trim()
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`,
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as CustomerWithLevel[]
}

export async function getCustomer(id: string): Promise<CustomerWithLevel | null> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('customers')
    .select('*, levels(name, color)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as unknown as CustomerWithLevel | null
}

export async function updateCustomer(
  id: string,
  payload: Partial<Pick<Customer, 'first_name' | 'last_name' | 'email' | 'city' | 'birth_date' | 'is_active'>>,
) {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('customers')
    .update(payload)
    .eq('id', id)
    .select('*, levels(name, color)')
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as CustomerWithLevel
}

export async function createCustomer(payload: {
  phone: string
  firstName: string
  lastName: string
  email?: string
  city?: string
  birthDate?: string
}) {
  assertSupabase()
  const client = getSupabase()
  const phone = normalizePhone(payload.phone)

  const { data, error } = await client
    .from('customers')
    .insert({
      phone,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email || null,
      city: payload.city || null,
      birth_date: payload.birthDate || null,
      lgpd_accepted_at: new Date().toISOString(),
      lgpd_version: '1.0',
    })
    .select('*, levels(name, color)')
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as CustomerWithLevel
}

export async function getCustomerTransactions(customerId: string, limit = 50): Promise<PointTransaction[]> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('point_transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getCustomerCoupons(customerId: string, limit = 20): Promise<Coupon[]> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('coupons')
    .select('*')
    .eq('customer_id', customerId)
    .order('used_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getCustomerRedemptions(customerId: string, limit = 20) {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('redemptions')
    .select('*, rewards(name)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

export type RedemptionWithRelations = Redemption & {
  customers: { first_name: string; last_name: string; phone: string } | null
  rewards: { name: string } | null
}

export async function listRedemptions(limit = 100): Promise<RedemptionWithRelations[]> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('redemptions')
    .select('*, customers(first_name, last_name, phone), rewards(name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as RedemptionWithRelations[]
}
