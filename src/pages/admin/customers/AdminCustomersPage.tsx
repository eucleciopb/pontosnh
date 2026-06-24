import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Loader2, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { Modal } from '@/features/admin/components/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { listCustomers, createCustomer } from '@/services/customer.service'
import { formatPhoneDisplay, formatPoints } from '@/lib/utils'

export function AdminCustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
    city: '',
  })

  const handleSearch = () => setDebouncedSearch(search)

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers', debouncedSearch],
    queryFn: () => listCustomers(debouncedSearch || undefined),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createCustomer({
        phone: form.phone,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || undefined,
        city: form.city || undefined,
      }),
    onSuccess: () => {
      toast.success('Cliente cadastrado')
      setModalOpen(false)
      setForm({ phone: '', firstName: '', lastName: '', email: '', city: '' })
      void queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <>
      <AdminPageHeader
        title="Clientes"
        description="Cadastro, saldo, nível e histórico"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <Card padding="lg" className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>
      </Card>

      <Card padding="lg">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
          </div>
        ) : !customers?.length ? (
          <p className="py-12 text-center text-nh-gray-500">Nenhum cliente encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-nh-gray-200 text-nh-gray-500">
                  <th className="pb-3 pr-4 font-medium">Cliente</th>
                  <th className="pb-3 pr-4 font-medium">Telefone</th>
                  <th className="pb-3 pr-4 font-medium">Saldo</th>
                  <th className="pb-3 pr-4 font-medium">Nível</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Cadastro</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-nh-gray-100 last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="py-3 pr-4">{formatPhoneDisplay(c.phone)}</td>
                    <td className="py-3 pr-4 font-semibold text-nh-green-700">
                      {formatPoints(c.balance_points)}
                    </td>
                    <td className="py-3 pr-4">
                      {c.levels ? (
                        <Badge variant="neutral">{c.levels.name}</Badge>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={c.is_active ? 'success' : 'error'}>
                        {c.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-nh-gray-600">
                      {format(new Date(c.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="py-3">
                      <Link to={`/admin/clientes/${c.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo cliente">
        <div className="space-y-4">
          <Input
            label="Telefone *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Sobrenome *"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Cidade"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Button
            fullWidth
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? 'Salvando...' : 'Cadastrar'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
