import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Monitor,
  Receipt,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { BRAND, ROUTES } from '@/lib/constants'
import { useSupabaseHealth } from '@/hooks/useSupabaseHealth'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function HomePage() {
  const { data: health, isLoading } = useSupabaseHealth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-nh-green-50 via-white to-white">
      <header className="border-b border-nh-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="md" />
          <Badge variant="success">Projeto completo</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <motion.section
          className="text-center"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <Logo size="lg" className="mx-auto mb-8 justify-center" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-balance text-3xl font-bold tracking-tight text-nh-gray-900 sm:text-5xl"
          >
            Programa de fidelidade
            <span className="block text-nh-green-600">profissional e escalável</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-nh-gray-600"
          >
            {BRAND.tagline}. Sistema completo para totem, cupons, pontos, prêmios e
            dashboard administrativo da {BRAND.company}.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row"
          >
            <Link to={ROUTES.totem}>
              <Button size="lg" className="min-w-[220px]">
                <Monitor className="h-5 w-5" aria-hidden="true" />
                Acessar Totem
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link to={ROUTES.pdv}>
              <Button variant="secondary" size="lg" className="min-w-[220px]">
                <Receipt className="h-5 w-5" aria-hidden="true" />
                PDV — Cupons
              </Button>
            </Link>
            <Link to={ROUTES.admin}>
              <Button variant="outline" size="lg" className="min-w-[220px]">
                <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                Painel Admin
              </Button>
            </Link>
          </motion.div>
        </motion.section>

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader
              title="Status do Supabase"
              description="Verificação de conexão com o banco de dados"
            />
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center gap-2 text-nh-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Verificando conexão...
                </div>
              ) : health?.connected ? (
                <div className="flex items-start gap-3 rounded-xl bg-nh-green-50 p-4">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-nh-green-600"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-nh-green-800">Conectado</p>
                    <p className="text-sm text-nh-green-700">
                      Schema aplicado com {health.levelsCount} níveis cadastrados.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl bg-nh-red-50 p-4 ring-1 ring-nh-red-200">
                  <XCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-nh-red-600"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-nh-red-800">
                      {health?.configured ? 'Falha na conexão' : 'Não configurado'}
                    </p>
                    <p className="text-sm text-nh-red-700">
                      {health?.error ??
                        'Copie .env.example para .env e aplique as migrations do Supabase.'}
                    </p>
                  </div>
                </div>
              )}

              <ul className="space-y-2 text-sm text-nh-gray-600">
                <li className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${health?.configured ? 'bg-nh-green-500' : 'bg-nh-gray-300'}`}
                  />
                  Variáveis de ambiente
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${health?.connected ? 'bg-nh-green-500' : 'bg-nh-gray-300'}`}
                  />
                  Schema PostgreSQL + RLS
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Módulos do projeto"
              description="Desenvolvimento incremental e funcional"
            />
            <ol className="space-y-3 text-sm">
              {[
                { name: 'Fundação + Supabase', status: 'done' as const },
                { name: 'Totem — Fluxo do cliente', status: 'done' as const },
                { name: 'Cupons + Impressão térmica', status: 'done' as const },
                { name: 'Dashboard Admin', status: 'done' as const },
                { name: 'Clientes, Prêmios, Campanhas', status: 'done' as const },
                { name: 'Relatórios + Logs', status: 'done' as const },
              ].map((module) => (
                <li
                  key={module.name}
                  className="flex items-center justify-between rounded-lg bg-nh-gray-50 px-3 py-2"
                >
                  <span className="text-nh-gray-700">{module.name}</span>
                  <Badge
                    variant={
                      module.status === 'done'
                        ? 'success'
                        : module.status === 'next'
                          ? 'info'
                          : 'neutral'
                    }
                  >
                    {module.status === 'done'
                      ? 'Concluído'
                      : module.status === 'next'
                        ? 'Próximo'
                        : 'Pendente'}
                  </Badge>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      </main>

      <footer className="border-t border-nh-gray-200 bg-white py-6 text-center text-sm text-nh-gray-500">
        © {new Date().getFullYear()} {BRAND.company} — {BRAND.name}
      </footer>
    </div>
  )
}
