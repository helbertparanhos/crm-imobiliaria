/** Constantes globais da aplicação. Textos de UI em pt-BR (ver CLAUDE.md). */
import type {
  ContactOrigin,
  LeadStatus,
  TaskPriority,
  TaskStatus,
} from '@/types'

export const APP_NAME = 'CRM Imobiliária'

/** Caminhos de rota centralizados — usados pelo router e pela navegação. */
export const ROUTES = {
  dashboard: '/',
  contatos: '/contatos',
  pipeline: '/pipeline',
  tarefas: '/tarefas',
  configuracoes: '/configuracoes',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

// --- Rótulos pt-BR das enumerações ---------------------------------------

export const ORIGIN_LABELS: Record<ContactOrigin, string> = {
  site: 'Site',
  indicacao: 'Indicação',
  portal: 'Portal',
  whatsapp: 'WhatsApp',
  telefone: 'Telefone',
  outro: 'Outro',
}

export const ORIGIN_OPTIONS = Object.entries(ORIGIN_LABELS).map(
  ([value, label]) => ({ value: value as ContactOrigin, label }),
)

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

/** Ordem de exibição por prioridade (alta primeiro) — usada na timeline de tarefas. */
export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  alta: 0,
  media: 1,
  baixa: 2,
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendente: 'Pendente',
  concluida: 'Concluída',
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  aberto: 'Aberto',
  ganho: 'Ganho',
  perdido: 'Perdido',
}
