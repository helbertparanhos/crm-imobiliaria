/**
 * Camada de dados da feature Pipeline no Supabase (SPEC §4, Fase 3).
 * MESMA interface que `repo.mock.ts` — só a implementação muda por baixo.
 * A RLS já escopa por papel (assigned_to/owner_id) no servidor, então as
 * LEITURAS NÃO filtram por papel manualmente: fazem `select('*')` e a RLS
 * decide o que retorna. Os shapes derivados (BoardLead/LeadDetail) são
 * montados em JS a partir das linhas mapeadas.
 */
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import { canSeeAllOrg } from '@/lib/permissions'
import {
  mapContact,
  mapLead,
  mapProfile,
  mapStage,
} from '@/lib/supabase/mappers'
import type {
  ContactRow,
  LeadRow,
  PipelineStageRow,
  ProfileRow,
} from '@/lib/supabase/mappers'
import type { Lead, LeadStatus, Profile } from '@/types'

import type {
  BoardData,
  BoardLead,
  CreateLeadInput,
  LeadDetail,
  SelectOption,
} from './types'

/** Deriva status/fechadoEm a partir da etapa de destino (espelha o mock). */
function resolveStatus(
  stageIsGanho: boolean,
  stageIsPerdido: boolean,
  nowIso: string,
): { status: LeadStatus; fechadoEm: string | null } {
  if (stageIsGanho) return { status: 'ganho', fechadoEm: nowIso }
  if (stageIsPerdido) return { status: 'perdido', fechadoEm: nowIso }
  return { status: 'aberto', fechadoEm: null }
}

/** Quadro kanban. RLS escopa os leads pelo papel; nomes resolvidos em JS. */
export async function getBoard(): Promise<BoardData> {
  const [leadsRes, stagesRes, contactsRes, profilesRes] = await Promise.all([
    supabase.from('leads').select('*'),
    supabase.from('pipeline_stages').select('*'),
    supabase.from('contacts').select('*'),
    supabase.from('profiles').select('*'),
  ])
  if (leadsRes.error) throw leadsRes.error
  if (stagesRes.error) throw stagesRes.error
  if (contactsRes.error) throw contactsRes.error
  if (profilesRes.error) throw profilesRes.error

  const stages = (stagesRes.data as PipelineStageRow[])
    .map(mapStage)
    .sort((a, b) => a.ordem - b.ordem)

  const contactNameById = new Map<string, string>(
    (contactsRes.data as ContactRow[]).map(
      (r) => [r.id, mapContact(r).nome] as const,
    ),
  )
  const profileNameById = new Map<string, string>(
    (profilesRes.data as ProfileRow[]).map(
      (r) => [r.id, mapProfile(r).nome] as const,
    ),
  )

  const leads: BoardLead[] = (leadsRes.data as LeadRow[])
    .map(mapLead)
    .sort((a, b) => a.posicao - b.posicao)
    .map((lead) => ({
      ...lead,
      contatoNome: contactNameById.get(lead.contactId) ?? 'Contato removido',
      responsavelNome: profileNameById.get(lead.assignedTo) ?? 'Sem responsável',
    }))

  return { stages, leads }
}

/** Move um lead para outra etapa e ajusta status/fechadoEm no servidor. */
export async function moveLead(leadId: string, toStageId: string): Promise<Lead> {
  const { data: stage, error: stageError } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('id', toStageId)
    .single()
  if (stageError) throw stageError
  const stageRow = stage as PipelineStageRow

  const nowIso = new Date().toISOString()
  const { status, fechadoEm } = resolveStatus(
    stageRow.is_ganho,
    stageRow.is_perdido,
    nowIso,
  )

  const { data, error } = await supabase
    .from('leads')
    .update({
      stage_id: toStageId,
      status,
      fechado_em: fechadoEm,
      atualizado_em: nowIso,
    })
    .eq('id', leadId)
    .select()
    .single()
  if (error) throw error
  return mapLead(data as LeadRow)
}

/** Cria um lead. Corretor é forçado a si mesmo; gestor/admin escolhem. */
export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const user = getCurrentUser()

  const { data: stage, error: stageError } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('id', input.stageId)
    .single()
  if (stageError) throw stageError
  const stageRow = stage as PipelineStageRow

  const nowIso = new Date().toISOString()
  const assignedTo = canSeeAllOrg(user) ? input.assignedTo : user.id

  const { data: stageLeads, error: posError } = await supabase
    .from('leads')
    .select('posicao')
    .eq('stage_id', input.stageId)
  if (posError) throw posError
  const maxPos = (stageLeads as { posicao: number }[]).reduce(
    (max, l) => Math.max(max, l.posicao),
    0,
  )

  const { status, fechadoEm } = resolveStatus(
    stageRow.is_ganho,
    stageRow.is_perdido,
    nowIso,
  )

  const { data, error } = await supabase
    .from('leads')
    .insert({
      organization_id: user.organizationId,
      contact_id: input.contactId,
      stage_id: input.stageId,
      titulo: input.titulo,
      valor_estimado: input.valorEstimado,
      assigned_to: assignedTo,
      status,
      posicao: maxPos + 1,
      criado_em: nowIso,
      atualizado_em: nowIso,
      fechado_em: fechadoEm,
    })
    .select()
    .single()
  if (error) throw error
  return mapLead(data as LeadRow)
}

/** Detalhe de um lead (escopado pela RLS). Retorna null se não visível/inexistente. */
export async function getLeadById(id: string): Promise<LeadDetail | null> {
  const { data: leadRow, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!leadRow) return null

  const lead = mapLead(leadRow as LeadRow)

  const [contactRes, profileRes, stageRes] = await Promise.all([
    supabase.from('contacts').select('*').eq('id', lead.contactId).maybeSingle(),
    supabase.from('profiles').select('*').eq('id', lead.assignedTo).maybeSingle(),
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('id', lead.stageId)
      .maybeSingle(),
  ])
  if (contactRes.error) throw contactRes.error
  if (profileRes.error) throw profileRes.error
  if (stageRes.error) throw stageRes.error

  const detail: LeadDetail = {
    ...lead,
    contatoNome: contactRes.data
      ? mapContact(contactRes.data as ContactRow).nome
      : 'Contato removido',
    responsavelNome: profileRes.data
      ? mapProfile(profileRes.data as ProfileRow).nome
      : 'Sem responsável',
    stage: stageRes.data ? mapStage(stageRes.data as PipelineStageRow) : null,
  }
  return detail
}

/** Contatos (escopados pela RLS) para o select de criação de lead. */
export async function listContactsForSelect(): Promise<SelectOption[]> {
  const { data, error } = await supabase.from('contacts').select('*')
  if (error) throw error
  return (data as ContactRow[])
    .map(mapContact)
    .map((c) => ({ id: c.id, nome: c.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/** Usuários ativos da organização (RLS escopa por org) para escolher responsável. */
export async function listOrgUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('ativo', true)
  if (error) throw error
  return (data as ProfileRow[]).map(mapProfile)
}
