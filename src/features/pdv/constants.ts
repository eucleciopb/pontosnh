/** Sistema de vendas da loja */
export const LOTHUS_PDV_NAME = 'Lothus PDV' as const
export const LOTHUS_PDV_SOURCE = 'lothus' as const

export const PDV_ROUTES = {
  login: '/pdv/login',
  home: '/pdv',
  coupons: '/pdv/cupons',
  /** Tela integrada ao Lothus PDV — gera e imprime cupom automaticamente */
  sale: '/pdv/venda',
} as const

/** Monta URL para o Lothus PDV abrir após concluir a venda */
export function buildSaleCouponUrl(params: {
  amount: number
  storeCode?: string
  saleId?: string
  source?: string
}): string {
  const search = new URLSearchParams()
  search.set('valor', params.amount.toFixed(2))
  if (params.storeCode) search.set('loja', params.storeCode)
  if (params.saleId) search.set('venda', params.saleId)
  search.set('origem', params.source ?? LOTHUS_PDV_SOURCE)
  search.set('auto', '1')
  return `${PDV_ROUTES.sale}?${search.toString()}`
}

/** Alias explícito para integração com o Lothus PDV */
export const buildLothusSaleCouponUrl = buildSaleCouponUrl
