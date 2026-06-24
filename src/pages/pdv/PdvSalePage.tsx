import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Printer,
  RefreshCw,
  Ticket,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ThermalReceipt, ThermalReceiptPortal } from '@/features/coupons/components/ThermalReceipt'
import { useGenerateCoupon } from '@/features/pdv/hooks/useGenerateCoupon'
import { useSaleFromPos } from '@/features/pdv/hooks/useSaleFromPos'
import { formatCurrency, formatPoints } from '@/lib/utils'
import { LOTHUS_PDV_NAME } from '@/features/pdv/constants'
import { useAuth } from '@/hooks/useAuth'

/**
 * Tela integrada ao Lothus PDV.
 * Ao concluir a venda, gera e imprime o cupom automaticamente — sem digitar nada.
 *
 * URL: /pdv/venda?valor=149.90&loja=NH-001&venda=12345
 * postMessage: { type: 'lothus-sale-complete', payload: { amount: 149.90, saleId: '12345' } }
 */
export function PdvSalePage() {
  const { profile } = useAuth()
  const { sale, status, clearSale, markProcessed, markError } = useSaleFromPos()
  const {
    receipt,
    isPrinting,
    triggerPrint,
    clearReceipt,
    generateFromSale,
    isGenerating,
    lastResult,
  } = useGenerateCoupon()

  useEffect(() => {
    if (status !== 'generating' || !sale || isGenerating) return

    void generateFromSale(sale, profile?.store_id)
      .then(() => markProcessed(sale))
      .catch(() => markError())
  }, [status, sale, isGenerating, generateFromSale, profile?.store_id, markProcessed, markError])

  const handleNextSale = () => {
    clearReceipt()
    clearSale()
  }

  return (
    <>
      <ThermalReceiptPortal data={receipt} />

      <div className="mx-auto max-w-lg">
        {(status === 'waiting' || status === 'idle') && !receipt && (
          <Card padding="lg" className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-nh-green-50">
              <Ticket className="h-8 w-8 text-nh-green-600" />
            </div>
            <h1 className="text-xl font-bold text-nh-gray-900">Aguardando venda</h1>
            <p className="mt-2 text-sm text-nh-gray-600">
              Ao concluir a venda no <strong>{LOTHUS_PDV_NAME}</strong>, o cupom será gerado e
              impresso automaticamente.
            </p>
            <p className="mt-4 text-xs text-nh-gray-400">
              Integração Lothus PDV via URL ou postMessage
            </p>
          </Card>
        )}

        {(status === 'generating' || isGenerating || isPrinting) && !receipt && (
          <Card padding="lg" className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-nh-green-600" />
            <h1 className="text-xl font-bold text-nh-gray-900">Gerando cupom...</h1>
            {sale && (
              <p className="mt-2 text-lg text-nh-gray-700">
                Venda: <strong>{formatCurrency(sale.amount)}</strong>
              </p>
            )}
          </Card>
        )}

        {status === 'error' && !receipt && (
          <Card padding="lg" className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-nh-red-600" />
            <h1 className="text-xl font-bold text-nh-red-800">Erro ao gerar cupom</h1>
            <p className="mt-2 text-sm text-nh-gray-600">
              Verifique a conexão e tente novamente.
            </p>
            {sale && (
              <Button
                className="mt-4"
                onClick={() => {
                  void generateFromSale(sale, profile?.store_id)
                    .then(() => markProcessed(sale))
                    .catch(() => markError())
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            )}
          </Card>
        )}

        {receipt && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card padding="lg">
              <div className="mb-4 flex items-center justify-center gap-2 text-nh-green-700">
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-lg font-semibold">Cupom pronto!</span>
              </div>

              <div className="mb-4 rounded-xl bg-nh-green-50 p-4 text-center">
                <p className="font-mono text-2xl font-bold text-nh-green-800">
                  {receipt.code}
                </p>
                <p className="mt-1 text-sm text-nh-green-700">
                  {formatCurrency(receipt.purchaseAmount)} →{' '}
                  <strong>{formatPoints(receipt.pointsValue)} pontos</strong>
                </p>
              </div>

              <div className="thermal-receipt-preview mb-4">
                <ThermalReceipt data={receipt} />
              </div>

              <div className="flex flex-col gap-2">
                <Button size="lg" fullWidth onClick={triggerPrint} disabled={isPrinting}>
                  <Printer className="h-5 w-5" />
                  {isPrinting ? 'Imprimindo...' : 'Imprimir novamente'}
                </Button>
                <Button variant="outline" size="lg" fullWidth onClick={handleNextSale}>
                  <Ticket className="h-5 w-5" />
                  Próxima venda
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {lastResult && !receipt && status === 'ready' && (
          <Card padding="md" className="mt-4 text-center text-sm text-nh-gray-600">
            Último cupom: <strong className="font-mono">{lastResult.code}</strong>
          </Card>
        )}
      </div>
    </>
  )
}
