/**
 * PONTE TEMPORÁRIA DA FASE 2.
 * A autenticação já é real (Supabase Auth), mas a tabela `profiles` só nasce na
 * Fase 3. Até lá, resolvemos o papel/organização do usuário logado mapeando o
 * e-mail autenticado para um perfil do mock. Na Fase 3, isto vira uma consulta a
 * `profiles` protegida por RLS — e este arquivo é removido.
 */
import { profiles } from '@/mocks/db'
import type { Profile } from '@/types'

export function resolveProfileByEmail(email: string | undefined): Profile | null {
  if (!email) return null
  const normalized = email.trim().toLowerCase()
  return profiles.find((p) => p.email.toLowerCase() === normalized) ?? null
}
