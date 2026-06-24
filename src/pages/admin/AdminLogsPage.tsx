import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { listAuditLogs } from '@/services/settings.service'
import type { AuditAction } from '@/types/database'

const ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  redeem: 'Resgate',
  cancel: 'Cancelamento',
  login: 'Login',
  export: 'Exportação',
}

export function AdminLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: () => listAuditLogs(200),
  })

  return (
    <>
      <AdminPageHeader
        title="Logs de auditoria"
        description="Registro de ações no sistema"
      />

      <Card padding="lg">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
          </div>
        ) : !logs?.length ? (
          <p className="py-12 text-center text-nh-gray-500">Nenhum log registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-3 text-left font-medium">Data</th>
                  <th className="pb-3 text-left font-medium">Ação</th>
                  <th className="pb-3 text-left font-medium">Entidade</th>
                  <th className="pb-3 text-left font-medium">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-nh-gray-100">
                    <td className="py-3 whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd/MM/yy HH:mm:ss', {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="py-3">
                      <Badge variant="neutral">{ACTION_LABELS[log.action]}</Badge>
                    </td>
                    <td className="py-3 capitalize">
                      {log.entity_type}
                      {log.entity_id && (
                        <span className="block text-xs text-nh-gray-400 font-mono truncate max-w-[120px]">
                          {log.entity_id}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-nh-gray-600">
                      {log.metadata && typeof log.metadata === 'object'
                        ? JSON.stringify(log.metadata)
                        : '—'}
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
