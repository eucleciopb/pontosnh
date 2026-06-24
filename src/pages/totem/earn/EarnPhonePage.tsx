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
import { EARN_STEPS, TOTEM_ROUTES } from '@/features/totem/constants'
import { lookupCustomer } from '@/services/totem.service'
import { phoneSchema } from '@/features/totem/schemas/totem.schemas'
import { normalizePhone } from '@/lib/utils'

export function EarnPhonePage() {
  const navigate = useNavigate()
  const { phone, setPhone, setCustomer, resetEarnFlow } = useTotemSession()
  const [localPhone, setLocalPhone] = useState(phone)

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = phoneSchema.parse(localPhone)
      const normalized = normalizePhone(parsed)
      setPhone(normalized)
      return lookupCustomer(normalized)
    },
    onSuccess: (customer) => {
      setCustomer(customer)
      if (customer.found) {
        navigate(TOTEM_ROUTES.earnCoupon)
      } else {
        navigate(TOTEM_ROUTES.earnRegister)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleContinue = () => {
    resetEarnFlow()
    mutation.mutate()
  }

  return (
    <TotemLayout
      title="Qual é seu telefone?"
      subtitle="Usamos seu celular para identificar sua conta"
      showBack
      backTo={TOTEM_ROUTES.home}
      progress={
        <TotemProgress
          currentStep={1}
          totalSteps={4}
          stepLabel="Telefone"
          steps={EARN_STEPS}
        />
      }
    >
      <div className="mx-auto max-w-sm space-y-6">
        <PhoneDisplay phone={localPhone} />
        <NumericKeypad value={localPhone} onChange={setLocalPhone} />
        <Button
          size="xl"
          fullWidth
          onClick={handleContinue}
          disabled={localPhone.replace(/\D/g, '').length < 10 || mutation.isPending}
        >
          {mutation.isPending ? 'Verificando...' : 'Continuar'}
        </Button>
      </div>
    </TotemLayout>
  )
}
