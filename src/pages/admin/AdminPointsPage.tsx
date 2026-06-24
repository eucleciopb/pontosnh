import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { Modal } from '@/features/admin/components/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { adjustPoints, listPointTransactions } from '@/services/settings.service'
import { listCustomers } from '@/services/customer.service'
import { formatPhoneDisplay, formatPoints, cn } from '@/lib/utils'
import type { PointTransactionType } from '@/types/database'

const TX_LABELS: Record<PointTransactionType, string> = {
  earn: 'Crédito',
  redeem: 'Resgate',
  adjust: 'Ajuste',
  expire: 'Expiração',
  campaign_bonus: 'Campanha',
  refund: 'Estorno',
}

export function AdminPointsPage() {
  const queryClient = useQueryClient()
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [points, setPoints] = useState(0)
  const [description, setDescription] = useState('')

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => listPointTransactions(100),
  })

  const { data: customers } = useQuery({
    queryKey: ['admin-customers-adjust', customerSearch],
    queryFn: () => listCustomers(customerSearch || undefined, 10),
    enabled: adjustOpen && customerSearch.length >= 2,
  })

  const adjustMutation = useMutation({
    mutationFn: () => adjustPoints(selectedCustomerId, points, description),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setAdjustOpen(false)
      setPoints(0)
      setDescription('')
      void queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <>
      <AdminPageHeader
        title="Pontos"
        description="Extrato global e ajustes manuais"
        action={
          <Button variant="secondary" onClick={() => setAdjustOpen(true)}>
            Ajustar pontos
          </Button>
        }
      />

      <Card padding="lg">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
          </div>
        ) : !transactions?.length ? (
          <p className="py-12 text-center text-nh-gray-500">Sem transações.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-3 text-left font-medium">Data</th>
                  <th className="pb-3 text-left font-medium">Cliente</th>
                  <th className="pb-3 text-left font-medium">Tipo</th>
                  <th className="pb-3 text-left font-medium">Pontos</th>
                  <th className="pb-3 text-left font-medium">Saldo após</th>
                  <th className="pb-3 text-left font-medium">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const cust = tx.customers as unknown as {
                    first_name: string
                    last_name: string
                    phone: string
                  } | null
                  return (
                    <tr key={tx.id} className="border-b border-nh-gray-100">
                      <td className="py-3">
                        {format(new Date(tx.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="py-3">
                        {cust
                          ? `${cust.first_name} ${cust.last_name}`
                          : '—'}
                        {cust && (
                          <span className="block text-xs text-nh-gray-500">
                            {formatPhoneDisplay(cust.phone)}
                          </span>
                        )}
                      </td>
                      <td className="py-3">{TX_LABELS[tx.type]}</td>
                      <td
                        className={cn(
                          'py-3 font-semibold',
                          tx.points >= 0 ? 'text-nh-green-700' : 'text-nh-red-700',
                        )}
                      >
                        {tx.points >= 0 ? '+' : ''}
                        {formatPoints(tx.points)}
                      </td>
                      <td className="py-3">{formatPoints(tx.balance_after)}</td>
                      <td className="py-3 text-nh-gray-600">{tx.description ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Ajustar pontos">
        <div className="space-y-4">
          <Input
            label="Buscar cliente"
            placeholder="Nome ou telefone..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
          {customers && customers.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-nh-gray-200">
              {customers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCustomerId(c.id)
                    setCustomerSearch(`${c.first_name} ${c.last_name}`)
                  }}
                  className={cn(
                    'block w-full px-4 py-2 text-left text-sm hover:bg-nh-gray-50',
                    selectedCustomerId === c.id && 'bg-nh-green-50',
                  )}
                >
                  {c.first_name} {c.last_name} — {formatPhoneDisplay(c.phone)}
                </button>
              ))}
            </div>
          )}
          <Input
            label="Pontos (+ crédito / − débito)"
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
          <Input
            label="Motivo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            fullWidth
            disabled={!selectedCustomerId || points === 0 || adjustMutation.isPending}
            onClick={() => adjustMutation.mutate()}
          >
            {adjustMutation.isPending ? 'Aplicando...' : 'Confirmar ajuste'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
