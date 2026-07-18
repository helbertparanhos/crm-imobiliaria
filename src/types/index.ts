/**
 * Tipos globais das entidades (SPEC §5).
 * Datas são strings ISO 8601 (serializáveis) — formatadas na UI com date-fns.
 * Nomes de campos em inglês no código; rótulos de UI em pt-BR.
 */

export type Role = 'admin' | 'gestor' | 'corretor'

export type LeadStatus = 'aberto' | 'ganho' | 'perdido'

export type TaskStatus = 'pendente' | 'concluida'

export type TaskPriority = 'baixa' | 'media' | 'alta'

export type CustomFieldType = 'text' | 'number' | 'select' | 'date' | 'bool'

export type ContactOrigin =
  | 'site'
  | 'indicacao'
  | 'portal'
  | 'whatsapp'
  | 'telefone'
  | 'outro'

export interface Organization {
  id: string
  nome: string
  criadoEm: string
}

export interface Profile {
  id: string
  organizationId: string
  nome: string
  email: string
  papel: Role
  ativo: boolean
  criadoEm: string
}

export interface Contact {
  id: string
  organizationId: string
  nome: string
  telefone: string
  email: string
  origem: ContactOrigin
  tags: string[]
  /** Valores dos campos personalizados, indexados por `CustomFieldDef.chave`. */
  camposCustomizados: Record<string, string | number | boolean | null>
  /** Corretor responsável (profiles.id). Âncora da visibilidade por papel. */
  ownerId: string
  criadoPor: string
  criadoEm: string
  atualizadoEm: string
}

export interface CustomFieldDef {
  id: string
  organizationId: string
  entidade: 'contact'
  chave: string
  label: string
  tipo: CustomFieldType
  /** Opções para o tipo `select`. */
  opcoes?: string[]
  ordem: number
}

export interface PipelineStage {
  id: string
  organizationId: string
  nome: string
  ordem: number
  /** Cor em HSL/HEX usada nos cards e no dashboard. */
  cor: string
  isGanho: boolean
  isPerdido: boolean
}

export interface Lead {
  id: string
  organizationId: string
  contactId: string
  stageId: string
  titulo: string
  valorEstimado: number
  /** Corretor responsável (profiles.id). Âncora da visibilidade por papel. */
  assignedTo: string
  status: LeadStatus
  /** Ordenação do card dentro da coluna. */
  posicao: number
  criadoEm: string
  atualizadoEm: string
  fechadoEm: string | null
}

export interface Task {
  id: string
  organizationId: string
  /** Toda tarefa é vinculada a um contato (PRD §4.4). */
  contactId: string
  leadId: string | null
  titulo: string
  descricao: string
  prioridade: TaskPriority
  status: TaskStatus
  /** Prazo (ISO date). */
  dueDate: string | null
  /** Corretor responsável (profiles.id). Âncora da visibilidade por papel. */
  assignedTo: string
  criadoPor: string
  criadoEm: string
  concluidaEm: string | null
}

export interface Activity {
  id: string
  organizationId: string
  contactId: string | null
  leadId: string | null
  tipo: string
  payload: Record<string, unknown>
  ator: string
  criadoEm: string
}
