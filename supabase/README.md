# supabase/ — backend (Fase 3)

Migrations versionadas do CRM. Ordem de aplicação (o prefixo numérico já ordena):

1. `migrations/20260718120000_schema.sql` — tipos, 8 tabelas, índices, **RLS habilitada** (deny-by-default) e grants para `authenticated`.
2. `migrations/20260718120100_rls.sql` — helpers `SECURITY DEFINER` (`auth_org_id`, `auth_role`, `is_admin/is_gestor/is_corretor`, `can_see_all`), **policies por operação** (SELECT/INSERT/UPDATE/DELETE, com `WITH CHECK`) e triggers de invariantes (SPEC §7).
3. `migrations/20260718120200_seed.sql` — organização, **perfis a partir de `auth.users`** (casando por e-mail), etapas, campos personalizados e dados demo da Ana.

## Como aplicar

**Pré-requisito:** criar os usuários no **Authentication → Users** do projeto (ana@/gustavo@/carla@/caio@horizonte.com.br) ANTES do seed — ele lê `auth.users` por e-mail para criar os perfis com o papel certo. Com um só login, basta a `ana@` (admin, vê tudo).

**Opção A — SQL Editor do dashboard (não precisa de MCP):**
1. Dashboard do projeto → **SQL Editor** → New query.
2. Cole e rode o conteúdo dos 3 arquivos **na ordem acima** (um de cada vez).
3. Confira em **Table Editor** que as tabelas apareceram e que **RLS = on** em todas.

**Opção B — Supabase CLI:** `supabase link --project-ref <ref>` e `supabase db push`.

**Opção C — MCP:** `apply_migration` (um por arquivo), quando o MCP tiver acesso ao projeto.

## Depois de aplicar
- Rodar o **checklist de RLS (SPEC §7.6)** e o **security advisor** do Supabase; resolver alertas.
- No app, definir `VITE_DATA_SOURCE=supabase` para trocar o mock pelos dados reais (a camada de dados usa a mesma interface).
- `service_role` **nunca** sai daqui para o frontend (SPEC §7.1).
