import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { Modal } from '@/features/admin/components/Modal'
import { RewardPointsCalculator } from '@/features/admin/components/RewardPointsCalculator'
import {
  calculateMinPointsFromProductValue,
  calculateProductValueFromPoints,
} from '@/features/admin/utils/rewardPointsCalculator'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import {
  createReward,
  listRewardsAdmin,
  updateReward,
  type RewardInput,
} from '@/services/reward.service'
import { formatPoints } from '@/lib/utils'
import type { Reward, RewardStatus } from '@/types/database'

const emptyForm: RewardInput = {
  name: '',
  description: '',
  image_url: '',
  category: '',
  points_required: 100,
  quantity: null,
  status: 'active',
  sort_order: 0,
}

export function AdminRewardsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Reward | null>(null)
  const [form, setForm] = useState<RewardInput>(emptyForm)
  const [productValue, setProductValue] = useState('')

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['admin-rewards'],
    queryFn: listRewardsAdmin,
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing ? updateReward(editing.id, form) : createReward(form),
    onSuccess: () => {
      toast.success(editing ? 'Prêmio atualizado' : 'Prêmio criado')
      setModalOpen(false)
      setEditing(null)
      setForm(emptyForm)
      setProductValue('')
      void queryClient.invalidateQueries({ queryKey: ['admin-rewards'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setProductValue('')
    setModalOpen(true)
  }

  const openEdit = (reward: Reward) => {
    setEditing(reward)
    setForm({
      name: reward.name,
      description: reward.description ?? '',
      image_url: reward.image_url ?? '',
      category: reward.category ?? '',
      points_required: reward.points_required,
      quantity: reward.quantity,
      status: reward.status,
      sort_order: reward.sort_order,
    })
    setProductValue(String(calculateProductValueFromPoints(reward.points_required)))
    setModalOpen(true)
  }

  const handleSave = () => {
    const value = parseFloat(productValue.replace(',', '.')) || 0
    if (value > 0) {
      const minPoints = calculateMinPointsFromProductValue(value)
      if (form.points_required < minPoints) {
        toast.error(
          `Pontos abaixo do mínimo. Para ${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} são necessários pelo menos ${minPoints.toLocaleString('pt-BR')} pontos (5%).`,
        )
        return
      }
    }
    saveMutation.mutate()
  }

  return (
    <>
      <AdminPageHeader
        title="Prêmios"
        description="Recompensas disponíveis para resgate no totem"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo prêmio
          </Button>
        }
      />

      <Card padding="lg">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
          </div>
        ) : !rewards?.length ? (
          <p className="py-12 text-center text-nh-gray-500">Nenhum prêmio cadastrado.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="rounded-2xl border border-nh-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-nh-gray-900">{reward.name}</h3>
                    {reward.category && (
                      <Badge variant="neutral" className="mt-1">
                        {reward.category}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(reward)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                {reward.description && (
                  <p className="mt-2 text-sm text-nh-gray-600 line-clamp-2">
                    {reward.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-nh-green-700">
                    {formatPoints(reward.points_required)} pts
                  </span>
                  <Badge
                    variant={
                      reward.status === 'active'
                        ? 'success'
                        : reward.status === 'out_of_stock'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {reward.status}
                  </Badge>
                </div>
                {reward.quantity !== null && (
                  <p className="mt-1 text-xs text-nh-gray-500">
                    Estoque: {reward.quantity - reward.quantity_redeemed} / {reward.quantity}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setProductValue('')
        }}
        title={editing ? 'Editar prêmio' : 'Novo prêmio'}
      >
        <div className="space-y-4">
          <Input
            label="Nome *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Descrição"
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="URL da imagem"
            value={form.image_url ?? ''}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            hint="Link público da imagem do prêmio"
          />
          <Input
            label="Categoria"
            value={form.category ?? ''}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <RewardPointsCalculator
            productValue={productValue}
            onProductValueChange={setProductValue}
            pointsRequired={form.points_required}
            onApplyPoints={(points) => setForm({ ...form, points_required: points })}
          />

          <Input
            label="Pontos necessários *"
            type="number"
            min={1}
            value={form.points_required}
            onChange={(e) =>
              setForm({ ...form, points_required: Number(e.target.value) })
            }
            hint="Use a calculadora acima ou informe manualmente (respeitando o mínimo de 5%)"
          />
          <Input
            label="Quantidade (vazio = ilimitado)"
            type="number"
            min={0}
            value={form.quantity ?? ''}
            onChange={(e) =>
              setForm({
                ...form,
                quantity: e.target.value === '' ? null : Number(e.target.value),
              })
            }
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-nh-gray-700">
              Status
            </label>
            <select
              className="h-14 w-full rounded-xl border-2 border-nh-gray-200 px-4"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as RewardStatus })
              }
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="out_of_stock">Esgotado</option>
            </select>
          </div>
          <Button fullWidth disabled={saveMutation.isPending} onClick={handleSave}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
