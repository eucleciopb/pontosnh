import type { SalePayload } from '@/features/pdv/types'

function parseAmount(raw: string | null): number | null {
  if (!raw) return null
  const normalized = raw.trim().replace(',', '.')
  const value = Number(normalized)
  if (!Number.isFinite(value) || value <= 0) return null
  return Math.round(value * 100) / 100
}

function firstParam(params: URLSearchParams, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = params.get(key)
    if (value) return value
  }
  return null
}

/** Lê parâmetros de venda da URL (?valor=149.90&loja=NH-001&venda=123) */
export function parseSaleFromSearchParams(search: string): SalePayload | null {
  const params = new URLSearchParams(search)
  const amount = parseAmount(firstParam(params, 'valor', 'amount', 'total'))
  if (amount === null) return null

  return {
    amount,
    storeCode: firstParam(params, 'loja', 'store', 'storeCode') ?? undefined,
    saleId: firstParam(params, 'venda', 'sale_id', 'saleId', 'id') ?? undefined,
    source: firstParam(params, 'origem', 'source') ?? undefined,
  }
}

export function isAutoGenerateRequested(search: string): boolean {
  const params = new URLSearchParams(search)
  const auto = firstParam(params, 'auto', 'gerar')
  return auto === '1' || auto === 'true' || auto === 'sim'
}

/** Valida e normaliza payload recebido via postMessage */
export function parseSaleFromMessage(data: unknown): SalePayload | null {
  if (!data || typeof data !== 'object') return null

  const msg = data as Record<string, unknown>

  if (msg.type === 'nh-sale-complete' && msg.payload && typeof msg.payload === 'object') {
    return parseSalePayload(msg.payload as Record<string, unknown>)
  }

  return parseSalePayload(msg)
}

function parseSalePayload(raw: Record<string, unknown>): SalePayload | null {
  const amountRaw = raw.amount ?? raw.valor ?? raw.total ?? raw.purchaseAmount
  const amount =
    typeof amountRaw === 'number'
      ? amountRaw
      : typeof amountRaw === 'string'
        ? parseAmount(amountRaw)
        : null

  if (amount === null || amount <= 0) return null

  const storeCode =
    (raw.storeCode ?? raw.loja ?? raw.store) as string | undefined
  const saleId = (raw.saleId ?? raw.venda ?? raw.sale_id ?? raw.id) as
    | string
    | undefined
  const source = (raw.source ?? raw.origem) as string | undefined

  return {
    amount,
    storeCode: storeCode || undefined,
    saleId: saleId ? String(saleId) : undefined,
    source: source || undefined,
  }
}
