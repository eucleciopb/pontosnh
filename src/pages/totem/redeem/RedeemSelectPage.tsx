import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, Loader2 } from 'lucide-react'
import { TotemLayout } from '@/features/totem/components/TotemLayout'
import { TotemProgress } from '@/features/totem/components/TotemProgress'
import { RewardCard } from '@/features/totem/components/RewardCard'
import { useTotemSession } from '@/features/totem/context/TotemSessionContext'
import { REDEEM_STEPS, REWARD_REDEEM_COOLDOWN_DAYS, TOTEM_ROUTES } from '@/features/totem/constants'
import { getRewardCooldowns, listActiveRewards } from '@/services/totem.service'
import { formatPhoneDisplay, formatPoints } from '@/lib/utils'
import type { Reward } from '@/types/database'

export function RedeemSelectPage() {
  const navigate = useNavigate()
  const { phone, customer, setSelectedReward } = useTotemSession()

  const { data: rewards, isLoading, error } = useQuery({
    queryKey: ['totem-rewards'],
    queryFn: listActiveRewards,
  })

  const { data: cooldowns } = useQuery({
    queryKey: ['totem-reward-cooldowns', phone],
    queryFn: () => getRewardCooldowns(phone),
    enabled: Boolean(phone),
  })

  const cooldownMap = useMemo(
    () => new Map(cooldowns?.map((c) => [c.rewardId, c]) ?? []),
    [cooldowns],
  )

  const balance = customer?.balance ?? 0

  const handleSelect = (reward: Reward) => {
    if (balance < reward.points_required) return
    if (cooldownMap.get(reward.id)?.onCooldown) return
    setSelectedReward(reward)
    navigate(TOTEM_ROUTES.redeemConfirm)
  }

  const allBlocked =
    rewards?.length &&
    rewards.every((r) => {
      const blocked = cooldownMap.get(r.id)?.onCooldown
      return balance < r.points_required || blocked
    })

  return (
    <TotemLayout
      title="Escolha seu prêmio"
      subtitle={`Saldo: ${formatPoints(balance)} pts · ${formatPhoneDisplay(phone)}`}
      showBack
      backTo={TOTEM_ROUTES.redeem}
      progress={
        <TotemProgress
          currentStep={2}
          totalSteps={4}
          stepLabel="Prêmio"
          steps={REDEEM_STEPS}
        />
      }
    >
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-nh-green-50 p-4 text-sm text-nh-green-900 ring-1 ring-nh-green-200">
        <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          Cada prêmio pode ser resgatado <strong>1 vez a cada {REWARD_REDEEM_COOLDOWN_DAYS} dias</strong>.
          Prêmios resgatados recentemente aparecem bloqueados até a data de liberação.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-nh-green-600" />
        </div>
      ) : error ? (
        <p className="text-center text-nh-red-600" role="alert">
          {(error as Error).message}
        </p>
      ) : !rewards?.length ? (
        <p className="text-center text-nh-gray-600">Nenhum prêmio disponível no momento.</p>
      ) : (
        <div className="space-y-4">
          {rewards.map((reward) => {
            const cooldown = cooldownMap.get(reward.id)
            return (
              <RewardCard
                key={reward.id}
                reward={reward}
                customerBalance={balance}
                showAffordability
                cooldown={
                  cooldown
                    ? {
                        onCooldown: cooldown.onCooldown,
                        nextAvailableAt: cooldown.nextAvailableAt,
                      }
                    : undefined
                }
                onSelect={handleSelect}
              />
            )
          })}
        </div>
      )}

      {!isLoading && allBlocked && (
        <div className="mt-6 rounded-xl bg-nh-red-50 p-4 text-center text-sm text-nh-red-800 ring-1 ring-nh-red-200">
          {rewards?.every((r) => balance < r.points_required)
            ? 'Você ainda não tem pontos suficientes. Continue comprando para acumular!'
            : 'Os prêmios que você pode resgatar estão em intervalo de 15 dias. Tente outro prêmio ou volte mais tarde.'}
        </div>
      )}
    </TotemLayout>
  )
}
