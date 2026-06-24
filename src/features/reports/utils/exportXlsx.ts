import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import type { FullReportData } from '@/services/reports.service'
import { formatCurrency, formatPhoneDisplay, formatPoints } from '@/lib/utils'

export function exportFullReportXlsx(data: FullReportData) {
  const wb = XLSX.utils.book_new()
  const dateLabel = format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: ptBR })

  const summarySheet = XLSX.utils.json_to_sheet([
    { Indicador: 'Clientes totais', Valor: data.summary.totalCustomers },
    { Indicador: 'Clientes ativos', Valor: data.summary.activeCustomers },
    { Indicador: 'Cupons gerados', Valor: data.summary.totalCoupons },
    { Indicador: 'Cupons utilizados', Valor: data.summary.usedCoupons },
    { Indicador: 'Cupons expirados', Valor: data.summary.expiredCoupons },
    { Indicador: 'Cupons pendentes', Valor: data.summary.pendingCoupons },
    { Indicador: 'Cupons cancelados', Valor: data.summary.cancelledCoupons },
    { Indicador: 'Pontos emitidos', Valor: data.summary.totalPointsIssued },
    { Indicador: 'Pontos resgatados', Valor: data.summary.totalPointsRedeemed },
    { Indicador: 'Total resgates', Valor: data.summary.totalRedemptions },
    { Indicador: 'Ticket médio (R$)', Valor: data.summary.avgTicket },
    { Indicador: 'Taxa conversão (%)', Valor: data.summary.conversionRate },
    { Indicador: 'Taxa resgate (%)', Valor: data.summary.redemptionRate },
    { Indicador: 'ROI estimado (%)', Valor: data.summary.roiEstimate },
    {
      Indicador: 'Gerado em',
      Valor: format(new Date(data.generatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    },
  ])
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo')

  const activeCustomersSheet = XLSX.utils.json_to_sheet(
    data.topCustomers.map((c) => ({
      Rank: c.rank,
      Cliente: c.name,
      Telefone: formatPhoneDisplay(c.phone),
      Resgates: c.redemptions,
      'Pontos lifetime': c.lifetimePoints,
      Saldo: c.balance,
      Nível: c.level,
      Status: c.isActive ? 'Ativo' : 'Inativo',
    })),
  )
  XLSX.utils.book_append_sheet(wb, activeCustomersSheet, 'Clientes ativos')

  const pointsSheet = XLSX.utils.json_to_sheet(
    data.topByPoints.map((c) => ({
      Rank: c.rank,
      Cliente: c.name,
      Telefone: formatPhoneDisplay(c.phone),
      'Pontos lifetime': c.lifetimePoints,
      Saldo: c.balance,
      Nível: c.level,
      Resgates: c.redemptions,
    })),
  )
  XLSX.utils.book_append_sheet(wb, pointsSheet, 'Mais pontos')

  const rewardsSheet = XLSX.utils.json_to_sheet(
    data.topRewards.map((r) => ({
      Rank: r.rank,
      Prêmio: r.name,
      Categoria: r.category,
      'Pontos necessários': r.pointsRequired,
      Resgates: r.redemptionCount,
      'Pontos gastos': r.pointsSpent,
    })),
  )
  XLSX.utils.book_append_sheet(wb, rewardsSheet, 'Prêmios')

  const couponsSheet = XLSX.utils.json_to_sheet(
    data.couponBreakdown.map((c) => ({
      Métrica: c.metric,
      Quantidade: c.value,
      'Percentual (%)': c.percentage != null ? Math.round(c.percentage * 10) / 10 : undefined,
    })),
  )
  XLSX.utils.book_append_sheet(wb, couponsSheet, 'Cupons')

  XLSX.writeFile(wb, `NH-Clube_Relatorio_${dateLabel}.xlsx`)
}

export function exportTableXlsx<T extends Record<string, unknown>>(
  rows: T[],
  sheetName: string,
  filename: string,
) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31))
  XLSX.writeFile(wb, filename)
}

/** Helpers for display in UI */
export { formatPoints, formatCurrency, formatPhoneDisplay }
