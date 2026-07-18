/**
 * Camada de dados da feature Contatos (Fase 3 — Supabase).
 * Implementa EXATAMENTE a mesma interface do repo.mock.ts, atrás do dispatcher
 * repo.ts (SPEC §4). A RLS do Supabase já escopa por papel no servidor, então
 * as LEITURAS fazem `select('*')` e aplicam em memória os MESMOS filtros/
 * ordenações/derivações do mock — SEM refiltrar por owner/papel manualmente.
 */
import { getCurrentUser } from '@/lib/auth'
import { canSeeAllOrg } from '@/lib/permissions'
import { supabase } from '@/lib/supabase/client'
import {
  mapContact,
  mapCustomFieldDef,
  mapLead,
  mapProfile,
  mapStage,
  mapTask,
  type ContactRow,
  type CustomFieldDefRow,
  type LeadRow,
  type PipelineStageRow,
  type ProfileRow,
  type TaskRow,
} from '@/lib/supabase/mappers'
import type {
  Contact,
  CustomFieldDef,
  Lead,
  PipelineStage,
  Profile,
  Task,
} from '@/types'

import type { ContactRelations } from './repo.mock'
import type { ContactFilters, ContactInput } from './types'
import { ALL } from './types'

// --- Leituras base (já escopadas pela RLS) --------------------------------

async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await supabase.from('contacts').select('*')
  if (error) throw error
  return ((data ?? []) as ContactRow[]).map(mapContact)
}

async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase.from('leads').select('*')
  if (error) throw error
  return ((data ?? []) as LeadRow[]).map(mapLead)
}

async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*')
  if (error) throw error
  return ((data ?? []) as TaskRow[]).map(mapTask)
}

async function fetchStages(): Promise<PipelineStage[]> {
  const { data, error } = await supabase.from('pipeline_stages').select('*')
  if (error) throw error
  return ((data ?? []) as PipelineStageRow[]).map(mapStage)
}

/** Etapa do lead ABERTO mais recente do contato (ou null). Dados já escopados. */
function resolveCurrentStage(
  leads: Lead[],
  stages: PipelineStage[],
  contactId: string,
): PipelineStage | null {
  const openLead = leads
    .filter((l) => l.contactId === contactId && l.status === 'aberto')
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))[0]
  if (!openLead) return null
  return stages.find((s) => s.id === openLead.stageId) ?? null
}

// --- API pública (espelha repo.mock.ts) -----------------------------------

/** Lista contatos (escopados pela RLS), aplicando busca e filtros em memória. */
export async function listContacts(filters: ContactFilters): Promise<Contact[]> {
  let rows = await fetchContacts()

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

  return rows
}

/** Busca um contato pelo id (a RLS garante o escopo). */
export async function getContactById(id: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? mapContact(data as ContactRow) : null
}

/** Cria um contato. Corretor é forçado a si; admin/gestor escolhem o responsável. */
export async function createContact(input: ContactInput): Promise<Contact> {
  const user = getCurrentUser()
  const payload = {
    organization_id: user.organizationId,
    nome: input.nome,
    telefone: input.telefone,
    email: input.email,
    origem: input.origem,
    tags: input.tags,
    campos_customizados: input.camposCustomizados,
    owner_id: canSeeAllOrg(user) ? input.ownerId : user.id,
    criado_por: user.id,
  }
  const { data, error } = await supabase
    .from('contacts')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return mapContact(data as ContactRow)
}

/** Atualiza um contato existente. Corretor não troca o responsável. */
export async function updateContact(id: string, input: ContactInput): Promise<Contact> {
  const user = getCurrentUser()
  const patch = {
    nome: input.nome,
    telefone: input.telefone,
    email: input.email,
    origem: input.origem,
    tags: input.tags,
    campos_customizados: input.camposCustomizados,
    atualizado_em: new Date().toISOString(),
    ...(canSeeAllOrg(user) ? { owner_id: input.ownerId } : {}),
  }
  const { data, error } = await supabase
    .from('contacts')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapContact(data as ContactRow)
}

/** Exclui um contato. */
export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) throw error
}

/** Etapas do funil (ordenadas). */
export async function listStages(): Promise<PipelineStage[]> {
  const rows = await fetchStages()
  return rows.slice().sort((a, b) => a.ordem - b.ordem)
}

/** Usuários ativos da organização (para filtro/atribuição de responsável). */
export async function listOrgUsers(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) throw error
  return ((data ?? []) as ProfileRow[]).map(mapProfile).filter((p) => p.ativo)
}

/** Definições de campos personalizados de contato (ordenadas). */
export async function listCustomFieldDefs(): Promise<CustomFieldDef[]> {
  const { data, error } = await supabase.from('custom_field_defs').select('*')
  if (error) throw error
  return ((data ?? []) as CustomFieldDefRow[])
    .map(mapCustomFieldDef)
    .filter((d) => d.entidade === 'contact')
    .sort((a, b) => a.ordem - b.ordem)
}

/** Leads e tarefas vinculados ao contato (escopados pela RLS). */
export async function getContactRelations(id: string): Promise<ContactRelations> {
  const [leads, tasks] = await Promise.all([fetchLeads(), fetchTasks()])
  return {
    leads: leads.filter((l) => l.contactId === id),
    tasks: tasks.filter((t) => t.contactId === id),
  }
}

/** Etapa atual (lead aberto mais recente) de um contato. */
export async function getCurrentStageForContact(
  contactId: string,
): Promise<PipelineStage | null> {
  const [leads, stages] = await Promise.all([fetchLeads(), fetchStages()])
  return resolveCurrentStage(leads, stages, contactId)
}

/** Mapa contactId -> etapa atual, para a coluna "Etapa atual" da tabela. */
export async function listCurrentStages(): Promise<Record<string, PipelineStage | null>> {
  const [contacts, leads, stages] = await Promise.all([
    fetchContacts(),
    fetchLeads(),
    fetchStages(),
  ])
  const map: Record<string, PipelineStage | null> = {}
  for (const c of contacts) {
    map[c.id] = resolveCurrentStage(leads, stages, c.id)
  }
  return map
}
