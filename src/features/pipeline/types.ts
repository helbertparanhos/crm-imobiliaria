/**
 * Tipos locais da feature Pipeline (SPEC §4).
 * Filtros, valores de formulário e formas enriquecidas usadas só nesta tela.
 */
import type { Lead, PipelineStage } from '@/types'

/** Lead enriquecido para o card do funil (nomes já resolvidos). */
export interface BoardLead extends Lead {
  contatoNome: string
  responsavelNome: string
}

/** Payload do quadro kanban: etapas ordenadas + leads escopados. */
export interface BoardData {
  stages: PipelineStage[]
  leads: BoardLead[]
}

/** Detalhe do lead para o dialog de leitura. */
export interface LeadDetail extends BoardLead {
  stage: PipelineStage | null
}

/** Opção genérica {id, nome} para selects. */
export interface SelectOption {
  id: string
  nome: string
}

/** Entrada de criação de lead (camada repo). */
export interface CreateLeadInput {
  contactId: string
  titulo: string
  valorEstimado: number
  stageId: string
  assignedTo: string
}

/** Variáveis da mutation de mover lead. */
export interface MoveLeadVars {
  leadId: string
  toStageId: string
}

/** Valores do formulário de novo lead (react-hook-form). */
export interface NewLeadFormValues {
  contactId: string
  titulo: string
  valorEstimado: number
  stageId: string
  assignedTo: string
}
