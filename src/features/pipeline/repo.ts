/**
 * Camada de dados da feature Pipeline (SPEC §4).
 * Lê/escreve os arrays mock de @/mocks/db aplicando escopo por papel.
 * Componentes NUNCA acessam o db direto — só via hooks → estas funções.
 */
import {
  ORG_ID,
  contacts,
  leads,
  pipelineStages,
  profiles,
} from '@/mocks/db'
import { genId, mockDelay } from '@/mocks/latency'
import { getCurrentUser } from '@/lib/auth'
import { canSeeAllOrg, scopeByRole } from '@/lib/permissions'
import type { Lead, LeadStatus, Profile } from '@/types'

import type {
  BoardData,
  BoardLead,
  CreateLeadInput,
  LeadDetail,
  SelectOption,
} from './types'

function contactName(contactId: string): string {
  return contacts.find((c) => c.id === contactId)?.nome ?? 'Contato removido'
}

function userName(userId: string): string {
  return profiles.find((p) => p.id === userId)?.nome ?? 'Sem responsável'
}

function enrich(lead: Lead): BoardLead {
  return {
    ...lead,
    contatoNome: contactName(lead.contactId),
    responsavelNome: userName(lead.assignedTo),
  }
}

/** Etapas da organização ordenadas por `ordem`. */
function orderedStages() {
  return pipelineStages
    .filter((s) => s.organizationId === ORG_ID)
    .sort((a, b) => a.ordem - b.ordem)
}

/** Deriva status/fechadoEm a partir da etapa de destino. */
function resolveStatus(
  stageIsGanho: boolean,
  stageIsPerdido: boolean,
  nowIso: string,
): { status: LeadStatus; fechadoEm: string | null } {
  if (stageIsGanho) return { status: 'ganho', fechadoEm: nowIso }
  if (stageIsPerdido) return { status: 'perdido', fechadoEm: nowIso }
  return { status: 'aberto', fechadoEm: null }
}

/** Quadro kanban escopado pelo papel do usuário atual (assignedTo). */
export async function getBoard(): Promise<BoardData> {
  const user = getCurrentUser()
  const scoped = scopeByRole(user, leads, 'assignedTo')
  const enriched = scoped
    .sort((a, b) => a.posicao - b.posicao)
    .map(enrich)
  return mockDelay<BoardData>({ stages: orderedStages(), leads: enriched })
}

/** Move um lead para outra etapa e ajusta status/fechadoEm. Persiste no mock. */
export async function moveLead(leadId: string, toStageId: string): Promise<Lead> {
  const lead = leads.find((l) => l.id === leadId)
  if (!lead) throw new Error('Lead não encontrado')
  const stage = pipelineStages.find((s) => s.id === toStageId)
  if (!stage) throw new Error('Etapa não encontrada')

  const nowIso = new Date().toISOString()
  const { status, fechadoEm } = resolveStatus(stage.isGanho, stage.isPerdido, nowIso)
  lead.stageId = toStageId
  lead.status = status
  lead.fechadoEm = fechadoEm
  lead.atualizadoEm = nowIso
  return mockDelay(lead)
}

/** Cria um lead. Corretor é forçado a si mesmo; gestor/admin escolhem. */
export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const user = getCurrentUser()
  const stage = pipelineStages.find((s) => s.id === input.stageId)
  if (!stage) throw new Error('Etapa não encontrada')

  const nowIso = new Date().toISOString()
  const assignedTo = canSeeAllOrg(user) ? input.assignedTo : user.id
  const maxPos = leads
    .filter((l) => l.stageId === input.stageId)
    .reduce((max, l) => Math.max(max, l.posicao), 0)
  const { status, fechadoEm } = resolveStatus(stage.isGanho, stage.isPerdido, nowIso)

  const lead: Lead = {
    id: genId('l'),
    organizationId: ORG_ID,
    contactId: input.contactId,
    stageId: input.stageId,
    titulo: input.titulo,
    valorEstimado: input.valorEstimado,
    assignedTo,
    status,
    posicao: maxPos + 1,
    criadoEm: nowIso,
    atualizadoEm: nowIso,
    fechadoEm,
  }
  leads.push(lead)
  return mockDelay(lead)
}

/** Detalhe de um lead (escopado). Retorna null se não visível/inexistente. */
export async function getLeadById(id: string): Promise<LeadDetail | null> {
  const user = getCurrentUser()
  const scoped = scopeByRole(user, leads, 'assignedTo')
  const lead = scoped.find((l) => l.id === id)
  if (!lead) return mockDelay<LeadDetail | null>(null)
  const detail: LeadDetail = {
    ...enrich(lead),
    stage: pipelineStages.find((s) => s.id === lead.stageId) ?? null,
  }
  return mockDelay<LeadDetail | null>(detail)
}

/** Contatos escopados (ownerId) para o select de criação. */
export async function listContactsForSelect(): Promise<SelectOption[]> {
  const user = getCurrentUser()
  const scoped = scopeByRole(user, contacts, 'ownerId')
  const options: SelectOption[] = scoped
    .map((c) => ({ id: c.id, nome: c.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  return mockDelay(options)
}

/** Usuários ativos da organização (para escolher responsável). */
export async function listOrgUsers(): Promise<Profile[]> {
  const scoped = profiles.filter((p) => p.organizationId === ORG_ID && p.ativo)
  return mockDelay(scoped)
}
