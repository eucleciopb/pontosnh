import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { TotemLayout } from '@/features/totem/components/TotemLayout'
import { TotemProgress } from '@/features/totem/components/TotemProgress'
import { PhoneDisplay } from '@/features/totem/components/PhoneDisplay'
import { NumericKeypad } from '@/features/totem/components/NumericKeypad'
import { useTotemSession } from '@/features/totem/context/TotemSessionContext'
import { REDEEM_STEPS, TOTEM_ROUTES } from '@/features/totem/constants'
import { getCustomerProfile } from '@/services/totem.service'
import { phoneSchema } from '@/features/totem/schemas/totem.schemas'
import { normalizePhone } from '@/lib/utils'

export function RedeemPhonePage() {
  const navigate = useNavigate()
  const { setPhone, setCustomer, resetRedeemFlow } = useTotemSession()
  const [localPhone, setLocalPhone] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = phoneSchema.parse(localPhone)
      const normalized = normalizePhone(parsed)
      setPhone(normalized)
      resetRedeemFlow()
      return getCustomerProfile(normalized)
    },
    onSuccess: (profile) => {
      if (!profile.found) {
        toast.error('Cliente não encontrado. Cadastre-se em Ganhar Pontos.')
        return
      }
      setCustomer(profile)
      navigate(TOTEM_ROUTES.redeemSelect)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return (
    <TotemLayout
      title="Trocar pontos"
      subtitle="Digite seu telefone para ver prêmios disponíveis"
      showBack
      backTo={TOTEM_ROUTES.home}
      progress={
        <TotemProgress
          currentStep={1}
          totalSteps={4}
          stepLabel="Telefone"
          steps={REDEEM_STEPS}
        />
      }
    >
      <div className="mx-auto max-w-sm space-y-6">
        <PhoneDisplay phone={localPhone} />
        <NumericKeypad value={localPhone} onChange={setLocalPhone} />
        <Button
          size="xl"
          fullWidth
          onClick={() => mutation.mutate()}
          disabled={localPhone.replace(/\D/g, '').length < 10 || mutation.isPending}
        >
          {mutation.isPending ? 'Verificando...' : 'Continuar'}
        </Button>
      </div>
    </TotemLayout>
  )
}
