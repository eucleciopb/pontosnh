import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCouponPrint } from '@/features/coupons/hooks/useCouponPrint'
import { createCouponResultToReceipt } from '@/features/coupons/types'
import { generateCouponQrDataUrl } from '@/features/coupons/utils/qr'
import type { SalePayload } from '@/features/pdv/types'
import { LOTHUS_PDV_SOURCE } from '@/features/pdv/constants'
import { createCoupon, listStores } from '@/services/coupon.service'

interface GenerateCouponInput {
  purchaseAmount: number
  storeId?: string
  saleId?: string
  source?: string
}

async function resolveStoreId(
  storeCode: string | undefined,
  stores: Awaited<ReturnType<typeof listStores>>,
): Promise<string | undefined> {
  if (!storeCode) return undefined
  const match = stores.find(
    (s) => s.code.toLowerCase() === storeCode.toLowerCase(),
  )
  return match?.id
}

export function useGenerateCoupon() {
  const { receipt, isPrinting, print, triggerPrint, clearReceipt } = useCouponPrint()

  const mutation = useMutation({
    mutationFn: async (input: GenerateCouponInput) => {
      const stores = await listStores()
      const result = await createCoupon(
        input.purchaseAmount,
        input.storeId,
        {
          externalSaleId: input.saleId,
          source: input.source,
        },
      )
      const qrDataUrl = await generateCouponQrDataUrl(result.code)
      const storeName = stores.find((s) => s.id === input.storeId)?.name
      const receiptData = createCouponResultToReceipt(result, qrDataUrl, storeName)
      return { result, receiptData }
    },
    onSuccess: ({ result, receiptData }) => {
      print(receiptData, true)
      toast.success(`Cupom ${result.code} gerado!`)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const generateFromSale = async (
    sale: SalePayload,
    defaultStoreId?: string | null,
  ) => {
    const stores = await listStores()
    const storeId =
      (await resolveStoreId(sale.storeCode, stores)) ?? defaultStoreId ?? undefined

    return mutation.mutateAsync({
      purchaseAmount: sale.amount,
      storeId,
      saleId: sale.saleId,
      source: sale.source ?? LOTHUS_PDV_SOURCE,
    })
  }

  return {
    receipt,
    isPrinting,
    triggerPrint,
    clearReceipt,
    generateFromSale,
    generate: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    lastResult: mutation.data?.result ?? null,
  }
}
