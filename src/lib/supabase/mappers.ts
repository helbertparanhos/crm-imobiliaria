/**
 * Mapeadores linha (snake_case do Postgres) → entidade (camelCase do TS).
 * Centralizados para todos os repos Supabase usarem o mesmo mapeamento.
 * As colunas seguem exatamente o schema em supabase/migrations/…_schema.sql.
 */
import type {
  Contact,
  ContactOrigin,
  CustomFieldDef,
  CustomFieldType,
  Lead,
  LeadStatus,
  Organization,
  PipelineStage,
  Profile,
  Role,
  Task,
  TaskPriority,
  TaskStatus,
} from '@/types'

export interface OrganizationRow {
  id: string
  nome: string
  criado_em: string
}
export function mapOrganization(r: OrganizationRow): Organization {
  return { id: r.id, nome: r.nome, criadoEm: r.criado_em }
}

export interface ProfileRow {
  id: string
  organization_id: string
  nome: string
  email: string
  papel: Role
  ativo: boolean
  criado_em: string
}
export function mapProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    organizationId: r.organization_id,
    nome: r.nome,
    email: r.email,
    papel: r.papel,
    ativo: r.ativo,
    criadoEm: r.criado_em,
  }
}

export interface PipelineStageRow {
  id: string
  organization_id: string
  nome: string
  ordem: number
  cor: string
  is_ganho: boolean
  is_perdido: boolean
}
export function mapStage(r: PipelineStageRow): PipelineStage {
  return {
    id: r.id,
    organizationId: r.organization_id,
    nome: r.nome,
    ordem: r.ordem,
    cor: r.cor,
    isGanho: r.is_ganho,
    isPerdido: r.is_perdido,
  }
}

export interface CustomFieldDefRow {
  id: string
  organization_id: string
  entidade: 'contact'
  chave: string
  label: string
  tipo: CustomFieldType
  opcoes: string[] | null
  ordem: number
}
export function mapCustomFieldDef(r: CustomFieldDefRow): CustomFieldDef {
  return {
    id: r.id,
    organizationId: r.organization_id,
    entidade: r.entidade,
    chave: r.chave,
    label: r.label,
    tipo: r.tipo,
    opcoes: r.opcoes ?? undefined,
    ordem: r.ordem,
  }
}

export interface ContactRow {
  id: string
  organization_id: string
  nome: string
  telefone: string
  email: string
  origem: ContactOrigin
  tags: string[]
  campos_customizados: Record<string, string | number | boolean | null>
  owner_id: string
  criado_por: string | null
  criado_em: string
  atualizado_em: string
}
export function mapContact(r: ContactRow): Contact {
  return {
    id: r.id,
    organizationId: r.organization_id,
    nome: r.nome,
    telefone: r.telefone,
    email: r.email,
    origem: r.origem,
    tags: r.tags ?? [],
    camposCustomizados: r.campos_customizados ?? {},
    ownerId: r.owner_id,
    criadoPor: r.criado_por ?? r.owner_id,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  }
}

export interface LeadRow {
  id: string
  organization_id: string
  contact_id: string
  stage_id: string
  titulo: string
  valor_estimado: number | string
  assigned_to: string
  status: LeadStatus
  posicao: number
  criado_em: string
  atualizado_em: string
  fechado_em: string | null
}
export function mapLead(r: LeadRow): Lead {
  return {
    id: r.id,
    organizationId: r.organization_id,
    contactId: r.contact_id,
    stageId: r.stage_id,
    titulo: r.titulo,
    valorEstimado: Number(r.valor_estimado),
    assignedTo: r.assigned_to,
    status: r.status,
    posicao: r.posicao,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
    fechadoEm: r.fechado_em,
  }
}

export interface TaskRow {
  id: string
  organization_id: string
  contact_id: string
  lead_id: string | null
  titulo: string
  descricao: string
  prioridade: TaskPriority
  status: TaskStatus
  due_date: string | null
  assigned_to: string
  criado_por: string | null
  criado_em: string
  concluida_em: string | null
}
export function mapTask(r: TaskRow): Task {
  return {
    id: r.id,
    organizationId: r.organization_id,
    contactId: r.contact_id,
    leadId: r.lead_id,
    titulo: r.titulo,
    descricao: r.descricao,
    prioridade: r.prioridade,
    status: r.status,
    dueDate: r.due_date,
    assignedTo: r.assigned_to,
    criadoPor: r.criado_por ?? r.assigned_to,
    criadoEm: r.criado_em,
    concluidaEm: r.concluida_em,
  }
}
