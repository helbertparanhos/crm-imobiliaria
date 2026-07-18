/**
 * Carrega o perfil (papel/organização) do usuário logado.
 * - Supabase (Fase 3): consulta a tabela `profiles` por id = auth.uid() (RLS permite ler o próprio).
 * - Mock (Fases 1-2): ponte temporária por e-mail (profile-bridge).
 */
import type { Session } from '@supabase/supabase-js'

import { isSupabase } from '@/lib/data-source'
import { supabase } from '@/lib/supabase/client'
import { mapProfile, type ProfileRow } from '@/lib/supabase/mappers'
import type { Profile } from '@/types'
import { resolveProfileByEmail } from './profile-bridge'

export async function loadProfile(session: Session): Promise<Profile | null> {
  if (!isSupabase) {
    return resolveProfileByEmail(session.user.email)
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()
  if (error || !data) return null
  return mapProfile(data as ProfileRow)
}
