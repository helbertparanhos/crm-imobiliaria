/** Tipos locais da feature Tarefas (filtros, opções de select, entrada de formulário). */
import type { Task, TaskPriority } from '@/types'

/** Filtros disponíveis na visão em lista. */
export type TaskFilter =
  | 'minhas'
  | 'atrasadas'
  | 'hoje'
  | 'proximas'
  | 'todas'
  | 'concluidas'

/** Tarefa enriquecida com os nomes das entidades relacionadas para exibição. */
export interface TaskWithRelations extends Task {
  contactNome: string
  assigneeNome: string
  leadTitulo: string | null
}

/** Opção genérica de `<Select/>`. */
export interface SelectOption {
  value: string
  label: string
}

/**
 * Entrada crua do formulário (create/update), com strings vazias para valores
 * ausentes. O `repo` normaliza `leadId`/`dueDate` e força o responsável do corretor.
 */
export interface TaskInput {
  titulo: string
  descricao: string
  contactId: string
  /** '' = nenhum lead. */
  leadId: string
  prioridade: TaskPriority
  /** '' ou yyyy-MM-dd. */
  dueDate: string
  assignedTo: string
}
