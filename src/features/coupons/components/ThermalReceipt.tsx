import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pill, Plus } from 'lucide-react'
import { APP_NAME, COMPANY_NAME } from '@/lib/constants'
import { formatCurrency, formatPoints } from '@/lib/utils'
import type { CouponReceiptData } from '@/features/coupons/types'

interface ThermalReceiptProps {
  data: CouponReceiptData
}

export function ThermalReceipt({ data }: ThermalReceiptProps) {
  const expiresLabel = format(new Date(data.expiresAt), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  })

  const createdLabel = data.createdAt
    ? format(new Date(data.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    : format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })

  return (
    <div id="thermal-receipt" className="thermal-receipt">
      <div className="thermal-receipt__header">
        <div className="thermal-receipt__logo" aria-hidden="true">
          <Pill className="thermal-receipt__logo-icon" strokeWidth={1.75} />
          <Plus className="thermal-receipt__logo-plus" strokeWidth={3} />
        </div>
        <h1 className="thermal-receipt__brand">{APP_NAME}</h1>
        <p className="thermal-receipt__company">{COMPANY_NAME}</p>
        {data.storeName && (
          <p className="thermal-receipt__store">{data.storeName}</p>
        )}
      </div>

      <div className="thermal-receipt__divider" />

      <p className="thermal-receipt__title">CUPOM DE PONTOS</p>

      <div className="thermal-receipt__qr">
        <img
          src={data.qrDataUrl}
          alt={`QR Code do cupom ${data.code}`}
          className="thermal-receipt__qr-img"
        />
      </div>

      <p className="thermal-receipt__code">{data.code}</p>

      <div className="thermal-receipt__divider" />

      <div className="thermal-receipt__row">
        <span>Valor da compra</span>
        <strong>{formatCurrency(data.purchaseAmount)}</strong>
      </div>
      <div className="thermal-receipt__row thermal-receipt__row--highlight">
        <span>Pontos a ganhar</span>
        <strong>{formatPoints(data.pointsValue)} pts</strong>
      </div>
      <div className="thermal-receipt__row">
        <span>Válido até</span>
        <strong>{expiresLabel}</strong>
      </div>
      <div className="thermal-receipt__row">
        <span>Emitido em</span>
        <span>{createdLabel}</span>
      </div>

      {data.reprintCount != null && data.reprintCount > 0 && (
        <p className="thermal-receipt__reprint">
          Reimpressão #{data.reprintCount}
        </p>
      )}

      <div className="thermal-receipt__divider" />

      <p className="thermal-receipt__instructions">
        Vá ao totem NH+ Clube, informe seu telefone e escaneie este QR Code ou
        digite o código acima para creditar seus pontos.
      </p>

      <p className="thermal-receipt__footer">
        Obrigado pela preferência!
      </p>
    </div>
  )
}

interface ThermalReceiptPortalProps {
  data: CouponReceiptData | null
}

export function ThermalReceiptPortal({ data }: ThermalReceiptPortalProps) {
  if (!data) return null

  return (
    <div className="thermal-receipt-portal" aria-hidden="true">
      <ThermalReceipt data={data} />
    </div>
  )
}
