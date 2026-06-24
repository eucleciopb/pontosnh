import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { TotemLayout } from '@/features/totem/components/TotemLayout'
import { TotemProgress } from '@/features/totem/components/TotemProgress'
import { QrScanner } from '@/features/totem/components/QrScanner'
import { useTotemSession } from '@/features/totem/context/TotemSessionContext'
import { EARN_STEPS, TOTEM_ROUTES } from '@/features/totem/constants'
import { redeemCoupon } from '@/services/totem.service'
import { formatPhoneDisplay } from '@/lib/utils'

export function EarnCouponPage() {
  const navigate = useNavigate()
  const { phone, customer, registration, setEarnResult } = useTotemSession()

  const mutation = useMutation({
    mutationFn: (code: string) => redeemCoupon(code, phone, registration ?? undefined),
    onSuccess: (result) => {
      if (result.needs_registration) {
        toast.error('Cadastro necessário')
        navigate(TOTEM_ROUTES.earnRegister)
        return
      }
      if (!result.success) {
        toast.error(result.message)
        return
      }
      setEarnResult(result)
      navigate(TOTEM_ROUTES.earnSuccess)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleScan = useCallback(
    (code: string) => {
      if (mutation.isPending) return
      mutation.mutate(code)
    },
    [mutation],
  )

  const greeting = customer?.firstName
    ? `Olá, ${customer.firstName}!`
    : registration?.firstName
      ? `Olá, ${registration.firstName}!`
      : 'Quase lá!'

  return (
    <TotemLayout
      title={greeting}
      subtitle={`Informe ou escaneie o cupom · ${formatPhoneDisplay(phone)}`}
      showBack
      backTo={customer?.found ? TOTEM_ROUTES.earn : TOTEM_ROUTES.earnRegister}
      progress={
        <TotemProgress
          currentStep={customer?.found ? 2 : 3}
          totalSteps={4}
          stepLabel="Cupom"
          steps={EARN_STEPS}
        />
      }
    >
      {mutation.isPending ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Loader2 className="h-12 w-12 animate-spin text-nh-green-600" />
          <p className="text-lg font-medium text-nh-gray-700">Validando cupom...</p>
        </div>
      ) : (
        <QrScanner onScan={handleScan} />
      )}
    </TotemLayout>
  )
}
