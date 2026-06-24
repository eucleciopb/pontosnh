import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { CouponStatusBadge } from '@/features/coupons/components/CouponStatusBadge'
import {
  getCustomer,
  getCustomerCoupons,
  getCustomerRedemptions,
  getCustomerTransactions,
  updateCustomer,
} from '@/services/customer.service'
import { formatPhoneDisplay, formatPoints, formatCurrency, cn } from '@/lib/utils'
import type { PointTransactionType } from '@/types/database'

const TX_LABELS: Record<PointTransactionType, string> = {
  earn: 'Crédito',
  redeem: 'Resgate',
  adjust: 'Ajuste',
  expire: 'Expiração',
  campaign_bonus: 'Campanha',
  refund: 'Estorno',
}

const tabs = ['info', 'transacoes', 'cupons', 'resgates'] as const
type Tab = (typeof tabs)[number]

const tabLabels: Record<Tab, string> = {
  info: 'Dados',
  transacoes: 'Transações',
  cupons: 'Cupons',
  resgates: 'Resgates',
}

export function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('info')

  const customerQuery = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id!),
    enabled: Boolean(id),
  })

  const txQuery = useQuery({
    queryKey: ['customer-tx', id],
    queryFn: () => getCustomerTransactions(id!),
    enabled: Boolean(id) && tab === 'transacoes',
  })

  const couponsQuery = useQuery({
    queryKey: ['customer-coupons', id],
    queryFn: () => getCustomerCoupons(id!),
    enabled: Boolean(id) && tab === 'cupons',
  })

  const redemptionsQuery = useQuery({
    queryKey: ['customer-redemptions', id],
    queryFn: () => getCustomerRedemptions(id!),
    enabled: Boolean(id) && tab === 'resgates',
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateCustomer>[1]) =>
      updateCustomer(id!, payload),
    onSuccess: () => {
      toast.success('Cliente atualizado')
      void queryClient.invalidateQueries({ queryKey: ['customer', id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const customer = customerQuery.data

  if (customerQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center">
        <p className="text-nh-gray-600">Cliente não encontrado.</p>
        <Link to="/admin/clientes" className="mt-4 inline-block">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link
        to="/admin/clientes"
        className="mb-4 inline-flex items-center gap-2 text-sm text-nh-gray-600 hover:text-nh-green-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para clientes
      </Link>

      <AdminPageHeader
        title={`${customer.first_name} ${customer.last_name}`}
        description={formatPhoneDisplay(customer.phone)}
        action={
          <Button
            variant={customer.is_active ? 'outline' : 'primary'}
            size="sm"
            onClick={() =>
              updateMutation.mutate({ is_active: !customer.is_active })
            }
          >
            {customer.is_active ? 'Desativar' : 'Ativar'}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card padding="md">
          <p className="text-xs text-nh-gray-500">Saldo</p>
          <p className="text-2xl font-bold text-nh-green-700">
            {formatPoints(customer.balance_points)}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-nh-gray-500">Lifetime</p>
          <p className="text-2xl font-bold">{formatPoints(customer.lifetime_points)}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-nh-gray-500">Nível</p>
          <p className="text-lg font-semibold">{customer.levels?.name ?? 'Bronze'}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-nh-gray-500">Status</p>
          <Badge variant={customer.is_active ? 'success' : 'error'} className="mt-1">
            {customer.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </Card>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition',
              tab === t
                ? 'bg-nh-green-600 text-white'
                : 'bg-white text-nh-gray-600 ring-1 ring-nh-gray-200 hover:bg-nh-gray-50',
            )}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <Card padding="lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" defaultValue={customer.first_name} id="fn" readOnly />
            <Input label="Sobrenome" defaultValue={customer.last_name} readOnly />
            <Input label="E-mail" defaultValue={customer.email ?? ''} readOnly />
            <Input label="Cidade" defaultValue={customer.city ?? ''} readOnly />
            <Input
              label="Cadastro"
              defaultValue={format(new Date(customer.created_at), 'dd/MM/yyyy HH:mm', {
                locale: ptBR,
              })}
              readOnly
            />
            <Input
              label="LGPD"
              defaultValue={
                customer.lgpd_accepted_at
                  ? format(new Date(customer.lgpd_accepted_at), 'dd/MM/yyyy', { locale: ptBR })
                  : '—'
              }
              readOnly
            />
          </div>
        </Card>
      )}

      {tab === 'transacoes' && (
        <Card padding="lg">
          {txQuery.isLoading ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-nh-green-600" />
          ) : !txQuery.data?.length ? (
            <p className="text-center text-nh-gray-500">Sem transações.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-2 text-left font-medium">Data</th>
                  <th className="pb-2 text-left font-medium">Tipo</th>
                  <th className="pb-2 text-left font-medium">Pontos</th>
                  <th className="pb-2 text-left font-medium">Saldo após</th>
                  <th className="pb-2 text-left font-medium">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {txQuery.data.map((tx) => (
                  <tr key={tx.id} className="border-b border-nh-gray-100">
                    <td className="py-2">
                      {format(new Date(tx.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                    </td>
                    <td className="py-2">{TX_LABELS[tx.type as PointTransactionType]}</td>
                    <td
                      className={cn(
                        'py-2 font-semibold',
                        tx.points >= 0 ? 'text-nh-green-700' : 'text-nh-red-700',
                      )}
                    >
                      {tx.points >= 0 ? '+' : ''}
                      {formatPoints(tx.points)}
                    </td>
                    <td className="py-2">{formatPoints(tx.balance_after)}</td>
                    <td className="py-2 text-nh-gray-600">{tx.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === 'cupons' && (
        <Card padding="lg">
          {couponsQuery.isLoading ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          ) : !couponsQuery.data?.length ? (
            <p className="text-center text-nh-gray-500">Nenhum cupom resgatado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-2 text-left">Código</th>
                  <th className="pb-2 text-left">Valor</th>
                  <th className="pb-2 text-left">Pontos</th>
                  <th className="pb-2 text-left">Status</th>
                  <th className="pb-2 text-left">Utilizado em</th>
                </tr>
              </thead>
              <tbody>
                {couponsQuery.data.map((cp) => (
                  <tr key={cp.id} className="border-b border-nh-gray-100">
                    <td className="py-2 font-mono">{cp.code}</td>
                    <td className="py-2">{formatCurrency(Number(cp.purchase_amount))}</td>
                    <td className="py-2">{formatPoints(cp.points_value)}</td>
                    <td className="py-2">
                      <CouponStatusBadge status={cp.status} />
                    </td>
                    <td className="py-2">
                      {cp.used_at
                        ? format(new Date(cp.used_at), 'dd/MM/yy HH:mm', { locale: ptBR })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === 'resgates' && (
        <Card padding="lg">
          {redemptionsQuery.isLoading ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          ) : !redemptionsQuery.data?.length ? (
            <p className="text-center text-nh-gray-500">Nenhum resgate.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-2 text-left">Prêmio</th>
                  <th className="pb-2 text-left">Pontos</th>
                  <th className="pb-2 text-left">Status</th>
                  <th className="pb-2 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {redemptionsQuery.data.map((r) => (
                  <tr key={r.id} className="border-b border-nh-gray-100">
                    <td className="py-2">
                      {(r as unknown as { rewards?: { name: string } }).rewards?.name ?? '—'}
                    </td>
                    <td className="py-2">{formatPoints(r.points_spent)}</td>
                    <td className="py-2 capitalize">{r.status}</td>
                    <td className="py-2">
                      {format(new Date(r.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </>
  )
}
