import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Gift } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TotemLayout } from '@/features/totem/components/TotemLayout'
import { TotemProgress } from '@/features/totem/components/TotemProgress'
import { PointsHighlight } from '@/features/totem/components/RewardCard'
import { useTotemSession } from '@/features/totem/context/TotemSessionContext'
import { useTotemAutoExit } from '@/features/totem/hooks/useTotemAutoExit'
import { BRAND } from '@/lib/constants'
import {
  REDEEM_STEPS,
  TOTEM_REDEEM_SUCCESS_AUTO_EXIT_SECONDS,
  TOTEM_ROUTES,
} from '@/features/totem/constants'
import { formatPoints } from '@/lib/utils'

export function RedeemSuccessPage() {
  const navigate = useNavigate()
  const { redeemResult, resetAll } = useTotemSession()

  const handleExit = useCallback(() => {
    resetAll()
    navigate(TOTEM_ROUTES.home, { replace: true })
  }, [navigate, resetAll])

  const secondsLeft = useTotemAutoExit(TOTEM_REDEEM_SUCCESS_AUTO_EXIT_SECONDS, handleExit)

  if (!redeemResult?.success) {
    return (
      <TotemLayout title="Erro no resgate" showBack backTo={TOTEM_ROUTES.home}>
        <Button fullWidth size="lg" onClick={handleExit}>
          Voltar ao início
        </Button>
      </TotemLayout>
    )
  }

  return (
    <TotemLayout
      progress={
        <TotemProgress
          currentStep={4}
          totalSteps={4}
          stepLabel="Concluído"
          steps={REDEEM_STEPS}
        />
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="text-center">
          <CheckCircle2
            className="mx-auto h-16 w-16 text-nh-green-600"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-3xl font-bold text-nh-gray-900">Resgate realizado!</h1>
        </div>

        <div className="rounded-2xl border-2 border-nh-red-200 bg-nh-red-50 p-6 text-center">
          <Gift className="mx-auto mb-2 h-8 w-8 text-nh-red-700" aria-hidden="true" />
          <p className="text-lg font-semibold text-nh-gray-900">{redeemResult.rewardName}</p>
          <p className="mt-1 text-sm text-nh-red-700">
            -{formatPoints(redeemResult.pointsSpent ?? 0)} pontos
          </p>
        </div>

        {redeemResult.balance !== undefined && (
          <PointsHighlight points={redeemResult.balance} label="Saldo restante" />
        )}

        <p className="text-center text-sm text-nh-gray-600">
          Apresente esta tela no balcão para retirar seu prêmio na {BRAND.company}.
        </p>

        <p className="text-center text-sm font-medium text-nh-green-700">
          Voltando ao início em {secondsLeft}s…
        </p>

        <Button size="xl" fullWidth onClick={handleExit}>
          Voltar agora
        </Button>
      </motion.div>
    </TotemLayout>
  )
}
