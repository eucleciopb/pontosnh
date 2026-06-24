import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { listStaffProfiles, updateStaffProfile } from '@/services/settings.service'
import type { UserRole } from '@/types/database'

export function AdminUsersPage() {
  const queryClient = useQueryClient()

  const { data: staff, isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: listStaffProfiles,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Parameters<typeof updateStaffProfile>[1]
    }) => updateStaffProfile(id, payload),
    onSuccess: () => {
      toast.success('Usuário atualizado')
      void queryClient.invalidateQueries({ queryKey: ['admin-staff'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <>
      <AdminPageHeader
        title="Usuários"
        description="Operadores, gerentes e administradores do sistema"
      />

      <Card padding="md" className="mb-6 bg-nh-gray-50">
        <p className="text-sm text-nh-gray-600">
          Para adicionar novos usuários, crie a conta em Supabase Auth e vincule em{' '}
          <code className="text-xs">staff_profiles</code>. Veja{' '}
          <code className="text-xs">supabase/setup-admin.sql</code>.
        </p>
      </Card>

      <Card padding="lg">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
          </div>
        ) : !staff?.length ? (
          <p className="py-12 text-center text-nh-gray-500">Nenhum usuário staff.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-3 text-left font-medium">Nome</th>
                  <th className="pb-3 text-left font-medium">Papel</th>
                  <th className="pb-3 text-left font-medium">Loja</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3 text-left font-medium">Desde</th>
                  <th className="pb-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((user) => {
                  const store = user.stores as unknown as { name: string; code: string } | null
                  return (
                    <tr key={user.id} className="border-b border-nh-gray-100">
                      <td className="py-3 font-medium">{user.full_name}</td>
                      <td className="py-3">
                        <select
                          className="rounded-lg border border-nh-gray-200 px-2 py-1 capitalize"
                          value={user.role}
                          onChange={(e) =>
                            updateMutation.mutate({
                              id: user.id,
                              payload: { role: e.target.value as UserRole },
                            })
                          }
                        >
                          <option value="operator">operator</option>
                          <option value="manager">manager</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="py-3 text-nh-gray-600">
                        {store ? `${store.name} (${store.code})` : '—'}
                      </td>
                      <td className="py-3">
                        <Badge variant={user.is_active ? 'success' : 'error'}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 text-nh-gray-600">
                        {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateMutation.mutate({
                              id: user.id,
                              payload: { is_active: !user.is_active },
                            })
                          }
                        >
                          {user.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
