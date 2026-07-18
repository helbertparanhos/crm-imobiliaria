/**
 * Camada de dados da Dashboard (SPEC §4). Lê os arrays mock, aplica o escopo
 * por papel (contacts por ownerId; leads/tasks por assignedTo) e agrega os
 * números da tela. Na Fase 3 isto vira consultas ao Postgres atrás da RLS.
 */
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfDay,
  endOfWeek,
  format,
  min,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { contacts, leads, pipelineStages, tasks } from '@/mocks/db'
import { mockDelay } from '@/mocks/latency'
import { getCurrentUser } from '@/lib/dev-session'
import { scopeByRole } from '@/lib/permissions'

import { PERIOD_OPTIONS } from './types'
import type {
  DashboardData,
  DashboardPeriod,
  DashboardTotals,
  EvolucaoPonto,
  LeadsPorEtapaPonto,
} from './types'

/** Início da semana (segunda-feira) para os buckets semanais. */
const WEEK_STARTS_ON = 1 as const

/** Se a janela for curta (<= 14 dias), agrega por dia; senão por semana. */
const DAILY_THRESHOLD = 14

function resolveDays(period: DashboardPeriod): number | null {
  return PERIOD_OPTIONS.find((o) => o.value === period)?.days ?? null
}

function inRange(iso: string, start: Date, end: Date): boolean {
  const d = parseISO(iso)
  return d >= start && d <= end
}

export async function getDashboard(period: DashboardPeriod): Promise<DashboardData> {
  const user = getCurrentUser()
  const scopedContacts = scopeByRole(user, contacts, 'ownerId')
  const scopedLeads = scopeByRole(user, leads, 'assignedTo')
  const scopedTasks = scopeByRole(user, tasks, 'assignedTo')

  const now = new Date()
  const today = startOfDay(now)
  const days = resolveDays(period)
  const periodStart = days === null ? null : startOfDay(subDays(now, days - 1))

  const closedInPeriod = (iso: string | null): boolean => {
    if (!iso) return false
    if (periodStart === null) return true
    return inRange(iso, periodStart, now)
  }

  const openLeads = scopedLeads.filter((l) => l.status === 'aberto')

  const totals: DashboardTotals = {
    contatos: scopedContacts.length,
    abertos: openLeads.length,
    ganhos: scopedLeads.filter((l) => l.status === 'ganho' && closedInPeriod(l.fechadoEm)).length,
    perdidos: scopedLeads.filter((l) => l.status === 'perdido' && closedInPeriod(l.fechadoEm)).length,
    tarefasPendentes: scopedTasks.filter((t) => t.status === 'pendente').length,
    tarefasAtrasadas: scopedTasks.filter(
      (t) => t.status === 'pendente' && t.dueDate !== null && parseISO(t.dueDate) < today,
    ).length,
  }

  // --- Leads abertos por etapa (etapas do funil, exceto ganho/perdido) -----
  const funnelStages = pipelineStages
    .filter((s) => s.organizationId === user.organizationId && !s.isGanho && !s.isPerdido)
    .sort((a, b) => a.ordem - b.ordem)

  const leadsPorEtapa: LeadsPorEtapaPonto[] = funnelStages.map((s) => ({
    etapa: s.nome,
    cor: s.cor,
    quantidade: openLeads.filter((l) => l.stageId === s.id).length,
  }))

  // --- Evolução no período: criados vs. ganhos por bucket ------------------
  const useDaily = days !== null && days <= DAILY_THRESHOLD

  let rangeStart: Date
  if (periodStart) {
    rangeStart = periodStart
  } else if (scopedLeads.length > 0) {
    rangeStart = startOfDay(min(scopedLeads.map((l) => parseISO(l.criadoEm))))
  } else {
    rangeStart = today
  }

  const buckets = useDaily
    ? eachDayOfInterval({ start: rangeStart, end: now })
    : eachWeekOfInterval({ start: rangeStart, end: now }, { weekStartsOn: WEEK_STARTS_ON })

  const evolucao: EvolucaoPonto[] = buckets.map((bucketStart) => {
    const start = useDaily ? startOfDay(bucketStart) : startOfWeek(bucketStart, { weekStartsOn: WEEK_STARTS_ON })
    const end = useDaily ? endOfDay(bucketStart) : endOfWeek(bucketStart, { weekStartsOn: WEEK_STARTS_ON })

    const criados = scopedLeads.filter((l) => inRange(l.criadoEm, start, end)).length
    const ganhos = scopedLeads.filter(
      (l) => l.status === 'ganho' && l.fechadoEm !== null && inRange(l.fechadoEm, start, end),
    ).length

    return {
      periodo: format(start, 'dd/MM', { locale: ptBR }),
      criados,
      ganhos,
    }
  })

  return mockDelay<DashboardData>({ totals, leadsPorEtapa, evolucao })
}
