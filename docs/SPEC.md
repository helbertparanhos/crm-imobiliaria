# SPEC — CRM Imobiliária (Especificação Técnica)

> Descreve *como* construir. Pareia com o `PRD.md` (o quê/por quê).
> **Importante:** este documento **não contém código nem SQL**. Ele descreve modelo de dados e políticas de segurança em nível conceitual. O código (scaffold, componentes, migrations, SQL das tabelas e das policies RLS) é gerado pelo Cursor/Claude Code seguindo estas regras.

---

## 1. Arquitetura em uma frase

SPA em **React + Vite + TypeScript** consumindo uma **camada de dados abstrata** que, na Fase 1, aponta para **mocks** e, na Fase 3, para **Supabase** (Postgres + Auth + RLS) — sem trocar os componentes. Integrações externas via **n8n**. Deploy do repositório GitHub via **EasyPanel**; domínio apontado no **Cloudflare**.

```
[React/Vite/TS] → [camada de dados (hooks/repos)] → mock (Fase 1)  ─┐
                                                     Supabase (Fase 3) → Postgres + RLS
                                                                         Supabase Auth (Fase 2)
[n8n] ──webhooks──> Supabase / CRM        (Fase 4)
GitHub → EasyPanel (deploy)  ·  Cloudflare (DNS)   (Fase 5)
```

## 2. Stack e escolhas

| Camada | Escolha | Por quê |
|---|---|---|
| Build/Runtime | Vite + React 18 + TypeScript (strict) | rápido, simples, padrão do time |
| Estilo | Tailwind CSS + shadcn/ui (Radix) | UI consistente sem reinventar componentes |
| Roteamento | React Router | simples, suficiente |
| Dados assíncronos | TanStack Query | cache, loading/erro; mesma interface p/ mock e Supabase |
| Estado global leve | Zustand | sessão/UI sem boilerplate |
| Formulários | react-hook-form + zod | validação tipada |
| Ícones | lucide-react | leve |
| Gráficos (dashboard) | Recharts | simples |
| Kanban (pipeline) | @dnd-kit/core | drag-and-drop acessível |
| Datas | date-fns | leve |
| Backend (Fase 3+) | Supabase (Postgres, Auth, RLS, Storage) | tudo-em-um, RLS nativa |
| Integrações (Fase 4) | n8n (self-host) | webhooks/automação |
| Deploy (Fase 5) | GitHub → EasyPanel | já usado pelo time |
| DNS (Fase 5) | Cloudflare | apontamento de domínio |

> O Cursor faz o scaffold (Fase 0). `package.json`, `vite.config`, `tsconfig`, `tailwind.config` **não** vêm neste pacote de propósito — serão gerados no scaffold.

## 3. Estrutura de pastas

```
crm-imobiliaria/
├── .cursor/mcp.json          # MCPs (Supabase, GitHub, Cloudflare, EasyPanel, n8n)
├── docs/                     # PRD, SPEC, ADRs
├── public/
├── src/
│   ├── app/                  # bootstrap: providers, router, layout (shell + navegação)
│   │   └── layout/
│   ├── components/
│   │   ├── ui/               # componentes shadcn (gerados)
│   │   └── shared/           # componentes de domínio reutilizáveis (tabela, kpi-card, etc.)
│   ├── features/             # UMA pasta por área — isolada e autocontida
│   │   ├── dashboard/
│   │   ├── contatos/
│   │   ├── pipeline/
│   │   ├── tarefas/
│   │   └── configuracoes/
│   │       └── (por feature: components/ · hooks/ · types.ts · repo.ts · index.tsx)
│   ├── lib/
│   │   ├── supabase/         # client Supabase (Fase 3)
│   │   ├── auth/             # sessão + guards de rota (Fase 2)
│   │   ├── permissions/      # regras de papel no front (esconde UI; NÃO é segurança)
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── mocks/                # fixtures da Fase 1 (contatos, leads, tarefas, usuários)
│   ├── types/                # tipos globais das entidades
│   ├── styles/
│   └── main.tsx
├── supabase/
│   └── migrations/           # SQL versionado — gerado pelo Cursor na Fase 3
├── .env.example
├── CLAUDE.md
└── README.md
```

**Regra de organização:** cada `feature/` é autocontida (seus componentes, hooks, tipos e `repo.ts`). Nada de importar componente interno de uma feature em outra — o que for compartilhado sobe para `components/shared`.

## 4. Camada de dados (o pulo do gato do "front primeiro")

Cada feature expõe um `repo.ts` com funções assíncronas (ex.: `listContacts(filters)`, `moveLead(id, stageId)`). Os componentes falam **só** com hooks (TanStack Query) que chamam o `repo`.

- Uma variável `VITE_DATA_SOURCE` (`mock` | `supabase`) decide a implementação por baixo.
- **Fase 1:** `repo` lê de `src/mocks` (arrays em memória; latência simulada opcional).
- **Fase 3:** a mesma assinatura de `repo` passa a chamar o Supabase. Componentes não mudam.

Isso permite construir e validar 100% do front sem backend, e plugar o Supabase depois sem refatorar tela.

## 5. Modelo de dados (conceitual — sem SQL)

Multi-tenant desde já: mesmo com um cliente só agora, toda tabela carrega `organization_id` para permitir mais contas depois e para servir de âncora da RLS.

**Entidades e campos principais:**

- **organizations** — a conta/imobiliária. Campos: id, nome, criado_em.
- **profiles** — espelha `auth.users` (1:1 via id = auth.uid). Campos: id, organization_id, nome, email, papel (`admin` | `gestor` | `corretor`), ativo, criado_em. É aqui que mora o papel do usuário.
- **contacts** — pessoas/contatos. Campos: id, organization_id, nome, telefone, email, origem, tags (lista), campos_customizados (JSON), owner_id (corretor responsável → profiles.id), criado_por, criado_em, atualizado_em.
- **custom_field_defs** — definição dos campos personalizáveis de contato. Campos: id, organization_id, entidade (`contact`), chave, label, tipo (`text`|`number`|`select`|`date`|`bool`), opcoes (JSON, p/ select), ordem. Os valores em si vivem em `contacts.campos_customizados` (JSON) — simples para o MVP.
- **pipeline_stages** — colunas configuráveis do funil. Campos: id, organization_id, nome, ordem, cor, is_ganho, is_perdido.
- **leads** — os cards do funil (negociações). Campos: id, organization_id, contact_id, stage_id, titulo, valor_estimado, assigned_to (corretor → profiles.id), status (`aberto`|`ganho`|`perdido`), posicao (ordenação no board), criado_em, atualizado_em, fechado_em.
- **tasks** — tarefas. Campos: id, organization_id, contact_id (obrigatório), lead_id (opcional), titulo, descricao, prioridade (`baixa`|`media`|`alta`), status (`pendente`|`concluida`), due_date, assigned_to (profiles.id), criado_por, criado_em, concluida_em.
- **activities** *(opcional, ajuda o dashboard/timeline)* — log de eventos. Campos: id, organization_id, contact_id, lead_id, tipo, payload (JSON), ator (profiles.id), criado_em.

**Relações resumidas:** organization 1—N tudo · contact 1—N leads · contact 1—N tasks · lead 1—N tasks (opcional) · profile (corretor) 1—N contacts/leads/tasks via owner_id/assigned_to.

**Índices que o Cursor deve criar (Fase 3):** `organization_id` em todas; `contacts(owner_id)`, `leads(assigned_to)`, `leads(stage_id)`, `tasks(assigned_to)`, `tasks(due_date, status)`. Chaves estrangeiras com integridade referencial.

## 6. Autenticação e papéis (Fase 2 no front, Fase 3 no banco)

- **Supabase Auth** com e-mail/senha. Cada login cria uma sessão (JWT) — o `auth.uid()` é a identidade que a RLS usa.
- Ao autenticar, o app carrega o `profile` (papel + organization_id) e guarda na sessão (Zustand).
- **Guards de rota** no front escondem/mostram telas e botões por papel (`lib/permissions`). Isso é **UX**, não segurança: a segurança real é a RLS.
- Convite de usuário / definição de papel: só Admin (e Gestor dentro da própria conta). Um usuário **nunca** pode alterar o próprio papel.

## 7. Estratégia de segurança — RLS do Supabase (Fase 3)

> Esta é a parte mais crítica. O Cursor deve gerar as policies seguindo **exatamente** estes princípios. Descrição conceitual — o SQL é responsabilidade do Cursor.

### 7.1 Princípios inegociáveis
1. **RLS habilitada em TODAS as tabelas de negócio.** Sem exceção.
2. **Deny-by-default.** Sem policy explícita, nada é acessível. Nunca uma policy `USING (true)` aberta em tabela com dado sensível.
3. **Isolamento por tenant.** Toda policy exige `organization_id = organização-do-usuário-logado`. Nenhuma linha atravessa organizações (exceto Admin, ver 7.4).
4. **Papel decide a visibilidade** e é lido do `profiles` do usuário logado — não confiar em nada vindo do client.
5. **Policies separadas por operação** (SELECT, INSERT, UPDATE, DELETE). Nada de uma policy genérica cobrindo tudo.
6. **`WITH CHECK` em toda escrita** para impedir que o usuário grave linha em outra organização ou atribua a si registros que não deveria.
7. **A `service_role` nunca toca o frontend.** O front usa só a `anon`/publishable key + sessão do usuário. Operações administrativas server-side (se houver) ficam em ambiente protegido (ex.: n8n, Edge Function).

### 7.2 Funções auxiliares (helpers) — evitam recursão de RLS
O Cursor deve criar funções `SECURITY DEFINER`, `STABLE`, com `search_path` fixo, para expor com segurança o contexto do usuário sem disparar RLS recursiva ao ler o próprio `profiles`:
- `auth_org_id()` → organization_id do usuário logado.
- `auth_role()` → papel do usuário logado (`admin`|`gestor`|`corretor`).
- `is_admin()`, `is_gestor()`, `is_corretor()` → atalhos booleanos.

Toda policy usa esses helpers em vez de subconsultas soltas em `profiles`.

### 7.3 Matriz de visibilidade por tabela

| Tabela | Corretor (SELECT) | Gestor (SELECT) | Escrita (INSERT/UPDATE/DELETE) |
|---|---|---|---|
| contacts | só onde `owner_id = auth.uid()` | toda a org | Corretor: só os seus. Gestor: toda a org. Sempre trava `organization_id`. |
| leads | só onde `assigned_to = auth.uid()` | toda a org | idem contacts (por `assigned_to`) |
| tasks | só onde `assigned_to = auth.uid()` | toda a org | idem (por `assigned_to`) |
| activities | só de contatos/leads visíveis a ele | toda a org | criação pelo próprio ator |
| pipeline_stages | leitura: toda a org | toda a org | escrita: só Gestor/Admin |
| custom_field_defs | leitura: toda a org | toda a org | escrita: só Gestor/Admin |
| profiles | o próprio + (Gestor/Admin: os da org) | toda a org | criar/editar/definir papel: só Admin (Gestor limitado à própria conta). Ninguém muda o próprio papel. |
| organizations | a própria org | a própria org | escrita: Admin (Gestor limitado) |

### 7.4 Papel Admin (dono do software)
Admin é o operador do SaaS (Strat). Duas opções — decidir na Fase 3 e registrar como ADR:
- **(A, recomendada para MVP)** Admin também tem `organization_id` e opera como super-gestor daquela conta; acesso cross-conta é feito por ferramenta protegida fora do app (Studio/Edge Function), não por RLS aberta.
- **(B)** Um flag `is_platform_admin` no profile que, nas policies, libera cross-org. Mais poderoso e mais perigoso; só se realmente necessário. Se adotado, blindar muito bem.

Padrão do MVP: **opção A** (menos superfície de risco).

### 7.5 Regras de escrita (WITH CHECK) — exemplos de intenção
- Ao **inserir** contato/lead/tarefa: `organization_id` obrigatoriamente = `auth_org_id()`; se Corretor, `owner_id`/`assigned_to` default = `auth.uid()` e não pode apontar para outra org.
- Ao **atualizar**: não permitir mover registro para outra organização; Corretor não pode reatribuir registro para fora da própria carteira; alteração de papel bloqueada exceto Admin.
- **Deleção**: Corretor só apaga o que é dele; Gestor apaga na org; Admin conforme 7.4.

### 7.6 Checklist de validação da RLS (rodar na Fase 3)
- [ ] RLS ligada em todas as tabelas (nenhuma esquecida).
- [ ] Nenhuma policy `USING (true)` em tabela sensível.
- [ ] Corretor A **não** vê contatos/leads/tarefas do Corretor B (teste explícito com 2 corretores).
- [ ] Gestor vê tudo da própria org e **nada** de outra org (criar org de teste).
- [ ] Corretor **não** consegue alterar o próprio papel nem `organization_id`.
- [ ] INSERT com `organization_id` forjado é rejeitado.
- [ ] `service_role` não aparece em nenhum lugar do bundle do front (grep no build).
- [ ] Rodar o *advisor* de segurança do Supabase e resolver os alertas.

## 8. Integrações externas — n8n (Fase 4)
- Entradas via webhook: novo lead vindo de site/landing/WhatsApp cria `contact` + `lead` na etapa inicial.
- Automação de tarefas/notificações (ex.: lembrete de follow-up).
- Contrato: cada webhook recebe payload validado (zod-like no n8n) e escreve no Supabase por um caminho protegido (service token no n8n — nunca no front).
- Documentar cada workflow e seu payload em `docs/decisions/`.

## 9. Deploy e domínio (Fase 5)
- **GitHub**: repositório único, branch `main` protegida; PRs para mudanças.
- **EasyPanel**: app conectado ao repositório GitHub; build do Vite (site estático servido, ou app Node conforme necessidade). Variáveis de ambiente (`VITE_*`) configuradas no painel.
- **Cloudflare**: apontamento do domínio (registro DNS) para o app do EasyPanel; HTTPS.
- Hardening final: revisar RLS (seção 7.6), remover qualquer segredo do bundle, revisar CORS, logs.

## 10. Fases e critérios de aceite

### Fase 0 — Setup
Scaffold Vite+React+TS+Tailwind+shadcn; layout shell com navegação (Dashboard, Contatos, Pipeline, Tarefas, Configurações); tema; `.cursor/mcp.json` funcionando; repo no GitHub; primeiro deploy vazio opcional.
**Aceite:** app sobe local, navega entre as 5 rotas (telas vazias), MCPs conectam.

### Fase 1 — Frontend com mock *(foco principal do início)*
Todas as 5 telas completas visualmente e interativas com dados de `src/mocks`, atrás da camada de dados. Seletor de usuário de desenvolvimento (admin/gestor/corretor) para validar visões por papel no front.
**Aceite:** dá para cadastrar contato, mover lead no kanban, criar tarefa vinculada a contato, ver dashboard — tudo com mock; as 3 visões por papel se comportam corretamente na UI.

### Fase 2 — Auth e multilogin
Supabase Auth (e-mail/senha), sessão, logout, guards de rota por papel.
**Aceite:** login real; rotas/botões respeitam o papel; sem sessão, redireciona para login.

### Fase 3 — Backend + RLS
Cursor gera migrations: tabelas, relações, índices, helpers e **todas as policies RLS** (seção 7). `repo.ts` passa de mock para Supabase. CRUD real.
**Aceite:** checklist 7.6 100% verde; app funciona com dados reais; 3 papéis testados.

### Fase 4 — Integrações (n8n)
Webhooks de entrada e automações essenciais.
**Aceite:** um lead externo entra no funil via n8n sem passar segredo pelo front.

### Fase 5 — Deploy + domínio
GitHub → EasyPanel; DNS no Cloudflare; HTTPS; hardening.
**Aceite:** app no domínio, HTTPS ok, RLS revisada, sem segredos no bundle.

## 11. Decisões em aberto (virar ADR em `docs/decisions/`)
- Papel Admin: opção A vs. B (seção 7.4).
- Campos customizados: JSON no contato (MVP) vs. tabela de valores dedicada (futuro).
- Servir o Vite como estático no EasyPanel vs. Node/preview.
- Realtime (Supabase Realtime) no kanban: incluir no MVP ou deixar polling?
