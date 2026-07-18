# supabase/ — backend (a partir da Fase 3)

Vazio de propósito até a Fase 3. Nesta fase, o Cursor gera em `migrations/`:
tabelas, relações, índices, funções helper e TODAS as policies RLS (ver `docs/SPEC.md` §7).

Regras:
- Toda mudança de schema é uma migration versionada (nada de alterar direto no Studio sem migrar).
- Rodar o checklist de RLS (SPEC §7.6) e o security advisor antes de fechar a fase.
- `service_role` nunca sai daqui para o frontend.
