/**
 * Dispatcher da camada de dados da feature Tarefas (SPEC §4).
 * Seleciona a implementação (mock ou Supabase) conforme VITE_DATA_SOURCE, mantendo
 * a MESMA interface para hooks/componentes. O `typeof mock` garante em tempo de
 * compilação que a implementação Supabase tem exatamente as mesmas assinaturas.
 */
import { isSupabase } from '@/lib/data-source'

import * as mock from './repo.mock'
import * as supabase from './repo.supabase'

const impl: typeof mock = isSupabase ? supabase : mock

export const listTasks = impl.listTasks
export const listContactsForSelect = impl.listContactsForSelect
export const listLeadsByContact = impl.listLeadsByContact
export const listOrgUsers = impl.listOrgUsers
export const createTask = impl.createTask
export const updateTask = impl.updateTask
export const toggleTask = impl.toggleTask
export const deleteTask = impl.deleteTask
