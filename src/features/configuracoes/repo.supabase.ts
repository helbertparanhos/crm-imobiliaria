/**
 * Camada de dados da tela de Configurações (Fase 3) sobre o Supabase.
 * Mesma interface do repo.mock — só a implementação muda. A RLS já aplicada
 * escopa as LEITURAS por papel/organização no servidor; as ESCRITAS usam o
 * organization_id do usuário atual quando precisam carimbar o dono da linha.
 */
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'
import {
  mapCustomFieldDef,
  mapOrganization,
  mapProfile,
  mapStage,
  type CustomFieldDefRow,
  type OrganizationRow,
  type PipelineStageRow,
  type ProfileRow,
} from '@/lib/supabase/mappers'
import type {
  CustomFieldDef,
  Organization,
  PipelineStage,
  Profile,
} from '@/types'

import type {
  CreateUserInput,
  CustomFieldInput,
  ReorderDirection,
  StageInput,
  UpdateUserPatch,
} from './repo.mock'

// --- Organização ----------------------------------------------------------

export async function getOrg(): Promise<Organization> {
  const { organizationId } = getCurrentUser()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()
  if (error) throw error
  return mapOrganization(data as OrganizationRow)
}

export async function updateOrg(
  patch: Partial<Pick<Organization, 'nome'>>,
): Promise<Organization> {
  const { organizationId } = getCurrentUser()
  const row: Partial<Pick<OrganizationRow, 'nome'>> = {}
  if (patch.nome !== undefined) row.nome = patch.nome
  const { data, error } = await supabase
    .from('organizations')
    .update(row)
    .eq('id', organizationId)
    .select()
    .single()
  if (error) throw error
  return mapOrganization(data as OrganizationRow)
}

// --- Usuários & papéis ----------------------------------------------------

export async function listUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('criado_em', { ascending: true })
  if (error) throw error
  return (data as ProfileRow[]).map(mapProfile)
}

export async function createUser(_input: CreateUserInput): Promise<Profile> {
  // No Supabase, profiles.id referencia auth.users; criar um usuário de auth
  // exige privilégio admin (service_role), indisponível com segurança no front.
  throw new Error(
    'Convidar usuário exige o painel do Supabase (Authentication) ou uma Edge Function — indisponível no app nesta fase.',
  )
}

export async function updateUser(
  id: string,
  patch: UpdateUserPatch,
): Promise<Profile> {
  const row: Partial<Pick<ProfileRow, 'nome' | 'email' | 'papel' | 'ativo'>> = {}
  if (patch.nome !== undefined) row.nome = patch.nome
  if (patch.email !== undefined) row.email = patch.email
  if (patch.papel !== undefined) row.papel = patch.papel
  if (patch.ativo !== undefined) row.ativo = patch.ativo
  const { data, error } = await supabase
    .from('profiles')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapProfile(data as ProfileRow)
}

// --- Campos personalizados ------------------------------------------------

export async function listCustomFieldDefs(): Promise<CustomFieldDef[]> {
  const { data, error } = await supabase
    .from('custom_field_defs')
    .select('*')
    .order('ordem', { ascending: true })
  if (error) throw error
  return (data as CustomFieldDefRow[]).map(mapCustomFieldDef)
}

export async function createCustomFieldDef(
  input: CustomFieldInput,
): Promise<CustomFieldDef> {
  const { organizationId } = getCurrentUser()
  const row = {
    organization_id: organizationId,
    entidade: 'contact' as const,
    chave: input.chave,
    label: input.label,
    tipo: input.tipo,
    opcoes: input.tipo === 'select' ? input.opcoes : null,
    ordem: input.ordem,
  }
  const { data, error } = await supabase
    .from('custom_field_defs')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return mapCustomFieldDef(data as CustomFieldDefRow)
}

export async function updateCustomFieldDef(
  id: string,
  patch: Partial<CustomFieldInput>,
): Promise<CustomFieldDef> {
  // Lê a linha atual para normalizar `opcoes` conforme o `tipo` resultante,
  // reproduzindo a regra do mock (select → array; demais tipos → null).
  const { data: current, error: readError } = await supabase
    .from('custom_field_defs')
    .select('*')
    .eq('id', id)
    .single()
  if (readError) throw readError
  const existing = current as CustomFieldDefRow

  const nextTipo = patch.tipo ?? existing.tipo
  const nextOpcoes =
    nextTipo === 'select' ? (patch.opcoes ?? existing.opcoes ?? []) : null

  const row: {
    label?: string
    chave?: string
    tipo?: CustomFieldInput['tipo']
    ordem?: number
    opcoes: string[] | null
  } = { opcoes: nextOpcoes }
  if (patch.label !== undefined) row.label = patch.label
  if (patch.chave !== undefined) row.chave = patch.chave
  if (patch.tipo !== undefined) row.tipo = patch.tipo
  if (patch.ordem !== undefined) row.ordem = patch.ordem

  const { data, error } = await supabase
    .from('custom_field_defs')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapCustomFieldDef(data as CustomFieldDefRow)
}

export async function deleteCustomFieldDef(id: string): Promise<void> {
  const { error } = await supabase
    .from('custom_field_defs')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// --- Etapas do funil ------------------------------------------------------

export async function listStages(): Promise<PipelineStage[]> {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('ordem', { ascending: true })
  if (error) throw error
  return (data as PipelineStageRow[]).map(mapStage)
}

export async function createStage(input: StageInput): Promise<PipelineStage> {
  const { organizationId } = getCurrentUser()
  // Próxima `ordem` = maior ordem atual + 1 (0 quando não há etapas), como o mock.
  const { data: last, error: lastError } = await supabase
    .from('pipeline_stages')
    .select('ordem')
    .order('ordem', { ascending: false })
    .limit(1)
  if (lastError) throw lastError
  const maxOrdem = (last as { ordem: number }[])[0]?.ordem ?? 0

  const row = {
    organization_id: organizationId,
    nome: input.nome,
    ordem: maxOrdem + 1,
    cor: input.cor,
    is_ganho: input.isGanho,
    is_perdido: input.isPerdido,
  }
  const { data, error } = await supabase
    .from('pipeline_stages')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return mapStage(data as PipelineStageRow)
}

export async function updateStage(
  id: string,
  patch: Partial<StageInput>,
): Promise<PipelineStage> {
  const row: {
    nome?: string
    cor?: string
    is_ganho?: boolean
    is_perdido?: boolean
  } = {}
  if (patch.nome !== undefined) row.nome = patch.nome
  if (patch.cor !== undefined) row.cor = patch.cor
  if (patch.isGanho !== undefined) row.is_ganho = patch.isGanho
  if (patch.isPerdido !== undefined) row.is_perdido = patch.isPerdido

  const { data, error } = await supabase
    .from('pipeline_stages')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapStage(data as PipelineStageRow)
}

export async function reorderStage(
  id: string,
  direction: ReorderDirection,
): Promise<PipelineStage[]> {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('ordem', { ascending: true })
  if (error) throw error
  const rows = data as PipelineStageRow[]

  const index = rows.findIndex((s) => s.id === id)
  const target = direction === 'up' ? index - 1 : index + 1

  if (index >= 0 && target >= 0 && target < rows.length) {
    const current = rows[index]
    const neighbor = rows[target]
    // Troca a `ordem` das duas etapas com dois updates.
    const { error: e1 } = await supabase
      .from('pipeline_stages')
      .update({ ordem: neighbor.ordem })
      .eq('id', current.id)
    if (e1) throw e1
    const { error: e2 } = await supabase
      .from('pipeline_stages')
      .update({ ordem: current.ordem })
      .eq('id', neighbor.id)
    if (e2) throw e2

    const { data: refreshed, error: refreshError } = await supabase
      .from('pipeline_stages')
      .select('*')
      .order('ordem', { ascending: true })
    if (refreshError) throw refreshError
    return (refreshed as PipelineStageRow[]).map(mapStage)
  }

  return rows.map(mapStage)
}

export async function deleteStage(id: string): Promise<void> {
  const { error } = await supabase.from('pipeline_stages').delete().eq('id', id)
  if (error) throw error
}
