import { useCallback, useEffect, useRef, useState } from 'react'
import type { CouponReceiptData } from '@/features/coupons/types'

export function useCouponPrint() {
  const [receipt, setReceipt] = useState<CouponReceiptData | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const printTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPrintTimeout = () => {
    if (printTimeoutRef.current) {
      clearTimeout(printTimeoutRef.current)
      printTimeoutRef.current = null
    }
  }

  useEffect(() => () => clearPrintTimeout(), [])

  const print = useCallback((data: CouponReceiptData, autoPrint = true) => {
    clearPrintTimeout()
    setReceipt(data)

    if (autoPrint) {
      setIsPrinting(true)
      printTimeoutRef.current = setTimeout(() => {
        window.print()
        setIsPrinting(false)
      }, 400)
    }
  }, [])

  const triggerPrint = useCallback(() => {
    window.print()
  }, [])

  const clearReceipt = useCallback(() => {
    clearPrintTimeout()
    setReceipt(null)
    setIsPrinting(false)
  }, [])

  return {
    receipt,
    isPrinting,
    print,
    triggerPrint,
    clearReceipt,
  }
}
