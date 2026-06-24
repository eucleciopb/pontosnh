import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Clock, Gift, Star, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn, formatPoints } from '@/lib/utils'
import type { Reward } from '@/types/database'

interface RewardCooldownInfo {
  onCooldown: boolean
  nextAvailableAt?: string | null
}

interface RewardCardProps {
  reward: Reward
  customerBalance?: number
  onSelect?: (reward: Reward) => void
  selected?: boolean
  showAffordability?: boolean
  variant?: 'compact' | 'showcase'
  cooldown?: RewardCooldownInfo
  className?: string
}

function RewardImage({
  reward,
  className,
  iconClassName = 'h-6 w-6',
}: {
  reward: Reward
  className?: string
  iconClassName?: string
}) {
  const [failed, setFailed] = useState(false)

  if (reward.image_url && !failed) {
    return (
      <img
        src={reward.image_url}
        alt={reward.name}
        className={cn('object-cover', className)}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-nh-green-100 text-nh-green-700',
        className,
      )}
      aria-hidden="true"
    >
      <Gift className={iconClassName} />
    </div>
  )
}

export function RewardCard({
  reward,
  customerBalance,
  onSelect,
  selected = false,
  showAffordability = false,
  variant = 'compact',
  cooldown,
  className,
}: RewardCardProps) {
  const canAfford =
    customerBalance === undefined || customerBalance >= reward.points_required
  const onCooldown = cooldown?.onCooldown ?? false
  const remaining =
    reward.quantity !== null ? reward.quantity - reward.quantity_redeemed : null
  const isSelectable =
    onSelect && (!showAffordability || canAfford) && !onCooldown

  const cooldownLabel =
    onCooldown && cooldown?.nextAvailableAt
      ? format(new Date(cooldown.nextAvailableAt), 'dd/MM/yyyy', { locale: ptBR })
      : null

  const meta = (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {onCooldown && cooldownLabel && (
          <Badge variant="warning">
            <Clock className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
            Disponível em {cooldownLabel}
          </Badge>
        )}
        {remaining !== null && (
          <Badge variant={remaining > 0 ? 'info' : 'error'}>
            {remaining > 0 ? `${remaining} disponíveis` : 'Esgotado'}
          </Badge>
        )}
        {showAffordability && customerBalance !== undefined && !onCooldown && (
          <Badge variant={canAfford ? 'success' : 'warning'}>
            {canAfford
              ? 'Você pode resgatar'
              : `Faltam ${formatPoints(reward.points_required - customerBalance)} pts`}
          </Badge>
        )}
      </div>
    </>
  )

  const content =
    variant === 'showcase' ? (
      <>
        <RewardImage
          reward={reward}
          className="h-48 w-full sm:h-56"
          iconClassName="h-12 w-12"
        />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-nh-gray-900">{reward.name}</h3>
              {reward.category && (
                <Badge variant="neutral" className="mt-2">
                  {reward.category}
                </Badge>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-bold text-nh-green-700">
                {formatPoints(reward.points_required)}
              </p>
              <p className="text-xs text-nh-gray-500">pontos</p>
            </div>
          </div>
          {reward.description && (
            <p className="mt-3 text-sm text-nh-gray-600">{reward.description}</p>
          )}
          {meta}
        </div>
      </>
    ) : (
      <>
        <div className="flex items-start justify-between gap-3">
          <RewardImage
            reward={reward}
            className="h-16 w-16 shrink-0 rounded-xl"
            iconClassName="h-7 w-7"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-nh-gray-900">{reward.name}</h3>
            {reward.category && (
              <Badge variant="neutral" className="mt-1">
                {reward.category}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-nh-green-700">
              {formatPoints(reward.points_required)}
            </p>
            <p className="text-xs text-nh-gray-500">pontos</p>
          </div>
        </div>
        {reward.description && (
          <p className="mt-3 text-sm text-nh-gray-600">{reward.description}</p>
        )}
        {meta}
      </>
    )

  const cardClassName = cn(
    variant === 'showcase'
      ? 'overflow-hidden rounded-2xl border-2 bg-white shadow-sm'
      : 'rounded-2xl border-2 bg-white p-5 shadow-sm',
    selected
      ? 'border-nh-green-600 ring-2 ring-nh-green-600/20'
      : 'border-nh-gray-200',
    onCooldown && 'opacity-60',
    className,
  )

  if (isSelectable) {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(reward)}
        className={cn(
          'w-full text-left transition',
          cardClassName,
          !selected && !onCooldown && 'hover:border-nh-green-300',
          !canAfford && showAffordability && !onCooldown && 'opacity-60',
          onCooldown && 'cursor-not-allowed',
        )}
      >
        {content}
      </motion.button>
    )
  }

  return <div className={cardClassName}>{content}</div>
}

export function LevelBadge({
  levelName,
  color,
}: {
  levelName: string
  color?: string
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-nh-gray-100 px-4 py-2">
      <Trophy className="h-4 w-4 text-nh-green-600" style={{ color }} aria-hidden="true" />
      <span className="font-semibold text-nh-gray-800">Nível {levelName}</span>
    </div>
  )
}

export function PointsHighlight({ points, label }: { points: number; label: string }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-nh-green-600 to-nh-green-700 px-6 py-8 text-center text-white shadow-nh-lg">
      <Star className="mx-auto mb-2 h-8 w-8 opacity-80" aria-hidden="true" />
      <p className="text-sm font-medium uppercase tracking-wide opacity-90">{label}</p>
      <p className="mt-1 text-5xl font-bold">{formatPoints(points)}</p>
      <p className="mt-1 text-sm opacity-90">pontos</p>
    </div>
  )
}
