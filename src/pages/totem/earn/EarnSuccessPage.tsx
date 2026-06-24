import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Gift, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TotemLayout } from '@/features/totem/components/TotemLayout'
import { TotemProgress } from '@/features/totem/components/TotemProgress'
import { LevelBadge, PointsHighlight } from '@/features/totem/components/RewardCard'
import { useTotemSession } from '@/features/totem/context/TotemSessionContext'
import { EARN_STEPS, TOTEM_ROUTES } from '@/features/totem/constants'
import { BRAND } from '@/lib/constants'
import { formatPoints } from '@/lib/utils'

export function EarnSuccessPage() {
  const { earnResult, resetAll } = useTotemSession()

  if (!earnResult?.success) {
    return (
      <TotemLayout title="Ops!" showBack backTo={TOTEM_ROUTES.home}>
        <p className="text-center text-nh-gray-600">
          Nenhum resultado encontrado. Tente novamente.
        </p>
        <Link to={TOTEM_ROUTES.earn} className="mt-6 block">
          <Button fullWidth size="lg">
            Ganhar pontos
          </Button>
        </Link>
      </TotemLayout>
    )
  }

  const handleFinish = () => {
    resetAll()
  }

  return (
    <TotemLayout
      progress={
        <TotemProgress
          currentStep={4}
          totalSteps={4}
          stepLabel="Concluído"
          steps={EARN_STEPS}
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
          <h1 className="mt-4 text-3xl font-bold text-nh-gray-900">Parabéns!</h1>
          {earnResult.customer_name && (
            <p className="mt-2 text-lg text-nh-gray-600">{earnResult.customer_name}</p>
          )}
        </div>

        <div className="rounded-2xl bg-nh-green-50 px-6 py-4 text-center">
          <p className="text-sm font-medium text-nh-green-800">Pontos adicionados</p>
          <p className="text-4xl font-bold text-nh-green-700">
            +{formatPoints(earnResult.points_added ?? 0)}
          </p>
        </div>

        {earnResult.balance !== undefined && (
          <PointsHighlight points={earnResult.balance} label="Saldo atual" />
        )}

        {earnResult.level_name && (
          <div className="flex justify-center">
            <LevelBadge levelName={earnResult.level_name} />
          </div>
        )}

        {earnResult.next_level_name && earnResult.points_to_next_level != null && (
          <div className="rounded-2xl border border-nh-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-nh-gray-700">
              <TrendingUp className="h-4 w-4 text-nh-green-600" />
              Próximo nível: {earnResult.next_level_name}
            </div>
            <p className="mb-3 text-sm text-nh-gray-600">
              Faltam {formatPoints(earnResult.points_to_next_level)} pontos acumulados
            </p>
          </div>
        )}

        {earnResult.next_reward_name && earnResult.points_to_next_reward != null && (
          <div className="rounded-2xl border border-nh-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-nh-gray-700">
              <Gift className="h-4 w-4 text-nh-red-600" />
              Próximo prêmio: {earnResult.next_reward_name}
            </div>
            <p className="mb-3 text-sm text-nh-gray-600">
              Faltam {formatPoints(earnResult.points_to_next_reward)} pontos para resgatar
            </p>
            <ProgressBar
              value={earnResult.balance ?? 0}
              max={(earnResult.balance ?? 0) + earnResult.points_to_next_reward}
              colorClass="bg-nh-red-600"
            />
          </div>
        )}

        <p className="text-center text-sm text-nh-gray-500">
          Obrigado por comprar na {BRAND.company}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={TOTEM_ROUTES.rewards} className="flex-1" onClick={handleFinish}>
            <Button variant="outline" size="lg" fullWidth>
              Ver prêmios
            </Button>
          </Link>
          <Link to={TOTEM_ROUTES.home} className="flex-1" onClick={handleFinish}>
            <Button size="lg" fullWidth>
              Voltar ao início
            </Button>
          </Link>
        </div>
      </motion.div>
    </TotemLayout>
  )
}
