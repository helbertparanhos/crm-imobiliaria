/** Tipos locais da tela de Dashboard (PRD §4.1). */

/** Janela de tempo do filtro de período. `all` = sem limite inferior. */
export type DashboardPeriod = '7d' | '30d' | '90d' | 'all'

export interface PeriodOption {
  value: DashboardPeriod
  label: string
  /** Quantidade de dias da janela; `null` para "Tudo". */
  days: number | null
}

/** Opções do <Select/> de período (fonte única, usada no repo e na UI). */
export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: '7d', label: '7 dias', days: 7 },
  { value: '30d', label: '30 dias', days: 30 },
  { value: '90d', label: '90 dias', days: 90 },
  { value: 'all', label: 'Tudo', days: null },
]

/** KPIs agregados. `contatos`/`abertos`/`tarefas*` são estado atual; `ganhos`/`perdidos` são no período. */
export interface DashboardTotals {
  contatos: number
  abertos: number
  ganhos: number
  perdidos: number
  tarefasPendentes: number
  tarefasAtrasadas: number
}

/** Distribuição atual de leads abertos por etapa do funil. */
export interface LeadsPorEtapaPonto {
  etapa: string
  cor: string
  quantidade: number
}

/** Evolução no período: leads criados vs. ganhos por bucket (dia/semana). */
export interface EvolucaoPonto {
  periodo: string
  criados: number
  ganhos: number
}

export interface DashboardData {
  totals: DashboardTotals
  leadsPorEtapa: LeadsPorEtapaPonto[]
  evolucao: EvolucaoPonto[]
}
