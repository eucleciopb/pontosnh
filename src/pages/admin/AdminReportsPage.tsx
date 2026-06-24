import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Percent,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import {
  StatCard,
  formatStatCurrency,
  formatStatPoints,
} from '@/features/admin/components/StatCard'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { getFullReport } from '@/services/reports.service'
import {
  exportFullReportXlsx,
  formatPhoneDisplay,
  formatPoints,
} from '@/features/reports/utils/exportXlsx'

const PERIOD_OPTIONS = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
] as const

export function AdminReportsPage() {
  const [days, setDays] = useState(30)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-full-report', days],
    queryFn: () => getFullReport(days),
  })

  const handleExport = () => {
    if (!data) return
    try {
      exportFullReportXlsx(data)
      toast.success('Relatório exportado com sucesso')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao exportar')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-nh-green-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-nh-red-50 p-6 text-center text-nh-red-700">
        Não foi possível carregar os relatórios.
      </div>
    )
  }

  const { summary } = data

  return (
    <>
      <AdminPageHeader
        title="Relatórios"
        description="Análises, conversão, ROI e exportação XLSX"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Atualizar
            </Button>
            <Button size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar XLSX
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setDays(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              days === opt.value
                ? 'bg-nh-green-600 text-white'
                : 'bg-white text-nh-gray-600 ring-1 ring-nh-gray-200 hover:bg-nh-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="self-center text-xs text-nh-gray-500">
          Atualizado: {format(new Date(data.generatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </span>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Taxa de conversão"
          value={`${summary.conversionRate}%`}
          subtitle="Cupons utilizados / gerados"
          icon={Percent}
          accent="green"
        />
        <StatCard
          title="Taxa de resgate"
          value={`${summary.redemptionRate}%`}
          subtitle="Pontos resgatados / emitidos"
          icon={TrendingUp}
          accent="red"
        />
        <StatCard
          title="Ticket médio"
          value={formatStatCurrency(summary.avgTicket)}
          subtitle="Compras com cupom usado"
          icon={Ticket}
          accent="white"
        />
        <StatCard
          title="ROI estimado"
          value={`${summary.roiEstimate}%`}
          subtitle="Engajamento do programa"
          icon={TrendingUp}
          accent={summary.roiEstimate >= 30 ? 'green' : 'red'}
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Clientes"
          value={formatStatPoints(summary.totalCustomers)}
          subtitle={`${formatStatPoints(summary.activeCustomers)} ativos`}
          icon={Users}
          accent="green"
        />
        <StatCard
          title="Pontos emitidos"
          value={formatStatPoints(summary.totalPointsIssued)}
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          title="Pontos resgatados"
          value={formatStatPoints(summary.totalPointsRedeemed)}
          icon={TrendingUp}
          accent="red"
        />
        <StatCard
          title="Resgates"
          value={formatStatPoints(summary.totalRedemptions)}
          icon={FileSpreadsheet}
          accent="white"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <CardHeader
            title="Clientes mais ativos"
            description="Por quantidade de resgates"
          />
          {data.topCustomers.length === 0 ? (
            <p className="text-sm text-nh-gray-500">Sem dados ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-2 text-left font-medium">#</th>
                  <th className="pb-2 text-left font-medium">Cliente</th>
                  <th className="pb-2 text-right font-medium">Resgates</th>
                  <th className="pb-2 text-right font-medium">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((c) => (
                  <tr key={c.id} className="border-b border-nh-gray-100">
                    <td className="py-2 text-nh-gray-400">{c.rank}</td>
                    <td className="py-2">
                      <span className="font-medium">{c.name}</span>
                      <span className="block text-xs text-nh-gray-500">
                        {formatPhoneDisplay(c.phone)}
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold">{c.redemptions}</td>
                    <td className="py-2 text-right text-nh-green-700">
                      {formatPoints(c.lifetimePoints)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card padding="lg">
          <CardHeader title="Mais pontos acumulados" description="Lifetime points" />
          {data.topByPoints.length === 0 ? (
            <p className="text-sm text-nh-gray-500">Sem dados ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-2 text-left font-medium">#</th>
                  <th className="pb-2 text-left font-medium">Cliente</th>
                  <th className="pb-2 text-right font-medium">Lifetime</th>
                  <th className="pb-2 text-right font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {data.topByPoints.map((c) => (
                  <tr key={c.id} className="border-b border-nh-gray-100">
                    <td className="py-2 text-nh-gray-400">{c.rank}</td>
                    <td className="py-2 font-medium">{c.name}</td>
                    <td className="py-2 text-right font-semibold text-nh-green-700">
                      {formatPoints(c.lifetimePoints)}
                    </td>
                    <td className="py-2 text-right">{formatPoints(c.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card padding="lg">
          <CardHeader title="Prêmios mais resgatados" description="Top 10" />
          {data.topRewards.length === 0 ? (
            <p className="text-sm text-nh-gray-500">Nenhum resgate registrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-nh-gray-500">
                  <th className="pb-2 text-left font-medium">#</th>
                  <th className="pb-2 text-left font-medium">Prêmio</th>
                  <th className="pb-2 text-right font-medium">Resgates</th>
                  <th className="pb-2 text-right font-medium">Pts gastos</th>
                </tr>
              </thead>
              <tbody>
                {data.topRewards.map((r) => (
                  <tr key={r.id} className="border-b border-nh-gray-100">
                    <td className="py-2 text-nh-gray-400">{r.rank}</td>
                    <td className="py-2">
                      <span className="font-medium">{r.name}</span>
                      <span className="block text-xs text-nh-gray-500">{r.category}</span>
                    </td>
                    <td className="py-2 text-right font-semibold">{r.redemptionCount}</td>
                    <td className="py-2 text-right text-nh-red-700">
                      {formatPoints(r.pointsSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card padding="lg">
          <CardHeader title="Cupons" description="Gerados, expirados e conversão" />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-nh-gray-500">
                <th className="pb-2 text-left font-medium">Métrica</th>
                <th className="pb-2 text-right font-medium">Qtd</th>
                <th className="pb-2 text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {data.couponBreakdown.map((row) => (
                <tr key={row.metric} className="border-b border-nh-gray-100">
                  <td className="py-2">{row.metric}</td>
                  <td className="py-2 text-right font-semibold">{row.value}</td>
                  <td className="py-2 text-right text-nh-gray-600">
                    {row.percentage != null ? `${Math.round(row.percentage * 10) / 10}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card padding="md" className="mt-6 bg-nh-green-50">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-medium text-nh-green-900">Exportar relatório completo</p>
            <p className="text-sm text-nh-green-800">
              Gera arquivo Excel com 5 abas: Resumo, Clientes, Pontos, Prêmios e Cupons.
            </p>
          </div>
          <Button onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4" />
            Baixar XLSX
          </Button>
        </div>
      </Card>
    </>
  )
}
