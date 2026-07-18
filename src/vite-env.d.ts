/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Fonte de dados: "mock" (Fase 1) ou "supabase" (Fase 3+). Ver SPEC §4. */
  readonly VITE_DATA_SOURCE: 'mock' | 'supabase'
  /** Preenchidas só na Fase 3 (Supabase). */
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
