/**
 * Cliente Supabase (browser) — Fase 2 usa só a AUTH.
 * Usa apenas a URL do projeto + a ANON/publishable key (PÚBLICAS, protegidas por RLS).
 * NUNCA a service_role no front (SPEC §7.1). A camada de DADOS só passa a usar este
 * client na Fase 3; até lá os repositórios continuam no mock.
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY ausentes no .env — o login não vai funcionar até configurá-las.',
  )
}

/** Fallbacks só para não quebrar o carregamento do módulo quando o .env não está configurado. */
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
