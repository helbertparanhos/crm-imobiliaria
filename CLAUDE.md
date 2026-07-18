# CLAUDE.md — Guia do agente para este repositório

Este arquivo orienta o Claude Code (no Cursor) a trabalhar neste projeto. **Leia antes de agir.**
Documentos de referência: `docs/PRD.md` (o quê/por quê) e `docs/SPEC.md` (como, modelo de dados e RLS).

---

## Visão
CRM interno para uma imobiliária, multilogin, com 5 telas (Dashboard, Contatos, Pipeline, Tarefas, Configurações) e 3 papéis (Admin, Gestor, Corretor). É um **MVP de validação**: simples e funcional acima de completo.

## Princípios inegociáveis
1. **FRONT PRIMEIRO.** Construa o frontend inteiro com **dados mockados** (Fase 1) antes de qualquer backend. **Não crie tabelas, SQL, RLS ou client Supabase antes da Fase 3.** Se sentir vontade de "já deixar o banco pronto", pare — não é a hora.
2. **Simplicidade.** Prefira a solução óbvia. Sem abstrações especulativas, sem libs a mais. É um MVP para testar.
3. **Segurança por papel mora no banco (RLS), não no front.** O front esconde botões/telas por UX; a garantia real vem da RLS (Fase 3). Nunca trate filtro de front como segurança.
4. **pt-BR** em toda a interface e nos textos ao usuário.
5. **Camada de dados abstrata.** Componentes falam só com hooks → `repo.ts`. Trocar mock por Supabase não pode exigir mexer em componente.
6. **Peça confirmação antes de operações destrutivas ou irreversíveis** (migrations que dropam, deploy, mudança de DNS, alteração de dados em produção).

## Stack (ver SPEC §2)
Vite + React 18 + TypeScript (strict) · Tailwind + shadcn/ui · React Router · TanStack Query · Zustand · react-hook-form + zod · lucide-react · Recharts (dashboard) · @dnd-kit (kanban) · date-fns. Backend só na Fase 3: Supabase.

## Estrutura (ver SPEC §3)
- `src/app/` bootstrap (providers, router, layout/shell + navegação).
- `src/features/<area>/` uma pasta por tela, autocontida: `components/ · hooks/ · types.ts · repo.ts · index.tsx`.
- `src/components/ui` (shadcn) · `src/components/shared` (domínio reutilizável).
- `src/lib/` → `supabase/` (Fase 3), `auth/` (Fase 2), `permissions/` (regras de papel no front), `utils.ts`, `constants.ts`.
- `src/mocks/` fixtures da Fase 1 · `src/types/` tipos de entidade.
- `supabase/migrations/` SQL versionado (Fase 3, gerado por você).

**Regra:** não importe componente interno de uma feature dentro de outra. O compartilhável sobe para `components/shared`.

## Convenções de código
- TypeScript `strict`. Sem `any` implícito. Tipos de entidade em `src/types`.
- Componentes funcionais + hooks. Um componente por arquivo quando fizer sentido.
- Nomes em inglês no código (variáveis/arquivos), textos de UI em pt-BR.
- Validação de formulário com zod. Datas com date-fns.
- Sem estado global desnecessário — Zustand só para sessão/UI.
- Acessibilidade básica (labels, foco, navegação por teclado no kanban via dnd-kit).

## Camada de dados (o núcleo do "front primeiro")
- Cada feature tem `repo.ts` com funções assíncronas tipadas.
- Componentes → hooks (TanStack Query) → `repo.ts`.
- `VITE_DATA_SOURCE` decide `mock` (Fase 1) ou `supabase` (Fase 3). A assinatura do `repo` é a mesma nos dois.
- Na Fase 1, `repo` lê de `src/mocks`. Na Fase 3, passa a chamar Supabase **sem** alterar componentes.

## Papéis e permissões (ver PRD §3 / SPEC §7)
| Papel | Vê | Faz |
|---|---|---|
| Admin | tudo | configura qualquer coisa; gere contas/usuários/papéis; configs críticas |
| Gestor | tudo da sua organização | CRUD operacional; configura campos/etapas; gere usuários da conta |
| Corretor | só o que é dele (`owner_id`/`assigned_to = auth.uid()`) | CRUD do que é dele; sem configs críticas |

No front (Fase 2), `lib/permissions` centraliza "quem pode ver/fazer o quê" para esconder UI. **Isso não substitui a RLS.**

## Regras para o backend e a RLS (Fase 3) — CRÍTICO
Ao gerar migrations e policies (ver SPEC §7 na íntegra):
- Habilite **RLS em todas** as tabelas de negócio. **Deny-by-default.** Nunca `USING (true)` em tabela sensível.
- Toda tabela tem `organization_id`; toda policy isola por organização.
- Crie helpers `SECURITY DEFINER`/`STABLE`/`search_path` fixo: `auth_org_id()`, `auth_role()`, `is_admin()`, `is_gestor()`, `is_corretor()` — e use-os nas policies (evita recursão de RLS).
- **Policies separadas por operação** (SELECT/INSERT/UPDATE/DELETE), com `WITH CHECK` em toda escrita.
- Corretor: só linhas próprias. Gestor: toda a org. Admin: opção A do SPEC (super-gestor da conta) por padrão.
- Ninguém altera o próprio papel nem `organization_id`.
- Rode o checklist SPEC §7.6 e o *security advisor* do Supabase antes de fechar a fase.

## Uso dos MCPs (`.cursor/mcp.json`)
- **Supabase**: começa em `--read-only`. Para aplicar migrations na Fase 3, remova o `--read-only` (ou use branch de dev do Supabase) **temporariamente e com confirmação**, aplique via migration versionada e volte a read-only. Nunca rode SQL destrutivo sem confirmar.
- **GitHub**: commits pequenos e descritivos; branch de feature + PR para `main`. Não force-push em `main`.
- **Cloudflare**: só na Fase 5, para DNS. Confirme antes de alterar registros.
- **EasyPanel**: só na Fase 5, para criar/deployar o app a partir do GitHub. Confirme antes de deployar.
- **n8n**: Fase 4, para workflows. Segredos ficam no n8n, nunca no front.
- **Segredos**: nunca commite `.env`. Nunca coloque `service_role` no front. Use `${VARS}` do ambiente.

## Definition of Done (por fase — ver SPEC §10)
- **Fase 0:** app sobe, navega as 5 rotas, MCPs conectam.
- **Fase 1:** 5 telas funcionais com mock; 3 visões por papel corretas na UI.
- **Fase 2:** login real + guards por papel.
- **Fase 3:** RLS com checklist §7.6 verde; dados reais; 3 papéis testados.
- **Fase 4:** lead externo entra pelo n8n sem vazar segredo.
- **Fase 5:** app no domínio, HTTPS, RLS revisada, sem segredos no bundle.

## O que NÃO fazer
- ❌ Adiantar o backend/SQL antes da Fase 3.
- ❌ Tratar filtro de front como segurança.
- ❌ `USING (true)` ou RLS desligada em tabela com dado.
- ❌ Colocar `service_role` no client.
- ❌ Commitar segredos.
- ❌ Inchar o escopo com features fora do PRD sem combinar antes.
- ❌ Refatorar componente só para plugar o Supabase (a camada de dados existe justamente para evitar isso).

## Fluxo de trabalho sugerido a cada tarefa
1. Confirme em que **Fase** estamos e o objetivo.
2. Releia a seção relevante do `SPEC.md`.
3. Faça a menor mudança que atende ao critério de aceite.
4. Rode/valide localmente.
5. Commit descritivo. PR quando fizer sentido.
