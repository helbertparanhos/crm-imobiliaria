/**
 * Sessão de DESENVOLVIMENTO da Fase 1 (SPEC §10).
 * Simula o usuário logado com um seletor admin/gestor/corretor para validar as
 * visões por papel na UI. Na Fase 2 isso é substituído pela Supabase Auth real
 * (lib/auth) — os componentes continuam lendo `useCurrentUser()` sem mudar.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { profiles, USERS } from '@/mocks/db'
import type { Profile } from '@/types'

/** Usuários disponíveis para troca no seletor de dev. */
export const availableUsers: Profile[] = profiles

interface SessionState {
  currentUserId: string
  setCurrentUserId: (id: string) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUserId: USERS.gestor,
      setCurrentUserId: (id) => set({ currentUserId: id }),
    }),
    { name: 'crm-dev-user' },
  ),
)

function resolveUser(id: string): Profile {
  return profiles.find((p) => p.id === id) ?? profiles[0]
}

/** Hook: usuário logado atual (reativo). */
export function useCurrentUser(): Profile {
  const id = useSessionStore((s) => s.currentUserId)
  return resolveUser(id)
}

/** Leitura fora de componentes (usada pelos repo.ts para aplicar o escopo por papel). */
export function getCurrentUser(): Profile {
  return resolveUser(useSessionStore.getState().currentUserId)
}
