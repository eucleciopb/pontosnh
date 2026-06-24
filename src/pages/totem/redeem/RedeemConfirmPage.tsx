import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Gift } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TotemLayout } from '@/features/totem/components/TotemLayout'
import { TotemProgress } from '@/features/totem/components/TotemProgress'
import { useTotemSession } from '@/features/totem/context/TotemSessionContext'
import { REDEEM_STEPS, REWARD_REDEEM_COOLDOWN_DAYS, TOTEM_ROUTES } from '@/features/totem/constants'
import { redeemReward } from '@/services/totem.service'
import { formatPhoneDisplay, formatPoints } from '@/lib/utils'

export function RedeemConfirmPage() {
  const navigate = useNavigate()
  const { phone, customer, selectedReward, setRedeemResult } = useTotemSession()

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedReward) throw new Error('Nenhum prêmio selecionado')
      return redeemReward(phone, selectedReward.id)
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message)
        return
      }
      setRedeemResult(result)
      navigate(TOTEM_ROUTES.redeemSuccess)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  if (!selectedReward || !customer) {
    return (
      <TotemLayout title="Nenhum prêmio selecionado" showBack backTo={TOTEM_ROUTES.redeemSelect}>
        <Button fullWidth onClick={() => navigate(TOTEM_ROUTES.redeemSelect)}>
          Escolher prêmio
        </Button>
      </TotemLayout>
    )
  }

  const balanceAfter = (customer.balance ?? 0) - selectedReward.points_required

  return (
    <TotemLayout
      title="Confirmar resgate"
      subtitle={formatPhoneDisplay(phone)}
      showBack
      backTo={TOTEM_ROUTES.redeemSelect}
      progress={
        <TotemProgress
          currentStep={3}
          totalSteps={4}
          stepLabel="Confirmar"
          steps={REDEEM_STEPS}
        />
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-nh-green-200 bg-nh-green-50 p-6 text-center">
          <Gift className="mx-auto mb-3 h-10 w-10 text-nh-green-700" aria-hidden="true" />
          <h2 className="text-xl font-bold text-nh-gray-900">{selectedReward.name}</h2>
          {selectedReward.description && (
            <p className="mt-2 text-sm text-nh-gray-600">{selectedReward.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-nh-gray-200">
            <p className="text-xs text-nh-gray-500">Custo</p>
            <p className="text-xl font-bold text-nh-red-700">
              {formatPoints(selectedReward.points_required)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-nh-gray-200">
            <p className="text-xs text-nh-gray-500">Saldo após</p>
            <p className="text-xl font-bold text-nh-green-700">{formatPoints(balanceAfter)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-nh-red-50 p-4 text-sm text-nh-red-900 ring-1 ring-nh-red-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            Esta ação não pode ser desfeita. Os pontos serão debitados imediatamente do seu
            saldo. O mesmo prêmio só poderá ser resgatado novamente após{' '}
            {REWARD_REDEEM_COOLDOWN_DAYS} dias.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate(TOTEM_ROUTES.redeemSelect)}
            disabled={mutation.isPending}
          >
            Voltar
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Resgatando...' : 'Confirmar resgate'}
          </Button>
        </div>
      </div>
    </TotemLayout>
  )
}
