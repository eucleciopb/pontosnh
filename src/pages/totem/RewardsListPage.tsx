import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TotemLayout } from '@/features/totem/components/TotemLayout'
import { RewardCard } from '@/features/totem/components/RewardCard'
import { TOTEM_ROUTES } from '@/features/totem/constants'
import { listActiveRewards } from '@/services/totem.service'

export function RewardsListPage() {
  const { data: rewards, isLoading, error } = useQuery({
    queryKey: ['totem-rewards'],
    queryFn: listActiveRewards,
  })

  return (
    <TotemLayout
      title="Prêmios disponíveis"
      subtitle="Acumule pontos e troque por recompensas exclusivas"
      showBack
      backTo={TOTEM_ROUTES.home}
    >
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-nh-green-600" />
        </div>
      ) : error ? (
        <p className="text-center text-nh-red-600" role="alert">
          {(error as Error).message}
        </p>
      ) : !rewards?.length ? (
        <p className="text-center text-nh-gray-600">Nenhum prêmio cadastrado ainda.</p>
      ) : (
        <div className="space-y-4">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} variant="showcase" />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-nh-green-50 p-6 text-center">
        <Sparkles className="mx-auto mb-2 h-8 w-8 text-nh-green-600" aria-hidden="true" />
        <p className="font-medium text-nh-green-800">Quer ganhar pontos?</p>
        <p className="mt-1 text-sm text-nh-green-700">
          Faça uma compra e resgate seu cupom no totem.
        </p>
        <Link to={TOTEM_ROUTES.earn} className="mt-4 block">
          <Button size="lg" fullWidth>
            Ganhar pontos
          </Button>
        </Link>
      </div>
    </TotemLayout>
  )
}
