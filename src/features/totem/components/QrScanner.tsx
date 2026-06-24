import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, Keyboard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { COUPON_CODE_PATTERN } from '@/lib/constants'

interface QrScannerProps {
  onScan: (code: string) => void
  className?: string
}

export function QrScanner({ onScan, className }: QrScannerProps) {
  const [mode, setMode] = useState<'scan' | 'manual'>('scan')
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannedRef = useRef(false)

  const formatCode = (raw: string) => {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (cleaned.startsWith('NH')) {
      const body = cleaned.slice(2)
      if (body.length <= 4) return `NH-${body}`
      return `NH-${body.slice(0, 4)}-${body.slice(4, 8)}`
    }
    if (cleaned.length <= 4) return cleaned
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {
        // scanner may already be stopped
      }
      scannerRef.current = null
    }
  }

  useEffect(() => {
    if (mode !== 'scan') {
      void stopScanner()
      return
    }

    scannedRef.current = false
    setStarting(true)
    setError(null)

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          if (scannedRef.current) return
          const code = decoded.toUpperCase().trim()
          if (COUPON_CODE_PATTERN.test(code)) {
            scannedRef.current = true
            void stopScanner()
            onScan(code)
          }
        },
        () => {
          // ignore scan failures (no QR in frame)
        },
      )
      .then(() => setStarting(false))
      .catch(() => {
        setStarting(false)
        setError('Não foi possível acessar a câmera. Use a digitação manual.')
        setMode('manual')
      })

    return () => {
      void stopScanner()
    }
  }, [mode, onScan])

  const handleManualSubmit = () => {
    const formatted = formatCode(manualCode)
    if (!COUPON_CODE_PATTERN.test(formatted)) {
      setError('Código inválido. Exemplo: NH-4D8X-K92L')
      return
    }
    setError(null)
    onScan(formatted)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex gap-2 rounded-xl bg-nh-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode('scan')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition',
            mode === 'scan'
              ? 'bg-white text-nh-green-700 shadow-sm'
              : 'text-nh-gray-600 hover:text-nh-gray-900',
          )}
        >
          <Camera className="h-4 w-4" />
          Escanear QR
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition',
            mode === 'manual'
              ? 'bg-white text-nh-green-700 shadow-sm'
              : 'text-nh-gray-600 hover:text-nh-gray-900',
          )}
        >
          <Keyboard className="h-4 w-4" />
          Digitar código
        </button>
      </div>

      {mode === 'scan' ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-nh-green-200 bg-nh-green-900">
          <div id="qr-reader" className="w-full [& video]:rounded-2xl" />
          {starting && (
            <div className="absolute inset-0 flex items-center justify-center bg-nh-green-900/60">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          )}
          <p className="bg-nh-green-900 px-4 py-3 text-center text-sm text-white/80">
            Aponte a câmera para o QR Code do cupom
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Código do cupom"
            placeholder="NH-4D8X-K92L"
            value={manualCode}
            onChange={(e) => {
              setManualCode(formatCode(e.target.value))
              setError(null)
            }}
            error={error ?? undefined}
            hint="O código está impresso no seu cupom"
            autoComplete="off"
            className="font-mono uppercase tracking-wider"
          />
          <Button size="lg" fullWidth onClick={handleManualSubmit}>
            Validar cupom
          </Button>
        </div>
      )}

      {error && mode === 'scan' && (
        <p className="text-center text-sm text-nh-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
