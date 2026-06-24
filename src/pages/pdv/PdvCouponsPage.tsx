import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Ban, Loader2, Printer, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { CouponStatusBadge } from '@/features/coupons/components/CouponStatusBadge'
import { ThermalReceiptPortal } from '@/features/coupons/components/ThermalReceipt'
import { useCouponPrint } from '@/features/coupons/hooks/useCouponPrint'
import { reprintResultToReceipt } from '@/features/coupons/types'
import { generateCouponQrDataUrl } from '@/features/coupons/utils/qr'
import {
  cancelCoupon,
  listCoupons,
  reprintCoupon,
  type CouponStatus,
} from '@/services/coupon.service'
import { formatCurrency, formatPoints, cn } from '@/lib/utils'
import type { Coupon } from '@/types/database'

const statusFilters: { value: CouponStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'used', label: 'Utilizados' },
  { value: 'expired', label: 'Expirados' },
  { value: 'cancelled', label: 'Cancelados' },
]

export function PdvCouponsPage() {
  const queryClient = useQueryClient()
  const { receipt, print, triggerPrint } = useCouponPrint()
  const [statusFilter, setStatusFilter] = useState<CouponStatus | 'all'>('all')
  const [actionId, setActionId] = useState<string | null>(null)

  const { data: coupons, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['coupons', statusFilter],
    queryFn: () =>
      listCoupons({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 50,
      }),
    refetchInterval: 1000 * 30,
  })

  const cancelMutation = useMutation({
    mutationFn: cancelCoupon,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      void queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
    onError: (error: Error) => toast.error(error.message),
    onSettled: () => setActionId(null),
  })

  const reprintMutation = useMutation({
    mutationFn: async (couponId: string) => {
      const result = await reprintCoupon(couponId)
      if (!result.success || !result.code) {
        throw new Error(result.message)
      }
      const qrDataUrl = await generateCouponQrDataUrl(result.code)
      const receiptData = reprintResultToReceipt(result, qrDataUrl)
      if (!receiptData) throw new Error('Erro ao preparar impressão')
      return receiptData
    },
    onSuccess: (receiptData) => {
      print(receiptData, true)
      toast.success('Cupom enviado para impressão')
      void queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
    onError: (error: Error) => toast.error(error.message),
    onSettled: () => setActionId(null),
  })

  const handleCancel = (coupon: Coupon) => {
    if (!window.confirm(`Cancelar cupom ${coupon.code}?`)) return
    setActionId(coupon.id)
    cancelMutation.mutate(coupon.id)
  }

  const handleReprint = (coupon: Coupon) => {
    setActionId(coupon.id)
    reprintMutation.mutate(coupon.id)
  }

  return (
    <>
      <ThermalReceiptPortal data={receipt} />

      <Card padding="lg">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardHeader
            title="Cupons emitidos"
            description="Gerencie, reimprima ou cancele cupons"
            className="mb-0"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            Atualizar
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                statusFilter === filter.value
                  ? 'bg-nh-green-600 text-white'
                  : 'bg-nh-gray-100 text-nh-gray-600 hover:bg-nh-gray-200',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
          </div>
        ) : !coupons?.length ? (
          <p className="py-12 text-center text-nh-gray-500">Nenhum cupom encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-nh-gray-200 text-nh-gray-500">
                  <th className="pb-3 pr-4 font-medium">Código</th>
                  <th className="pb-3 pr-4 font-medium">Valor</th>
                  <th className="pb-3 pr-4 font-medium">Pontos</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Validade</th>
                  <th className="pb-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const isPending = coupon.status === 'pending'
                  const isBusy = actionId === coupon.id

                  return (
                    <tr
                      key={coupon.id}
                      className="border-b border-nh-gray-100 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <span className="font-mono font-semibold">{coupon.code}</span>
                        {coupon.reprint_count > 0 && (
                          <span className="ml-2 text-xs text-nh-gray-400">
                            ↻{coupon.reprint_count}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">{formatCurrency(Number(coupon.purchase_amount))}</td>
                      <td className="py-3 pr-4">{formatPoints(coupon.points_value)}</td>
                      <td className="py-3 pr-4">
                        <CouponStatusBadge status={coupon.status} />
                      </td>
                      <td className="py-3 pr-4 text-nh-gray-600">
                        {format(new Date(coupon.expires_at), 'dd/MM/yy HH:mm', {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          {isPending && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => handleReprint(coupon)}
                              >
                                {isBusy && reprintMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Printer className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => handleCancel(coupon)}
                                aria-label={`Cancelar ${coupon.code}`}
                              >
                                {isBusy && cancelMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Ban className="h-4 w-4 text-nh-red-600" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {receipt && (
          <div className="mt-6 flex justify-end">
            <Button variant="outline" size="sm" onClick={triggerPrint}>
              <Printer className="h-4 w-4" />
              Imprimir cupom selecionado
            </Button>
          </div>
        )}
      </Card>
    </>
  )
}
