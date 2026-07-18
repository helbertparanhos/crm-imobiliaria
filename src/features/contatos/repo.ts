/**
 * Camada de dados da feature Contatos — DISPATCHER (SPEC §4).
 * Seleciona a implementação (mock em memória ou Supabase) conforme
 * VITE_DATA_SOURCE, mantendo a MESMA interface para hooks/componentes.
 * `const impl: typeof mock` garante em compile-time que repo.supabase.ts
 * casa exatamente com a interface do repo.mock.ts.
 */
import { isSupabase } from '@/lib/data-source'

import * as mock from './repo.mock'
import * as supabase from './repo.supabase'

export type { ContactRelations } from './repo.mock'

const impl: typeof mock = isSupabase ? supabase : mock

export const listContacts = impl.listContacts
export const getContactById = impl.getContactById
export const createContact = impl.createContact
export const updateContact = impl.updateContact
export const deleteContact = impl.deleteContact
export const listStages = impl.listStages
export const listOrgUsers = impl.listOrgUsers
export const listCustomFieldDefs = impl.listCustomFieldDefs
export const getContactRelations = impl.getContactRelations
export const getCurrentStageForContact = impl.getCurrentStageForContact
export const listCurrentStages = impl.listCurrentStages
