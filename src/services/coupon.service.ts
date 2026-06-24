import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Coupon, CouponStatus } from '@/types/database'
import type {
  CancelCouponResult,
  CreateCouponResult,
  CouponListFilters,
  ReprintCouponResult,
} from '@/features/coupons/types'

function assertSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado.')
  }
}

export interface CreateCouponOptions {
  externalSaleId?: string
  source?: string
}

export async function createCoupon(
  purchaseAmount: number,
  storeId?: string,
  options?: CreateCouponOptions,
): Promise<CreateCouponResult> {
  assertSupabase()
  const client = getSupabase()

  const metadata: Record<string, string> = {}
  if (options?.externalSaleId) metadata.external_sale_id = options.externalSaleId
  if (options?.source) metadata.source = options.source

  const { data, error } = await client.rpc('admin_create_coupon', {
    p_purchase_amount: purchaseAmount,
    p_store_id: storeId || undefined,
    p_metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  })

  if (error) throw new Error(error.message)

  const result = data as Record<string, unknown>
  if (!result.success) {
    throw new Error((result.message as string) ?? 'Erro ao criar cupom')
  }

  return {
    success: true,
    coupon_id: result.coupon_id as string,
    code: result.code as string,
    purchase_amount: Number(result.purchase_amount),
    points_value: result.points_value as number,
    expires_at: result.expires_at as string,
  }
}

export async function listCoupons(filters: CouponListFilters = {}): Promise<Coupon[]> {
  assertSupabase()
  const client = getSupabase()
  const limit = filters.limit ?? 50

  let query = client
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function cancelCoupon(couponId: string): Promise<CancelCouponResult> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client.rpc('admin_cancel_coupon', {
    p_coupon_id: couponId,
  })

  if (error) throw new Error(error.message)
  return data as unknown as CancelCouponResult
}

export async function reprintCoupon(couponId: string): Promise<ReprintCouponResult> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client.rpc('admin_reprint_coupon', {
    p_coupon_id: couponId,
  })

  if (error) throw new Error(error.message)
  return data as unknown as ReprintCouponResult
}

export async function listStores() {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('stores')
    .select('id, name, code')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getCouponById(couponId: string): Promise<Coupon | null> {
  assertSupabase()
  const client = getSupabase()

  const { data, error } = await client
    .from('coupons')
    .select('*')
    .eq('id', couponId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export type { CouponStatus }
