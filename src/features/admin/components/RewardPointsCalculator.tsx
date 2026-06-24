import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  calculateMinPointsFromProductValue,
  REWARD_REDEMPTION_RATE,
} from '@/features/admin/utils/rewardPointsCalculator'
import { formatCurrency, formatPoints } from '@/lib/utils'

interface RewardPointsCalculatorProps {
  productValue: string
  onProductValueChange: (value: string) => void
  pointsRequired: number
  onApplyPoints: (points: number) => void
}

export function RewardPointsCalculator({
  productValue,
  onProductValueChange,
  pointsRequired,
  onApplyPoints,
}: RewardPointsCalculatorProps) {
  const numericValue = parseFloat(productValue.replace(',', '.')) || 0
  const suggestedPoints = calculateMinPointsFromProductValue(numericValue)
  const isBelowMinimum =
    numericValue > 0 && pointsRequired > 0 && pointsRequired < suggestedPoints

  return (
    <div className="rounded-xl border-2 border-nh-green-100 bg-nh-green-50/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-nh-green-900">
        <Calculator className="h-4 w-4" aria-hidden="true" />
        Calculadora de pontos
      </div>

      <Input
        label="Valor do produto (R$)"
        type="number"
        min={0}
        step={0.01}
        placeholder="Ex.: 90,00"
        value={productValue}
        onChange={(e) => onProductValueChange(e.target.value)}
        hint={`Regra: mínimo de ${REWARD_REDEMPTION_RATE * 100}% do valor (1 real de compra = 1 ponto)`}
      />

      {numericValue > 0 && (
        <div className="mt-3 space-y-3">
          <div className="rounded-lg bg-white px-4 py-3 text-sm">
            <p className="text-nh-gray-600">
              Produto de{' '}
              <span className="font-semibold text-nh-gray-900">
                {formatCurrency(numericValue)}
              </span>
            </p>
            <p className="mt-1 text-nh-gray-600">
              Pontos mínimos ({REWARD_REDEMPTION_RATE * 100}%):{' '}
              <span className="text-lg font-bold text-nh-green-700">
                {formatPoints(suggestedPoints)} pts
              </span>
            </p>
            <p className="mt-1 text-xs text-nh-gray-500">
              Fórmula: {formatCurrency(numericValue)} ÷ 5% = {formatPoints(suggestedPoints)}{' '}
              pontos
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => onApplyPoints(suggestedPoints)}
          >
            Usar {formatPoints(suggestedPoints)} pontos
          </Button>

          {isBelowMinimum && (
            <p className="text-sm text-nh-red-800" role="alert">
              Atenção: {formatPoints(pointsRequired)} pts está abaixo do mínimo de{' '}
              {formatPoints(suggestedPoints)} pts para este valor.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
