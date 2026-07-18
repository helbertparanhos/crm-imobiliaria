/**
 * Camada de dados (Supabase) da feature Tarefas — SPEC §4.
 * MESMA interface do repo.mock: os componentes/hooks não sabem qual fonte está ativa.
 * LEITURAS: a RLS já escopa por papel (assigned_to) — NÃO filtramos manualmente por
 * responsável; apenas mapeamos e aplicamos EM JS os mesmos filtros/derivações do mock.
 * ESCRITAS: sempre checam `error` e propagam via `throw`.
 */
import { isFuture, isPast, isToday, parseISO } from 'date-fns'

import { getCurrentUser } from '@/lib/auth'
import { PRIORITY_ORDER } from '@/lib/constants'
import { canSeeAllOrg } from '@/lib/permissions'
import { supabase } from '@/lib/supabase/client'
import {
  mapContact,
  mapLead,
  mapProfile,
  mapTask,
  type ContactRow,
  type LeadRow,
  type ProfileRow,
  type TaskRow,
} from '@/lib/supabase/mappers'
import type { Task } from '@/types'

import type { SelectOption, TaskFilter, TaskInput, TaskWithRelations } from './types'

/** Classifica o prazo em relação a hoje (hoje tem precedência sobre atrasada/próxima). */
function classifyDueDate(
  dueDate: string | null,
): 'atrasada' | 'hoje' | 'proxima' | null {
  if (!dueDate) return null
  const date = parseISO(dueDate)
  if (isToday(date)) return 'hoje'
  if (isPast(date)) return 'atrasada'
  if (isFuture(date)) return 'proxima'
  return null
}

/** Converte o valor de input date (yyyy-MM-dd) para ISO ao meio-dia local, ou null. */
function toIsoDueDate(dateStr: string): string | null {
  if (!dateStr) return null
  return new Date(`${dateStr}T12:00:00`).toISOString()
}

/** Ordena por prazo ascendente (sem prazo por último) e depois por prioridade. */
function byDueDateThenPriority(a: Task, b: Task): number {
  const ad = a.dueDate ? parseISO(a.dueDate).getTime() : Number.POSITIVE_INFINITY
  const bd = b.dueDate ? parseISO(b.dueDate).getTime() : Number.POSITIVE_INFINITY
  if (ad !== bd) return ad - bd
  return PRIORITY_ORDER[a.prioridade] - PRIORITY_ORDER[b.prioridade]
}

/** Lista tarefas (RLS escopa por papel) e filtra pela visão selecionada. */
export async function listTasks(filter: TaskFilter): Promise<TaskWithRelations[]> {
  const user = getCurrentUser()

  const [tasksRes, contactsRes, profilesRes, leadsRes] = await Promise.all([
    supabase.from('tasks').select('*'),
    supabase.from('contacts').select('*'),
    supabase.from('profiles').select('*'),
    supabase.from('leads').select('*'),
  ])
  if (tasksRes.error) throw tasksRes.error
  if (contactsRes.error) throw contactsRes.error
  if (profilesRes.error) throw profilesRes.error
  if (leadsRes.error) throw leadsRes.error

  const tasks = ((tasksRes.data ?? []) as TaskRow[]).map(mapTask)
  const contactNomeById = new Map(
    ((contactsRes.data ?? []) as ContactRow[])
      .map(mapContact)
      .map((c) => [c.id, c.nome] as const),
  )
  const assigneeNomeById = new Map(
    ((profilesRes.data ?? []) as ProfileRow[])
      .map(mapProfile)
      .map((p) => [p.id, p.nome] as const),
  )
  const leadTituloById = new Map(
    ((leadsRes.data ?? []) as LeadRow[])
      .map(mapLead)
      .map((l) => [l.id, l.titulo] as const),
  )

  /** Monta a tarefa com os nomes das entidades relacionadas (join em JS). */
  const withRelations = (task: Task): TaskWithRelations => ({
    ...task,
    contactNome: contactNomeById.get(task.contactId) ?? 'Contato removido',
    assigneeNome: assigneeNomeById.get(task.assignedTo) ?? 'Sem responsável',
    leadTitulo: task.leadId ? leadTituloById.get(task.leadId) ?? null : null,
  })

  const matches = (task: Task): boolean => {
    switch (filter) {
      case 'minhas':
        return task.assignedTo === user.id
      case 'atrasadas':
        return task.status === 'pendente' && classifyDueDate(task.dueDate) === 'atrasada'
      case 'hoje':
        return task.status === 'pendente' && classifyDueDate(task.dueDate) === 'hoje'
      case 'proximas':
        return task.status === 'pendente' && classifyDueDate(task.dueDate) === 'proxima'
      case 'concluidas':
        return task.status === 'concluida'
      case 'todas':
      default:
        return true
    }
  }

  return tasks.filter(matches).sort(byDueDateThenPriority).map(withRelations)
}

/** Contatos escopados pela RLS, como opções de select (para vincular a tarefa). */
export async function listContactsForSelect(): Promise<SelectOption[]> {
  const { data, error } = await supabase.from('contacts').select('*')
  if (error) throw error
  return ((data ?? []) as ContactRow[])
    .map(mapContact)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .map((c) => ({ value: c.id, label: c.nome }))
}

/** Leads (escopados pela RLS) de um contato específico, como opções de select. */
export async function listLeadsByContact(contactId: string): Promise<SelectOption[]> {
  if (!contactId) return []
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('contact_id', contactId)
  if (error) throw error
  return ((data ?? []) as LeadRow[])
    .map(mapLead)
    .map((l) => ({ value: l.id, label: l.titulo }))
}

/** Usuários ativos da organização, como opções de responsável (admin/gestor escolhem). */
export async function listOrgUsers(): Promise<SelectOption[]> {
  const user = getCurrentUser()
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) throw error
  return ((data ?? []) as ProfileRow[])
    .map(mapProfile)
    .filter((p) => p.organizationId === user.organizationId && p.ativo)
    .map((p) => ({ value: p.id, label: p.nome }))
}

/** Cria uma nova tarefa. Corretor tem o responsável forçado a si mesmo. */
export async function createTask(input: TaskInput): Promise<Task> {
  const user = getCurrentUser()
  const assignedTo = canSeeAllOrg(user) ? input.assignedTo : user.id
  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      organization_id: user.organizationId,
      contact_id: input.contactId,
      lead_id: input.leadId || null,
      titulo: input.titulo.trim(),
      descricao: input.descricao.trim(),
      prioridade: input.prioridade,
      status: 'pendente',
      due_date: toIsoDueDate(input.dueDate),
      assigned_to: assignedTo,
      criado_por: user.id,
      criado_em: nowIso,
      concluida_em: null,
    })
    .select()
    .single()
  if (error) throw error
  return mapTask(data as TaskRow)
}

/** Atualiza os campos editáveis de uma tarefa. Corretor não reatribui responsável. */
export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const user = getCurrentUser()

  const patch: Partial<TaskRow> = {
    titulo: input.titulo.trim(),
    descricao: input.descricao.trim(),
    contact_id: input.contactId,
    lead_id: input.leadId || null,
    prioridade: input.prioridade,
    due_date: toIsoDueDate(input.dueDate),
  }
  if (canSeeAllOrg(user)) patch.assigned_to = input.assignedTo

  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapTask(data as TaskRow)
}

/** Alterna o status entre pendente/concluída, ajustando `concluida_em`. */
export async function toggleTask(id: string): Promise<Task> {
  const current = await supabase.from('tasks').select('status').eq('id', id).single()
  if (current.error) throw current.error
  const isPendente = (current.data as Pick<TaskRow, 'status'>).status === 'pendente'

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: isPendente ? 'concluida' : 'pendente',
      concluida_em: isPendente ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapTask(data as TaskRow)
}

/** Remove uma tarefa. */
export async function deleteTask(id: string): Promise<{ id: string }> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
  return { id }
}
