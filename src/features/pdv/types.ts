import { LOTHUS_PDV_SOURCE } from '@/features/pdv/constants'

/** Payload enviado pelo Lothus PDV ao concluir uma venda. */
export interface SalePayload {
  /** Valor total da venda em reais */
  amount: number
  /** Código da loja (ex: NH-001) — resolvido para store_id */
  storeCode?: string
  /** ID da venda no Lothus PDV (evita cupom duplicado) */
  saleId?: string
  /** Sistema de origem (padrão: lothus) */
  source?: string
}

export type SaleIntegrationStatus =
  | 'idle'
  | 'waiting'
  | 'generating'
  | 'ready'
  | 'error'

/** Mensagem postMessage do Lothus PDV → NH+ Clube */
export const POS_SALE_MESSAGE_TYPE = 'nh-sale-complete' as const
export const LOTHUS_SALE_MESSAGE_TYPE = 'lothus-sale-complete' as const

export interface PosSaleMessage {
  type: typeof POS_SALE_MESSAGE_TYPE | typeof LOTHUS_SALE_MESSAGE_TYPE
  payload: SalePayload
}

export function withLothusSource(payload: SalePayload): SalePayload {
  return {
    ...payload,
    source: payload.source ?? LOTHUS_PDV_SOURCE,
  }
}
