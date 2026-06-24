import { useNavigate } from 'react-router-dom'
import { TotemLayout } from '@/features/totem/components/TotemLayout'
import { TotemProgress } from '@/features/totem/components/TotemProgress'
import { RegistrationForm } from '@/features/totem/components/RegistrationForm'
import { useTotemSession } from '@/features/totem/context/TotemSessionContext'
import { EARN_STEPS, TOTEM_ROUTES } from '@/features/totem/constants'
import type { RegistrationFormData } from '@/features/totem/schemas/totem.schemas'
import { formatPhoneDisplay } from '@/lib/utils'

export function EarnRegisterPage() {
  const navigate = useNavigate()
  const { phone, setRegistration } = useTotemSession()

  const handleSubmit = (data: RegistrationFormData) => {
    setRegistration(data)
    navigate(TOTEM_ROUTES.earnCoupon)
  }

  return (
    <TotemLayout
      title="Complete seu cadastro"
      subtitle={`Telefone: ${formatPhoneDisplay(phone)}`}
      showBack
      backTo={TOTEM_ROUTES.earn}
      progress={
        <TotemProgress
          currentStep={2}
          totalSteps={4}
          stepLabel="Cadastro"
          steps={EARN_STEPS}
        />
      }
    >
      <RegistrationForm onSubmit={handleSubmit} />
    </TotemLayout>
  )
}
