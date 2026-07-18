/**
 * Camada de dados da Dashboard (SPEC §4) — implementação Supabase (Fase 3).
 * Lê contacts/leads/tasks/pipeline_stages via `select('*')`; a RLS já escopa
 * por papel no servidor (corretor só vê o próprio; admin/gestor vê a org), então
 * NÃO refazemos o escopo por owner/assignedTo aqui. Depois de mapear as linhas
 * (snake_case → camelCase) rodamos EXATAMENTE a mesma agregação do repo.mock.ts.
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

import { supabase } from '@/lib/supabase/client'
import {
  mapContact,
  mapLead,
  mapStage,
  mapTask,
} from '@/lib/supabase/mappers'
import type {
  ContactRow,
  LeadRow,
  PipelineStageRow,
  TaskRow,
} from '@/lib/supabase/mappers'
import { getCurrentUser } from '@/lib/auth'

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

  // A RLS já escopa por papel/organização no servidor — buscamos "tudo o que
  // o usuário pode ver" e agregamos, sem filtrar por owner/assignedTo no cliente.
  const [contactsRes, leadsRes, tasksRes, stagesRes] = await Promise.all([
    supabase.from('contacts').select('*'),
    supabase.from('leads').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('pipeline_stages').select('*'),
  ])

  if (contactsRes.error) throw contactsRes.error
  if (leadsRes.error) throw leadsRes.error
  if (tasksRes.error) throw tasksRes.error
  if (stagesRes.error) throw stagesRes.error

  const contacts = ((contactsRes.data ?? []) as ContactRow[]).map(mapContact)
  const leads = ((leadsRes.data ?? []) as LeadRow[]).map(mapLead)
  const tasks = ((tasksRes.data ?? []) as TaskRow[]).map(mapTask)
  const pipelineStages = ((stagesRes.data ?? []) as PipelineStageRow[]).map(mapStage)

  const now = new Date()
  const today = startOfDay(now)
  const days = resolveDays(period)
  const periodStart = days === null ? null : startOfDay(subDays(now, days - 1))

  const closedInPeriod = (iso: string | null): boolean => {
    if (!iso) return false
    if (periodStart === null) return true
    return inRange(iso, periodStart, now)
  }

  const openLeads = leads.filter((l) => l.status === 'aberto')

  const totals: DashboardTotals = {
    contatos: contacts.length,
    abertos: openLeads.length,
    ganhos: leads.filter((l) => l.status === 'ganho' && closedInPeriod(l.fechadoEm)).length,
    perdidos: leads.filter((l) => l.status === 'perdido' && closedInPeriod(l.fechadoEm)).length,
    tarefasPendentes: tasks.filter((t) => t.status === 'pendente').length,
    tarefasAtrasadas: tasks.filter(
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
  } else if (leads.length > 0) {
    rangeStart = startOfDay(min(leads.map((l) => parseISO(l.criadoEm))))
  } else {
    rangeStart = today
  }

  const buckets = useDaily
    ? eachDayOfInterval({ start: rangeStart, end: now })
    : eachWeekOfInterval({ start: rangeStart, end: now }, { weekStartsOn: WEEK_STARTS_ON })

  const evolucao: EvolucaoPonto[] = buckets.map((bucketStart) => {
    const start = useDaily ? startOfDay(bucketStart) : startOfWeek(bucketStart, { weekStartsOn: WEEK_STARTS_ON })
    const end = useDaily ? endOfDay(bucketStart) : endOfWeek(bucketStart, { weekStartsOn: WEEK_STARTS_ON })

    const criados = leads.filter((l) => inRange(l.criadoEm, start, end)).length
    const ganhos = leads.filter(
      (l) => l.status === 'ganho' && l.fechadoEm !== null && inRange(l.fechadoEm, start, end),
    ).length

    return {
      periodo: format(start, 'dd/MM', { locale: ptBR }),
      criados,
      ganhos,
    }
  })

  return { totals, leadsPorEtapa, evolucao }
}
