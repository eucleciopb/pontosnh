import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { listSettings, updateSetting } from '@/services/settings.service'
import type { PointsRule } from '@/types/database'

export function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const [realAmount, setRealAmount] = useState(1)
  const [pointsEarned, setPointsEarned] = useState(1)
  const [validityHours, setValidityHours] = useState(720)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: listSettings,
  })

  useEffect(() => {
    if (!settings) return
    const pointsRule = settings.find((s) => s.key === 'points_rule')?.value as PointsRule | undefined
    const validity = settings.find((s) => s.key === 'coupon_validity')?.value as
      | { hours: number }
      | undefined
    if (pointsRule) {
      setRealAmount(pointsRule.real_amount)
      setPointsEarned(pointsRule.points_earned)
    }
    if (validity?.hours) setValidityHours(validity.hours)
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateSetting('points_rule', {
        real_amount: realAmount,
        points_earned: pointsEarned,
      })
      await updateSetting('coupon_validity', { hours: validityHours })
    },
    onSuccess: () => {
      toast.success('Configurações salvas')
      void queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
      </div>
    )
  }

  return (
    <>
      <AdminPageHeader
        title="Configurações"
        description="Parâmetros globais do programa de fidelidade"
      />

      <div className="grid max-w-2xl gap-6">
        <Card padding="lg">
          <CardHeader
            title="Regra de pontuação"
            description="Exemplo: a cada R$ 1,00 o cliente ganha 1 ponto"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Valor em reais (X)"
              type="number"
              min={0.01}
              step={0.01}
              value={realAmount}
              onChange={(e) => setRealAmount(Number(e.target.value))}
            />
            <Input
              label="Pontos ganhos (Y)"
              type="number"
              min={1}
              value={pointsEarned}
              onChange={(e) => setPointsEarned(Number(e.target.value))}
            />
          </div>
          <p className="mt-3 rounded-lg bg-nh-green-50 p-3 text-sm text-nh-green-800">
            Regra atual: a cada <strong>R$ {realAmount}</strong> ={' '}
            <strong>{pointsEarned} ponto(s)</strong>
          </p>
        </Card>

        <Card padding="lg">
          <CardHeader
            title="Validade dos cupons"
            description="Tempo padrão para resgate após emissão"
          />
          <Input
            label="Horas de validade"
            type="number"
            min={1}
            value={validityHours}
            onChange={(e) => setValidityHours(Number(e.target.value))}
            hint={`≈ ${Math.round(validityHours / 24)} dias`}
          />
        </Card>

        <Button
          size="lg"
          className="max-w-xs"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? 'Salvando...' : 'Salvar configurações'}
        </Button>
      </div>
    </>
  )
}
