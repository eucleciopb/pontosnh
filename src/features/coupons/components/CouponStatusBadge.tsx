import type { CouponStatus } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { COUPON_STATUS_LABELS } from '@/features/coupons/types'

const variantMap: Record<
  CouponStatus,
  'success' | 'warning' | 'error' | 'neutral' | 'info'
> = {
  pending: 'info',
  used: 'success',
  expired: 'warning',
  cancelled: 'error',
}

export function CouponStatusBadge({ status }: { status: CouponStatus }) {
  return <Badge variant={variantMap[status]}>{COUPON_STATUS_LABELS[status]}</Badge>
}
