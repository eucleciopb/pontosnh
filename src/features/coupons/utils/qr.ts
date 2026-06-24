import QRCode from 'qrcode'

export async function generateCouponQrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(code, {
    width: 220,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#064622',
      light: '#FFFFFF',
    },
  })
}

export function formatCouponCodeInput(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.startsWith('NH')) {
    const body = cleaned.slice(2)
    if (body.length <= 4) return `NH-${body}`
    return `NH-${body.slice(0, 4)}-${body.slice(4, 8)}`
  }
  if (cleaned.length <= 4) return cleaned
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`
}
