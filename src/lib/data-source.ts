/**
 * Fonte de dados ativa (SPEC §4). `mock` (Fases 1-2) ou `supabase` (Fase 3+).
 * A mesma interface de repo.ts serve as duas — só a implementação muda por baixo.
 */
export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'mock'

export const isSupabase = DATA_SOURCE === 'supabase'
