/** Tipos locais da feature Contatos (filtros e valores de formulário). */
import type { ContactOrigin } from '@/types'

/** Sentinela usada nos selects de filtro para "todos". */
export const ALL = 'all' as const

/** Valor de custom field (espelha `Contact.camposCustomizados`). */
export type CustomFieldValue = string | number | boolean | null

/** Filtros aplicados na listagem de contatos. */
export interface ContactFilters {
  /** Busca por nome, e-mail ou telefone. */
  search: string
  /** Id do responsável ou `'all'` (apenas admin/gestor filtram por isso). */
  ownerId: string
  /** Origem ou `'all'`. */
  origem: ContactOrigin | typeof ALL
  /** Tag ou `'all'`. */
  tag: string
}

/** Entrada para criar/atualizar um contato (montada pelo formulário). */
export interface ContactInput {
  nome: string
  telefone: string
  email: string
  origem: ContactOrigin
  tags: string[]
  ownerId: string
  camposCustomizados: Record<string, CustomFieldValue>
}

/** Chave/direção de ordenação da tabela. */
export type SortKey = 'nome' | 'criadoEm'
export type SortDir = 'asc' | 'desc'
