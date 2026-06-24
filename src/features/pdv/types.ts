/** Payload enviado pelo sistema de vendas ao concluir uma venda. */
export interface SalePayload {
  /** Valor total da venda em reais */
  amount: number
  /** Código da loja (ex: NH-001) — resolvido para store_id */
  storeCode?: string
  /** ID da venda no sistema externo (evita cupom duplicado) */
  saleId?: string
  /** Nome do sistema de origem (ex: "linx", "totvs") */
  source?: string
}

export type SaleIntegrationStatus =
  | 'idle'
  | 'waiting'
  | 'generating'
  | 'ready'
  | 'error'

/** Mensagem postMessage do sistema de vendas */
export const POS_SALE_MESSAGE_TYPE = 'nh-sale-complete' as const

export interface PosSaleMessage {
  type: typeof POS_SALE_MESSAGE_TYPE
  payload: SalePayload
}
