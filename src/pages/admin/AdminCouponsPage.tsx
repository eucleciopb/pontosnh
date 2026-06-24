import { PdvCouponsPage } from '@/pages/pdv/PdvCouponsPage'

/** Reutiliza a gestão de cupons do PDV dentro do admin */
export function AdminCouponsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-nh-gray-900">Cupons</h1>
        <p className="mt-1 text-nh-gray-600">
          Emitidos pelo PDV — reimprima ou cancele cupons pendentes
        </p>
      </div>
      <PdvCouponsPage />
    </div>
  )
}
