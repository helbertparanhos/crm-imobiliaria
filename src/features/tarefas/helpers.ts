/** Utilidades de apresentação da feature Tarefas. */
import { isPast, isToday, parseISO } from 'date-fns'

import { PRIORITY_ORDER } from '@/lib/constants'
import type { TaskWithRelations } from './types'

/** Tarefa pendente com prazo anterior a hoje. */
export function isOverdue(
  task: Pick<TaskWithRelations, 'status' | 'dueDate'>,
): boolean {
  if (task.status !== 'pendente' || !task.dueDate) return false
  const date = parseISO(task.dueDate)
  return isPast(date) && !isToday(date)
}

/** Ordena para a timeline: por prioridade (alta primeiro) e depois por prazo. */
export function sortForTimeline(items: TaskWithRelations[]): TaskWithRelations[] {
  return [...items].sort((a, b) => {
    const priority = PRIORITY_ORDER[a.prioridade] - PRIORITY_ORDER[b.prioridade]
    if (priority !== 0) return priority
    const ad = a.dueDate ? parseISO(a.dueDate).getTime() : Number.POSITIVE_INFINITY
    const bd = b.dueDate ? parseISO(b.dueDate).getTime() : Number.POSITIVE_INFINITY
    return ad - bd
  })
}
