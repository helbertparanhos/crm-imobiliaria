/**
 * API pública de autenticação (Fase 2).
 * `useCurrentUser`/`getCurrentUser` mantêm a MESMA assinatura da Fase 1 (retornam
 * um Profile), então os componentes/repos não mudam além do caminho de import.
 * São chamados apenas dentro de rotas autenticadas (RequireAuth garante o perfil).
 */
import type { Profile } from '@/types'
import { useAuthStore } from './store'

export { initAuth, signIn, signOut, useAuthStore } from './store'
export type { AuthStatus } from './store'

export function useCurrentUser(): Profile {
  const profile = useAuthStore((s) => s.profile)
  if (!profile) {
    throw new Error('useCurrentUser chamado fora de uma sessão autenticada.')
  }
  return profile
}

export function getCurrentUser(): Profile {
  const profile = useAuthStore.getState().profile
  if (!profile) {
    throw new Error('getCurrentUser chamado fora de uma sessão autenticada.')
  }
  return profile
}

export function useAuthStatus() {
  return useAuthStore((s) => s.status)
}
