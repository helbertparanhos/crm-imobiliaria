/**
 * Dispatcher da camada de dados da Dashboard (SPEC §4).
 * Seleciona a implementação (`mock` nas Fases 1-2, `supabase` na Fase 3+) sem
 * mudar a interface consumida pelos hooks/telas. A anotação `typeof mock`
 * garante, em tempo de compilação, que a versão Supabase casa exatamente com o mock.
 */
import { isSupabase } from '@/lib/data-source'

import * as mock from './repo.mock'
import * as supabase from './repo.supabase'

const impl: typeof mock = isSupabase ? supabase : mock

export const getDashboard = impl.getDashboard
