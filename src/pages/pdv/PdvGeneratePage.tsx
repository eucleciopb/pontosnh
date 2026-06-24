import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { CheckCircle2, Printer, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader } from '@/components/ui/Card'
import { ThermalReceipt, ThermalReceiptPortal } from '@/features/coupons/components/ThermalReceipt'
import { useCouponPrint } from '@/features/coupons/hooks/useCouponPrint'
import {
  createCouponSchema,
  type CreateCouponFormData,
} from '@/features/coupons/schemas/coupon.schemas'
import { createCouponResultToReceipt } from '@/features/coupons/types'
import { generateCouponQrDataUrl } from '@/features/coupons/utils/qr'
import { createCoupon, listStores } from '@/services/coupon.service'
import { formatPoints } from '@/lib/utils'

export function PdvGeneratePage() {
  const { receipt, isPrinting, print, triggerPrint, clearReceipt } = useCouponPrint()
  const [lastCode, setLastCode] = useState<string | null>(null)

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: listStores,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateCouponFormData>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: { purchaseAmount: undefined as unknown as number, storeId: '' },
  })

  const amount = Number(watch('purchaseAmount')) || 0

  const mutation = useMutation({
    mutationFn: async (form: CreateCouponFormData) => {
      const result = await createCoupon(
        form.purchaseAmount,
        form.storeId || undefined,
      )
      const qrDataUrl = await generateCouponQrDataUrl(result.code)
      const storeName = stores?.find((s) => s.id === form.storeId)?.name
      const receiptData = createCouponResultToReceipt(result, qrDataUrl, storeName)
      return { result, receiptData }
    },
    onSuccess: ({ result, receiptData }) => {
      setLastCode(result.code)
      print(receiptData, true)
      toast.success(`Cupom ${result.code} gerado!`)
      reset({ storeId: watch('storeId') })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <>
      <ThermalReceiptPortal data={receipt} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <CardHeader
            title="Gerar cupom de pontos"
            description="Informe o valor da compra para emitir o cupom"
          />

          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <Input
              label="Valor da compra (R$) *"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              error={errors.purchaseAmount?.message}
              {...register('purchaseAmount', { valueAsNumber: true })}
            />

            {stores && stores.length > 0 && (
              <div className="w-full">
                <label
                  htmlFor="storeId"
                  className="mb-2 block text-sm font-medium text-nh-gray-700"
                >
                  Loja
                </label>
                <select
                  id="storeId"
                  className="h-14 w-full rounded-xl border-2 border-nh-gray-200 bg-white px-4 text-base focus:border-nh-green-600 focus:outline-none"
                  {...register('storeId')}
                >
                  <option value="">Loja padrão</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name} ({store.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {amount > 0 && (
              <div className="rounded-xl bg-nh-green-50 p-4 text-sm text-nh-green-800">
                Estimativa: <strong>{formatPoints(Math.floor(amount))} pontos</strong>{' '}
                (regra: R$ 1 = 1 ponto)
              </div>
            )}

            <Button
              type="submit"
              size="xl"
              fullWidth
              disabled={mutation.isPending || isPrinting}
            >
              <Ticket className="h-5 w-5" />
              {mutation.isPending ? 'Gerando...' : 'Gerar e imprimir cupom'}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {receipt ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card padding="lg">
                <div className="mb-4 flex items-center gap-2 text-nh-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Cupom gerado: {receipt.code}</span>
                </div>

                <div className="thermal-receipt-preview mb-4">
                  <ThermalReceipt data={receipt} />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" fullWidth onClick={triggerPrint}>
                    <Printer className="h-4 w-4" />
                    Imprimir novamente
                  </Button>
                  <Button variant="ghost" fullWidth onClick={clearReceipt}>
                    Limpar preview
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : lastCode ? (
            <Card padding="lg">
              <p className="text-sm text-nh-gray-600">
                Último cupom: <strong className="font-mono">{lastCode}</strong>
              </p>
            </Card>
          ) : (
            <Card padding="lg" className="flex min-h-[200px] items-center justify-center">
              <p className="text-center text-sm text-nh-gray-500">
                O preview e a impressão aparecerão aqui após gerar o cupom.
              </p>
            </Card>
          )}

          <Card padding="md">
            <h3 className="mb-2 text-sm font-semibold text-nh-gray-800">Instruções</h3>
            <ul className="space-y-1 text-sm text-nh-gray-600">
              <li>• O cupom imprime automaticamente em impressora térmica 80mm</li>
              <li>• Cliente resgata os pontos no totem NH+ Clube</li>
              <li>• Cada código só pode ser usado uma vez</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
