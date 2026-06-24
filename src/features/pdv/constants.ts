export const PDV_ROUTES = {
  login: '/pdv/login',
  home: '/pdv',
  coupons: '/pdv/cupons',
  /** Tela integrada ao sistema de vendas — gera e imprime cupom automaticamente */
  sale: '/pdv/venda',
} as const

/** Monta URL para abrir após concluir venda no sistema da loja */
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
  if (params.source) search.set('origem', params.source)
  search.set('auto', '1')
  return `${PDV_ROUTES.sale}?${search.toString()}`
}
