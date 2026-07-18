import {
  AlertTriangle,
  ClipboardList,
  Target,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react'

import { KpiCard } from '@/components/shared/kpi-card'
import { formatNumber } from '@/lib/format'

import type { DashboardTotals } from '../types'

interface KpiGridProps {
  totals: DashboardTotals
  /** Rótulo do período selecionado, usado nas dicas dos KPIs "no período". */
  periodLabel: string
}

/** Grade dos 6 KPIs principais da Dashboard (PRD §4.1). */
export function KpiGrid({ totals, periodLabel }: KpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        title="Total de contatos"
        value={formatNumber(totals.contatos)}
        icon={Users}
      />
      <KpiCard
        title="Leads abertos"
        value={formatNumber(totals.abertos)}
        icon={Target}
      />
      <KpiCard
        title="Ganhos no período"
        value={formatNumber(totals.ganhos)}
        icon={Trophy}
        tone="success"
        hint={periodLabel}
      />
      <KpiCard
        title="Perdidos no período"
        value={formatNumber(totals.perdidos)}
        icon={XCircle}
        hint={periodLabel}
      />
      <KpiCard
        title="Tarefas pendentes"
        value={formatNumber(totals.tarefasPendentes)}
        icon={ClipboardList}
      />
      <KpiCard
        title="Tarefas atrasadas"
        value={formatNumber(totals.tarefasAtrasadas)}
        icon={AlertTriangle}
        tone={totals.tarefasAtrasadas > 0 ? 'danger' : 'default'}
        hint={totals.tarefasAtrasadas > 0 ? 'Requer atenção' : 'Tudo em dia'}
      />
    </div>
  )
}
