/**
 * Camada de dados (mock) da feature Tarefas — SPEC §4.
 * Lê/escreve os arrays de @/mocks/db aplicando o escopo por papel via
 * getCurrentUser() + scopeByRole. Componentes nunca acessam o db diretamente.
 */
import { isFuture, isPast, isToday, parseISO } from 'date-fns'

import { getCurrentUser } from '@/lib/auth'
import { PRIORITY_ORDER } from '@/lib/constants'
import { canSeeAllOrg, scopeByRole } from '@/lib/permissions'
import { contacts, leads, ORG_ID, profiles, tasks } from '@/mocks/db'
import { clone, genId, mockDelay } from '@/mocks/latency'
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

/** Monta a tarefa com os nomes das entidades relacionadas. */
function withRelations(task: Task): TaskWithRelations {
  const contact = contacts.find((c) => c.id === task.contactId)
  const assignee = profiles.find((p) => p.id === task.assignedTo)
  const lead = task.leadId ? leads.find((l) => l.id === task.leadId) : undefined
  return {
    ...clone(task),
    contactNome: contact?.nome ?? 'Contato removido',
    assigneeNome: assignee?.nome ?? 'Sem responsável',
    leadTitulo: lead?.titulo ?? null,
  }
}

/** Ordena por prazo ascendente (sem prazo por último) e depois por prioridade. */
function byDueDateThenPriority(a: Task, b: Task): number {
  const ad = a.dueDate ? parseISO(a.dueDate).getTime() : Number.POSITIVE_INFINITY
  const bd = b.dueDate ? parseISO(b.dueDate).getTime() : Number.POSITIVE_INFINITY
  if (ad !== bd) return ad - bd
  return PRIORITY_ORDER[a.prioridade] - PRIORITY_ORDER[b.prioridade]
}

/** Lista tarefas escopadas por papel e filtradas pela visão selecionada. */
export async function listTasks(filter: TaskFilter): Promise<TaskWithRelations[]> {
  const user = getCurrentUser()
  const scoped = scopeByRole(user, tasks, 'assignedTo')

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

  const result = scoped
    .filter(matches)
    .sort(byDueDateThenPriority)
    .map(withRelations)

  return mockDelay(result)
}

/** Contatos escopados por papel, como opções de select (para vincular a tarefa). */
export async function listContactsForSelect(): Promise<SelectOption[]> {
  const user = getCurrentUser()
  const options = scopeByRole(user, contacts, 'ownerId')
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .map((c) => ({ value: c.id, label: c.nome }))
  return mockDelay(options)
}

/** Leads (escopados) de um contato específico, como opções de select. */
export async function listLeadsByContact(contactId: string): Promise<SelectOption[]> {
  if (!contactId) return mockDelay([])
  const user = getCurrentUser()
  const options = scopeByRole(user, leads, 'assignedTo')
    .filter((l) => l.contactId === contactId)
    .map((l) => ({ value: l.id, label: l.titulo }))
  return mockDelay(options)
}

/** Usuários ativos da organização, como opções de responsável (admin/gestor escolhem). */
export async function listOrgUsers(): Promise<SelectOption[]> {
  const options = profiles
    .filter((p) => p.organizationId === ORG_ID && p.ativo)
    .map((p) => ({ value: p.id, label: p.nome }))
  return mockDelay(options)
}

/** Cria uma nova tarefa. Corretor tem o responsável forçado a si mesmo. */
export async function createTask(input: TaskInput): Promise<Task> {
  const user = getCurrentUser()
  const assignedTo = canSeeAllOrg(user) ? input.assignedTo : user.id
  const nowIso = new Date().toISOString()

  const task: Task = {
    id: genId('t'),
    organizationId: ORG_ID,
    contactId: input.contactId,
    leadId: input.leadId || null,
    titulo: input.titulo.trim(),
    descricao: input.descricao.trim(),
    prioridade: input.prioridade,
    status: 'pendente',
    dueDate: toIsoDueDate(input.dueDate),
    assignedTo,
    criadoPor: user.id,
    criadoEm: nowIso,
    concluidaEm: null,
  }

  tasks.push(task)
  return mockDelay(task)
}

/** Atualiza os campos editáveis de uma tarefa. Corretor não reatribui responsável. */
export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const user = getCurrentUser()
  const task = tasks.find((t) => t.id === id)
  if (!task) throw new Error('Tarefa não encontrada.')

  task.titulo = input.titulo.trim()
  task.descricao = input.descricao.trim()
  task.contactId = input.contactId
  task.leadId = input.leadId || null
  task.prioridade = input.prioridade
  task.dueDate = toIsoDueDate(input.dueDate)
  if (canSeeAllOrg(user)) task.assignedTo = input.assignedTo

  return mockDelay(task)
}

/** Alterna o status entre pendente/concluída, ajustando `concluidaEm`. */
export async function toggleTask(id: string): Promise<Task> {
  const task = tasks.find((t) => t.id === id)
  if (!task) throw new Error('Tarefa não encontrada.')

  if (task.status === 'pendente') {
    task.status = 'concluida'
    task.concluidaEm = new Date().toISOString()
  } else {
    task.status = 'pendente'
    task.concluidaEm = null
  }

  return mockDelay(task)
}

/** Remove uma tarefa. */
export async function deleteTask(id: string): Promise<{ id: string }> {
  const index = tasks.findIndex((t) => t.id === id)
  if (index >= 0) tasks.splice(index, 1)
  return mockDelay({ id })
}
