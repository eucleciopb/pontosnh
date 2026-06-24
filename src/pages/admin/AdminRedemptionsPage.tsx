import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { listRedemptions } from '@/services/customer.service'
import { formatPhoneDisplay, formatPoints } from '@/lib/utils'

export function AdminRedemptionsPage() {
  const { data: redemptions, isLoading } = useQuery({
    queryKey: ['admin-redemptions'],
    queryFn: () => listRedemptions(100),
  })

  return (
    <>
      <AdminPageHeader
        title="Resgates"
        description="Histórico de prêmios resgatados pelos clientes"
      />

      <Card padding="lg">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
          </div>
        ) : !redemptions?.length ? (
          <p className="py-12 text-center text-nh-gray-500">Nenhum resgate registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-3 text-left font-medium">Data</th>
                  <th className="pb-3 text-left font-medium">Cliente</th>
                  <th className="pb-3 text-left font-medium">Prêmio</th>
                  <th className="pb-3 text-left font-medium">Pontos</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r) => (
                  <tr key={r.id} className="border-b border-nh-gray-100">
                    <td className="py-3">
                      {format(new Date(r.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                    </td>
                    <td className="py-3">
                      {r.customers
                        ? `${r.customers.first_name} ${r.customers.last_name}`
                        : '—'}
                      {r.customers && (
                        <span className="block text-xs text-nh-gray-500">
                          {formatPhoneDisplay(r.customers.phone)}
                        </span>
                      )}
                    </td>
                    <td className="py-3">{r.rewards?.name ?? '—'}</td>
                    <td className="py-3 font-semibold text-nh-red-700">
                      -{formatPoints(r.points_spent)}
                    </td>
                    <td className="py-3">
                      <Badge variant={r.status === 'completed' ? 'success' : 'neutral'}>
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
