import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { Modal } from '@/features/admin/components/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import {
  CAMPAIGN_TYPE_LABELS,
  createCampaign,
  listCampaigns,
  updateCampaign,
  type CampaignInput,
} from '@/services/campaign.service'
import type { Campaign, CampaignType } from '@/types/database'

const emptyForm: CampaignInput = {
  name: '',
  description: '',
  type: 'double_points',
  multiplier: 2,
  start_date: new Date().toISOString().slice(0, 16),
  end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
  is_active: true,
}

export function AdminCampaignsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [form, setForm] = useState<CampaignInput>(emptyForm)

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: listCampaigns,
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      }
      return editing ? updateCampaign(editing.id, payload) : createCampaign(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Campanha atualizada' : 'Campanha criada')
      setModalOpen(false)
      setEditing(null)
      setForm(emptyForm)
      void queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (c: Campaign) => {
    setEditing(c)
    setForm({
      name: c.name,
      description: c.description ?? '',
      type: c.type,
      multiplier: Number(c.multiplier),
      start_date: c.start_date.slice(0, 16),
      end_date: c.end_date.slice(0, 16),
      is_active: c.is_active,
    })
    setModalOpen(true)
  }

  return (
    <>
      <AdminPageHeader
        title="Campanhas"
        description="Promoções e multiplicadores de pontos"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova campanha
          </Button>
        }
      />

      <Card padding="lg">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
          </div>
        ) : !campaigns?.length ? (
          <p className="py-12 text-center text-nh-gray-500">Nenhuma campanha.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-3 text-left font-medium">Nome</th>
                  <th className="pb-3 text-left font-medium">Tipo</th>
                  <th className="pb-3 text-left font-medium">Multiplicador</th>
                  <th className="pb-3 text-left font-medium">Período</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-nh-gray-100">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3">{CAMPAIGN_TYPE_LABELS[c.type]}</td>
                    <td className="py-3">{Number(c.multiplier)}x</td>
                    <td className="py-3 text-nh-gray-600">
                      {format(new Date(c.start_date), 'dd/MM/yy', { locale: ptBR })} —{' '}
                      {format(new Date(c.end_date), 'dd/MM/yy', { locale: ptBR })}
                    </td>
                    <td className="py-3">
                      <Badge variant={c.is_active ? 'success' : 'neutral'}>
                        {c.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar campanha' : 'Nova campanha'}
        className="max-w-xl"
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
          <div>
            <label className="mb-2 block text-sm font-medium">Tipo</label>
            <select
              className="h-14 w-full rounded-xl border-2 border-nh-gray-200 px-4"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as CampaignType })
              }
            >
              {Object.entries(CAMPAIGN_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Multiplicador"
            type="number"
            step="0.1"
            min={1}
            value={form.multiplier}
            onChange={(e) => setForm({ ...form, multiplier: Number(e.target.value) })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Início"
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
            <Input
              label="Fim"
              type="datetime-local"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded"
            />
            <span className="text-sm">Campanha ativa</span>
          </label>
          <Button fullWidth disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
