import type { Coupon, CouponStatus } from '@/types/database'

export interface CreateCouponResult {
  success: boolean
  coupon_id: string
  code: string
  purchase_amount: number
  points_value: number
  expires_at: string
}

export interface ReprintCouponResult {
  success: boolean
  message: string
  coupon_id?: string
  code?: string
  purchase_amount?: number
  points_value?: number
  expires_at?: string
  reprint_count?: number
  created_at?: string
}

export interface CancelCouponResult {
  success: boolean
  message: string
  coupon_id?: string
  code?: string
}

export interface CouponReceiptData {
  id?: string
  code: string
  purchaseAmount: number
  pointsValue: number
  expiresAt: string
  createdAt?: string
  qrDataUrl: string
  reprintCount?: number
  storeName?: string
}

export interface CouponListFilters {
  status?: CouponStatus
  limit?: number
}

export type { Coupon, CouponStatus }

export function couponToReceiptData(
  coupon: Pick<Coupon, 'code' | 'purchase_amount' | 'points_value' | 'expires_at' | 'created_at' | 'reprint_count' | 'id'>,
  qrDataUrl: string,
  storeName?: string,
): Omit<CouponReceiptData, never> {
  return {
    id: coupon.id,
    code: coupon.code,
    purchaseAmount: Number(coupon.purchase_amount),
    pointsValue: coupon.points_value,
    expiresAt: coupon.expires_at,
    createdAt: coupon.created_at,
    qrDataUrl,
    reprintCount: coupon.reprint_count,
    storeName,
  }
}

export function createCouponResultToReceipt(
  result: CreateCouponResult,
  qrDataUrl: string,
  storeName?: string,
): CouponReceiptData {
  return {
    id: result.coupon_id,
    code: result.code,
    purchaseAmount: result.purchase_amount,
    pointsValue: result.points_value,
    expiresAt: result.expires_at,
    createdAt: new Date().toISOString(),
    qrDataUrl,
    reprintCount: 0,
    storeName,
  }
}

export function reprintResultToReceipt(
  result: ReprintCouponResult,
  qrDataUrl: string,
  storeName?: string,
): CouponReceiptData | null {
  if (!result.success || !result.code) return null
  return {
    id: result.coupon_id,
    code: result.code,
    purchaseAmount: Number(result.purchase_amount),
    pointsValue: result.points_value ?? 0,
    expiresAt: result.expires_at ?? new Date().toISOString(),
    createdAt: result.created_at,
    qrDataUrl,
    reprintCount: result.reprint_count,
    storeName,
  }
}

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  pending: 'Pendente',
  used: 'Utilizado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
}
