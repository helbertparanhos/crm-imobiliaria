/**
 * Dispatcher da camada de dados da feature Pipeline (SPEC §4).
 * Seleciona a implementação (mock nas Fases 1-2, Supabase na Fase 3+) conforme
 * `VITE_DATA_SOURCE`. Os componentes/hooks importam SEMPRE deste arquivo, nunca
 * das implementações concretas. A anotação `const impl: typeof mock` casa as
 * duas interfaces em compile-time: se `repo.supabase.ts` divergir do mock, o
 * TypeScript falha aqui.
 */
import { isSupabase } from '@/lib/data-source'

import * as mock from './repo.mock'
import * as supabase from './repo.supabase'

const impl: typeof mock = isSupabase ? supabase : mock

export const getBoard = impl.getBoard
export const moveLead = impl.moveLead
export const createLead = impl.createLead
export const getLeadById = impl.getLeadById
export const listContactsForSelect = impl.listContactsForSelect
export const listOrgUsers = impl.listOrgUsers
