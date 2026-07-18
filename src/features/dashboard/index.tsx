import { useState } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'

import { DashboardSkeleton } from './components/dashboard-skeleton'
import { EvolucaoChart } from './components/evolucao-chart'
import { KpiGrid } from './components/kpi-grid'
import { LeadsPorEtapaChart } from './components/leads-por-etapa-chart'
import { PeriodSelect } from './components/period-select'
import { useDashboard } from './hooks/use-dashboard'
import { PERIOD_OPTIONS } from './types'
import type { DashboardPeriod } from './types'

function periodLabelFor(period: DashboardPeriod): string {
  const option = PERIOD_OPTIONS.find((o) => o.value === period)
  if (!option) return ''
  return option.days === null ? 'Todo o período' : `Últimos ${option.label}`
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d')
  const { data, isLoading, isError } = useDashboard(period)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Métricas de leads, etapas do funil e tarefas."
        actions={<PeriodSelect value={period} onChange={setPeriod} />}
      />

      {isLoading || !data ? (
        isError ? (
          <EmptyState
            title="Não foi possível carregar o painel"
            description="Ocorreu um erro ao buscar os dados. Tente novamente."
          />
        ) : (
          <DashboardSkeleton />
        )
      ) : (
        <div className="space-y-6">
          <KpiGrid totals={data.totals} periodLabel={periodLabelFor(period)} />
          <div className="grid gap-4 lg:grid-cols-2">
            <LeadsPorEtapaChart data={data.leadsPorEtapa} />
            <EvolucaoChart data={data.evolucao} />
          </div>
        </div>
      )}
    </>
  )
}
