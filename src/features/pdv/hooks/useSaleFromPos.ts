import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SaleIntegrationStatus, SalePayload } from '@/features/pdv/types'
import { POS_SALE_MESSAGE_TYPE } from '@/features/pdv/types'
import {
  parseSaleFromMessage,
  parseSaleFromSearchParams,
} from '@/features/pdv/utils/parse-sale-params'

interface UseSaleFromPosOptions {
  /** Escuta postMessage do sistema de vendas (padrão: true) */
  listenForMessages?: boolean
}

export function useSaleFromPos(options: UseSaleFromPosOptions = {}) {
  const { listenForMessages = true } = options
  const [searchParams, setSearchParams] = useSearchParams()
  const [sale, setSale] = useState<SalePayload | null>(null)
  const [status, setStatus] = useState<SaleIntegrationStatus>('idle')
  const processedSaleRef = useRef<string | null>(null)

  const saleKey = (payload: SalePayload) =>
    `${payload.saleId ?? 'no-id'}:${payload.amount}:${payload.storeCode ?? ''}`

  const applySale = useCallback((payload: SalePayload) => {
    const key = saleKey(payload)
    if (processedSaleRef.current === key && status === 'ready') return
    setSale(payload)
    setStatus('generating')
  }, [status])

  const clearSale = useCallback(() => {
    setSale(null)
    setStatus('waiting')
    processedSaleRef.current = null
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const markProcessed = useCallback((payload: SalePayload) => {
    processedSaleRef.current = saleKey(payload)
    setStatus('ready')
  }, [])

  const markError = useCallback(() => {
    setStatus('error')
  }, [])

  // Lê venda da URL na montagem / mudança de params
  useEffect(() => {
    const fromUrl = parseSaleFromSearchParams(searchParams.toString())
    if (!fromUrl) {
      if (status === 'idle') setStatus('waiting')
      return
    }

    const key = saleKey(fromUrl)
    if (processedSaleRef.current === key) return

    setSale(fromUrl)
    setStatus('generating')
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // Escuta postMessage do sistema de vendas
  useEffect(() => {
    if (!listenForMessages) return

    const handler = (event: MessageEvent) => {
      const payload = parseSaleFromMessage(event.data)
      if (!payload) return
      applySale(payload)
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [listenForMessages, applySale])

  return {
    sale,
    status,
    setStatus,
    applySale,
    clearSale,
    markProcessed,
    markError,
    isFromUrl: Boolean(parseSaleFromSearchParams(searchParams.toString())),
    messageType: POS_SALE_MESSAGE_TYPE,
  }
}
