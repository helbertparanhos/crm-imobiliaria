/**
 * Estado de sessão (Fase 2). Guarda a sessão do Supabase Auth + o perfil resolvido
 * (papel/organização). Os componentes leem via useCurrentUser (barrel index.ts).
 */
import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { resolveProfileByEmail } from './profile-bridge'

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'no-profile'

interface AuthState {
  status: AuthStatus
  session: Session | null
  profile: Profile | null
  applySession: (session: Session | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  profile: null,
  applySession: (session) => {
    if (!session) {
      set({ status: 'unauthenticated', session: null, profile: null })
      return
    }
    const profile = resolveProfileByEmail(session.user.email)
    if (!profile) {
      // Autenticou, mas o e-mail não tem perfil no CRM (ver profile-bridge / Fase 3).
      set({ status: 'no-profile', session, profile: null })
      return
    }
    set({ status: 'authenticated', session, profile })
  },
}))

let initialized = false

/** Inicializa a sessão e assina mudanças de auth. Idempotente (StrictMode-safe). */
export function initAuth(): void {
  if (initialized) return
  initialized = true

  void supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState().applySession(data.session)
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().applySession(session)
  })
}

/** Login por e-mail/senha. Lança o erro do Supabase (tratado na tela de login). */
export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
