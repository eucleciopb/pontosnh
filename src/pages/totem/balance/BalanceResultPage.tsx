import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gift, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TotemLayout } from '@/features/totem/components/TotemLayout'
import { TotemProgress } from '@/features/totem/components/TotemProgress'
import {
  LevelBadge,
  PointsHighlight,
} from '@/features/totem/components/RewardCard'
import { useTotemSession } from '@/features/totem/context/TotemSessionContext'
import { BALANCE_STEPS, TOTEM_ROUTES } from '@/features/totem/constants'
import { formatPhoneDisplay, formatPoints } from '@/lib/utils'

export function BalanceResultPage() {
  const { phone, customer } = useTotemSession()

  if (!customer?.found) {
    return (
      <TotemLayout title="Cliente não encontrado" showBack backTo={TOTEM_ROUTES.balance}>
        <Link to={TOTEM_ROUTES.earn}>
          <Button fullWidth size="lg">
            Cadastrar e ganhar pontos
          </Button>
        </Link>
      </TotemLayout>
    )
  }

  const levelProgress =
    customer.nextLevelMinPoints && customer.lifetimePoints !== undefined
      ? {
          value: customer.lifetimePoints,
          max: customer.nextLevelMinPoints,
        }
      : null

  return (
    <TotemLayout
      title={`Olá, ${customer.firstName}!`}
      subtitle={formatPhoneDisplay(phone)}
      showBack
      backTo={TOTEM_ROUTES.home}
      progress={
        <TotemProgress
          currentStep={2}
          totalSteps={2}
          stepLabel="Saldo"
          steps={BALANCE_STEPS}
        />
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <PointsHighlight points={customer.balance ?? 0} label="Seu saldo" />

        <div className="flex justify-center">
          <LevelBadge
            levelName={customer.levelName ?? 'Bronze'}
            color={customer.levelColor}
          />
        </div>

        {customer.lifetimePoints !== undefined && (
          <div className="rounded-2xl border border-nh-gray-200 bg-white p-5 text-center">
            <p className="text-sm text-nh-gray-500">Pontos acumulados (lifetime)</p>
            <p className="text-2xl font-bold text-nh-gray-900">
              {formatPoints(customer.lifetimePoints)}
            </p>
          </div>
        )}

        {customer.nextLevelName && customer.pointsToNextLevel != null && levelProgress && (
          <div className="rounded-2xl border border-nh-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-nh-gray-700">
              <TrendingUp className="h-4 w-4 text-nh-green-600" />
              Próximo nível: {customer.nextLevelName}
            </div>
            <p className="mb-3 text-sm text-nh-gray-600">
              Faltam {formatPoints(customer.pointsToNextLevel)} pontos
            </p>
            <ProgressBar
              value={levelProgress.value}
              max={levelProgress.max}
              colorClass="bg-nh-green-600"
            />
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={TOTEM_ROUTES.redeem} className="flex-1">
            <Button variant="secondary" size="lg" fullWidth>
              <Gift className="h-5 w-5" />
              Trocar pontos
            </Button>
          </Link>
          <Link to={TOTEM_ROUTES.home} className="flex-1">
            <Button size="lg" fullWidth>
              Voltar ao início
            </Button>
          </Link>
        </div>
      </motion.div>
    </TotemLayout>
  )
}
