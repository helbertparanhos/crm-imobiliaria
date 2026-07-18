/**
 * Camada de dados da feature Contatos (Fase 1 — mock em memória).
 * Componentes -> hooks -> repo. Aqui aplicamos o escopo por papel
 * (scopeByRole), espelhando o que a RLS fará na Fase 3.
 */
import {
  contacts,
  customFieldDefs,
  leads,
  ORG_ID,
  pipelineStages,
  profiles,
  tasks,
} from '@/mocks/db'
import { clone, genId, mockDelay } from '@/mocks/latency'
import { getCurrentUser } from '@/lib/auth'
import { canSeeAllOrg, scopeByRole } from '@/lib/permissions'
import type {
  Contact,
  CustomFieldDef,
  Lead,
  PipelineStage,
  Profile,
  Task,
} from '@/types'

import type { ContactFilters, ContactInput } from './types'
import { ALL } from './types'

/** Relações exibidas no detalhe do contato. */
export interface ContactRelations {
  leads: Lead[]
  tasks: Task[]
}

/** Etapa do lead ABERTO mais recente do contato (ou null). Não clona (uso interno). */
function resolveCurrentStage(user: Profile, contactId: string): PipelineStage | null {
  const openLead = scopeByRole(user, leads, 'assignedTo')
    .filter((l) => l.contactId === contactId && l.status === 'aberto')
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))[0]
  if (!openLead) return null
  return pipelineStages.find((s) => s.id === openLead.stageId) ?? null
}

/** Lista contatos escopados pelo papel, aplicando busca e filtros. */
export async function listContacts(filters: ContactFilters): Promise<Contact[]> {
  const user = getCurrentUser()
  let rows = scopeByRole(user, contacts, 'ownerId')

  const term = filters.search.trim().toLowerCase()
  if (term) {
    rows = rows.filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.telefone.toLowerCase().includes(term),
    )
  }
  if (filters.ownerId !== ALL) {
    rows = rows.filter((c) => c.ownerId === filters.ownerId)
  }
  if (filters.origem !== ALL) {
    rows = rows.filter((c) => c.origem === filters.origem)
  }
  if (filters.tag !== ALL) {
    rows = rows.filter((c) => c.tags.includes(filters.tag))
  }

  return mockDelay(rows)
}

/** Busca um contato pelo id (respeitando o escopo). */
export async function getContactById(id: string): Promise<Contact | null> {
  const user = getCurrentUser()
  const found = scopeByRole(user, contacts, 'ownerId').find((c) => c.id === id)
  return mockDelay(found ?? null)
}

/** Cria um contato. Corretor é forçado a si; admin/gestor escolhem o responsável. */
export async function createContact(input: ContactInput): Promise<Contact> {
  const user = getCurrentUser()
  const nowIso = new Date().toISOString()
  const contact: Contact = {
    id: genId('c'),
    organizationId: ORG_ID,
    nome: input.nome,
    telefone: input.telefone,
    email: input.email,
    origem: input.origem,
    tags: input.tags,
    camposCustomizados: clone(input.camposCustomizados),
    ownerId: canSeeAllOrg(user) ? input.ownerId : user.id,
    criadoPor: user.id,
    criadoEm: nowIso,
    atualizadoEm: nowIso,
  }
  contacts.push(contact)
  return mockDelay(contact)
}

/** Atualiza um contato existente. */
export async function updateContact(id: string, input: ContactInput): Promise<Contact> {
  const user = getCurrentUser()
  const index = contacts.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Contato não encontrado.')

  const existing = contacts[index]
  const updated: Contact = {
    ...existing,
    nome: input.nome,
    telefone: input.telefone,
    email: input.email,
    origem: input.origem,
    tags: input.tags,
    camposCustomizados: clone(input.camposCustomizados),
    ownerId: canSeeAllOrg(user) ? input.ownerId : existing.ownerId,
    atualizadoEm: new Date().toISOString(),
  }
  contacts[index] = updated
  return mockDelay(updated)
}

/** Exclui um contato. */
export async function deleteContact(id: string): Promise<void> {
  const index = contacts.findIndex((c) => c.id === id)
  if (index !== -1) contacts.splice(index, 1)
  return mockDelay(undefined)
}

/** Etapas do funil (ordenadas). */
export async function listStages(): Promise<PipelineStage[]> {
  const rows = pipelineStages
    .filter((s) => s.organizationId === ORG_ID)
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
  return mockDelay(rows)
}

/** Usuários ativos da organização (para filtro/atribuição de responsável). */
export async function listOrgUsers(): Promise<Profile[]> {
  const rows = profiles.filter((p) => p.organizationId === ORG_ID && p.ativo)
  return mockDelay(rows)
}

/** Definições de campos personalizados de contato (ordenadas). */
export async function listCustomFieldDefs(): Promise<CustomFieldDef[]> {
  const rows = customFieldDefs
    .filter((d) => d.organizationId === ORG_ID && d.entidade === 'contact')
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
  return mockDelay(rows)
}

/** Leads e tarefas vinculados ao contato (escopados). */
export async function getContactRelations(id: string): Promise<ContactRelations> {
  const user = getCurrentUser()
  const contactLeads = scopeByRole(user, leads, 'assignedTo').filter(
    (l) => l.contactId === id,
  )
  const contactTasks = scopeByRole(user, tasks, 'assignedTo').filter(
    (t) => t.contactId === id,
  )
  return mockDelay({ leads: contactLeads, tasks: contactTasks })
}

/** Etapa atual (lead aberto mais recente) de um contato. */
export async function getCurrentStageForContact(
  contactId: string,
): Promise<PipelineStage | null> {
  const user = getCurrentUser()
  return mockDelay(resolveCurrentStage(user, contactId))
}

/** Mapa contactId -> etapa atual, para a coluna "Etapa atual" da tabela. */
export async function listCurrentStages(): Promise<Record<string, PipelineStage | null>> {
  const user = getCurrentUser()
  const map: Record<string, PipelineStage | null> = {}
  for (const c of scopeByRole(user, contacts, 'ownerId')) {
    map[c.id] = resolveCurrentStage(user, c.id)
  }
  return mockDelay(map)
}
