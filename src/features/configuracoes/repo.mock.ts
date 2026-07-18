/**
 * Camada de dados da tela de Configurações (Fase 1).
 * Lê/escreve os arrays mockados de @/mocks/db filtrando por organizationId=ORG_ID.
 * Sempre resolve com CÓPIAS (mockDelay clona). Não há escopo por dono aqui: as
 * entidades são da organização e o acesso é controlado por papel na UI/hooks.
 */
import {
  ORG_ID,
  customFieldDefs,
  organizations,
  pipelineStages,
  profiles,
} from '@/mocks/db'
import { clone, genId, mockDelay } from '@/mocks/latency'
import type {
  CustomFieldDef,
  CustomFieldType,
  Organization,
  PipelineStage,
  Profile,
  Role,
} from '@/types'

// --- Organização ----------------------------------------------------------

export async function getOrg(): Promise<Organization> {
  const org = organizations.find((o) => o.id === ORG_ID) ?? organizations[0]
  return mockDelay(org)
}

export async function updateOrg(
  patch: Partial<Pick<Organization, 'nome'>>,
): Promise<Organization> {
  const org = organizations.find((o) => o.id === ORG_ID)
  if (!org) throw new Error('Organização não encontrada.')
  Object.assign(org, patch)
  return mockDelay(org)
}

// --- Usuários & papéis ----------------------------------------------------

export interface CreateUserInput {
  nome: string
  email: string
  papel: Exclude<Role, 'admin'>
}

export type UpdateUserPatch = Partial<
  Pick<Profile, 'nome' | 'email' | 'papel' | 'ativo'>
>

export async function listUsers(): Promise<Profile[]> {
  const rows = profiles.filter((p) => p.organizationId === ORG_ID)
  return mockDelay(rows)
}

export async function createUser(input: CreateUserInput): Promise<Profile> {
  const user: Profile = {
    id: genId('u'),
    organizationId: ORG_ID,
    nome: input.nome,
    email: input.email,
    papel: input.papel,
    ativo: true,
    criadoEm: new Date().toISOString(),
  }
  profiles.push(user)
  return mockDelay(user)
}

export async function updateUser(
  id: string,
  patch: UpdateUserPatch,
): Promise<Profile> {
  const user = profiles.find((p) => p.id === id && p.organizationId === ORG_ID)
  if (!user) throw new Error('Usuário não encontrado.')
  Object.assign(user, patch)
  return mockDelay(user)
}

// --- Campos personalizados ------------------------------------------------

export interface CustomFieldInput {
  label: string
  chave: string
  tipo: CustomFieldType
  opcoes: string[]
  ordem: number
}

export async function listCustomFieldDefs(): Promise<CustomFieldDef[]> {
  const rows = customFieldDefs
    .filter((c) => c.organizationId === ORG_ID)
    .sort((a, b) => a.ordem - b.ordem)
  return mockDelay(rows)
}

export async function createCustomFieldDef(
  input: CustomFieldInput,
): Promise<CustomFieldDef> {
  const def: CustomFieldDef = {
    id: genId('cf'),
    organizationId: ORG_ID,
    entidade: 'contact',
    chave: input.chave,
    label: input.label,
    tipo: input.tipo,
    opcoes: input.tipo === 'select' ? clone(input.opcoes) : undefined,
    ordem: input.ordem,
  }
  customFieldDefs.push(def)
  return mockDelay(def)
}

export async function updateCustomFieldDef(
  id: string,
  patch: Partial<CustomFieldInput>,
): Promise<CustomFieldDef> {
  const def = customFieldDefs.find(
    (c) => c.id === id && c.organizationId === ORG_ID,
  )
  if (!def) throw new Error('Campo personalizado não encontrado.')
  Object.assign(def, patch)
  def.opcoes = def.tipo === 'select' ? def.opcoes ?? [] : undefined
  return mockDelay(def)
}

export async function deleteCustomFieldDef(id: string): Promise<void> {
  const idx = customFieldDefs.findIndex(
    (c) => c.id === id && c.organizationId === ORG_ID,
  )
  if (idx >= 0) customFieldDefs.splice(idx, 1)
  return mockDelay(undefined)
}

// --- Etapas do funil ------------------------------------------------------

export type ReorderDirection = 'up' | 'down'

export interface StageInput {
  nome: string
  cor: string
  isGanho: boolean
  isPerdido: boolean
}

export async function listStages(): Promise<PipelineStage[]> {
  const rows = pipelineStages
    .filter((s) => s.organizationId === ORG_ID)
    .sort((a, b) => a.ordem - b.ordem)
  return mockDelay(rows)
}

export async function createStage(input: StageInput): Promise<PipelineStage> {
  const orgStages = pipelineStages.filter((s) => s.organizationId === ORG_ID)
  const maxOrdem = orgStages.reduce((max, s) => Math.max(max, s.ordem), 0)
  const stage: PipelineStage = {
    id: genId('stage'),
    organizationId: ORG_ID,
    nome: input.nome,
    ordem: maxOrdem + 1,
    cor: input.cor,
    isGanho: input.isGanho,
    isPerdido: input.isPerdido,
  }
  pipelineStages.push(stage)
  return mockDelay(stage)
}

export async function updateStage(
  id: string,
  patch: Partial<StageInput>,
): Promise<PipelineStage> {
  const stage = pipelineStages.find(
    (s) => s.id === id && s.organizationId === ORG_ID,
  )
  if (!stage) throw new Error('Etapa não encontrada.')
  Object.assign(stage, patch)
  return mockDelay(stage)
}

export async function reorderStage(
  id: string,
  direction: ReorderDirection,
): Promise<PipelineStage[]> {
  const ordered = pipelineStages
    .filter((s) => s.organizationId === ORG_ID)
    .sort((a, b) => a.ordem - b.ordem)
  const index = ordered.findIndex((s) => s.id === id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index >= 0 && target >= 0 && target < ordered.length) {
    const current = ordered[index]
    const neighbor = ordered[target]
    const tmp = current.ordem
    current.ordem = neighbor.ordem
    neighbor.ordem = tmp
  }
  const result = pipelineStages
    .filter((s) => s.organizationId === ORG_ID)
    .sort((a, b) => a.ordem - b.ordem)
  return mockDelay(result)
}

export async function deleteStage(id: string): Promise<void> {
  const idx = pipelineStages.findIndex(
    (s) => s.id === id && s.organizationId === ORG_ID,
  )
  if (idx >= 0) pipelineStages.splice(idx, 1)
  return mockDelay(undefined)
}
