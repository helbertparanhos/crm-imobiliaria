/**
 * Dispatcher da camada de dados de Configurações (SPEC §4).
 * Escolhe a implementação (mock ou Supabase) conforme VITE_DATA_SOURCE.
 * A anotação `const impl: typeof mock` garante, em compile-time, que o repo
 * Supabase implementa exatamente a mesma interface do mock.
 */
import { isSupabase } from '@/lib/data-source'

import * as mock from './repo.mock'
import * as supabase from './repo.supabase'

export type {
  CreateUserInput,
  UpdateUserPatch,
  CustomFieldInput,
  StageInput,
  ReorderDirection,
} from './repo.mock'

const impl: typeof mock = isSupabase ? supabase : mock

// Organização
export const getOrg = impl.getOrg
export const updateOrg = impl.updateOrg

// Usuários & papéis
export const listUsers = impl.listUsers
export const createUser = impl.createUser
export const updateUser = impl.updateUser

// Campos personalizados
export const listCustomFieldDefs = impl.listCustomFieldDefs
export const createCustomFieldDef = impl.createCustomFieldDef
export const updateCustomFieldDef = impl.updateCustomFieldDef
export const deleteCustomFieldDef = impl.deleteCustomFieldDef

// Etapas do funil
export const listStages = impl.listStages
export const createStage = impl.createStage
export const updateStage = impl.updateStage
export const reorderStage = impl.reorderStage
export const deleteStage = impl.deleteStage
