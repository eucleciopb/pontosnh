import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Shield } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader } from '@/components/ui/Card'
import { ADMIN_ROUTES } from '@/features/admin/constants'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function AdminLoginPage() {
  const { isLoading, isStaff, session, signIn, signOut } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const mutation = useMutation({
    mutationFn: ({ email, password }: LoginForm) => signIn(email, password),
    onSuccess: () => toast.success('Bem-vindo ao painel admin'),
    onError: (error: Error) => toast.error(error.message),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nh-green-600" />
      </div>
    )
  }

  if (isStaff) {
    return <Navigate to={ADMIN_ROUTES.dashboard} replace />
  }

  if (session && !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nh-gray-100 p-4">
        <Card className="w-full max-w-md text-center" padding="lg">
          <CardHeader
            title="Acesso negado"
            description="Usuário sem perfil de staff vinculado."
          />
          <p className="mb-4 text-sm text-nh-gray-600">
            Configure <code className="text-xs">staff_profiles</code> no Supabase.
            Veja <code className="text-xs">supabase/setup-admin.sql</code>.
          </p>
          <Button variant="outline" fullWidth onClick={() => void signOut()}>
            Sair
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nh-gray-100 via-white to-nh-green-50 p-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>
        <CardHeader
          title="Painel Admin"
          description="Acesso restrito a administradores e operadores"
        />

        {!isSupabaseConfigured && (
          <p className="mb-4 rounded-lg bg-nh-red-50 p-3 text-sm text-nh-red-800 ring-1 ring-nh-red-200">
            Configure o arquivo .env com as credenciais do Supabase.
          </p>
        )}

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" size="lg" fullWidth disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
            Entrar no painel
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-nh-gray-500">
          Mesmas credenciais do PDV, com perfil em staff_profiles
        </p>
      </Card>
    </div>
  )
}
