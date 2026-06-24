import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { BRAND_CHART } from '@/lib/constants'
import type { DashboardChartData } from '@/services/admin.service'
import { formatPoints } from '@/lib/utils'

interface DashboardChartsProps {
  data: DashboardChartData
}

const tooltipStyle = {
  borderRadius: '12px',
  border: `1px solid ${BRAND_CHART.greenLight}`,
  fontSize: '13px',
  backgroundColor: BRAND_CHART.white,
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="lg">
        <CardHeader
          title="Cupons — últimos 7 dias"
          description="Gerados vs utilizados"
        />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.couponsDaily} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={BRAND_CHART.greenLight} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke={BRAND_CHART.green} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke={BRAND_CHART.green} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="generated" name="Gerados" fill={BRAND_CHART.green} radius={[4, 4, 0, 0]} />
              <Bar dataKey="used" name="Utilizados" fill={BRAND_CHART.red} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader
          title="Pontos — últimos 7 dias"
          description="Creditados vs resgatados"
        />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.pointsDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke={BRAND_CHART.greenLight} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke={BRAND_CHART.green} />
              <YAxis tick={{ fontSize: 12 }} stroke={BRAND_CHART.green} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => formatPoints(Number(value ?? 0))}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="earned"
                name="Creditados"
                stroke={BRAND_CHART.green}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="redeemed"
                name="Resgatados"
                stroke={BRAND_CHART.red}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader title="Clientes por nível" description="Distribuição de fidelidade" />
        <div className="h-72">
          {data.levelDistribution.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.levelDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.levelDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-nh-green-600">
              Nenhum cliente cadastrado ainda
            </div>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader title="Status dos cupons" description="Visão geral do estoque" />
        <div className="h-72">
          {data.couponStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.couponStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.couponStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-nh-green-600">
              Nenhum cupom emitido ainda
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
