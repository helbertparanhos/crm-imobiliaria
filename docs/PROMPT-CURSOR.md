# Prompt inicial — colar no Claude Code (Cursor)

> Cole isto na primeira mensagem do Cursor, com o repositório aberto. Ele inicia a **Fase 0**.

---

Você é o engenheiro deste projeto. Leia primeiro, nesta ordem, e siga à risca: `CLAUDE.md`, `docs/PRD.md` e `docs/SPEC.md`. Eles definem o produto, a stack, a estrutura de pastas, os papéis, a estratégia de RLS e as fases. Não os contrarie sem me avisar.

**Contexto:** CRM interno para uma imobiliária, multilogin, 5 telas (Dashboard, Contatos, Pipeline, Tarefas, Configurações), 3 papéis (Admin, Gestor, Corretor). É um MVP de validação — simples e funcional.

**Regra número um — FRONT PRIMEIRO:** vamos construir todo o frontend com dados mockados antes de qualquer backend. **Não crie tabelas, SQL, RLS nem client Supabase agora.** Isso é só a partir da Fase 3.

**O que fazer agora (Fase 0 — Setup), e só isso:**
1. Faça o scaffold do projeto na stack do SPEC: Vite + React + TypeScript (strict), Tailwind + shadcn/ui, React Router, TanStack Query, Zustand, react-hook-form + zod, lucide-react, Recharts, @dnd-kit/core, date-fns. Instale as dependências.
2. Crie a estrutura de pastas exatamente como em `docs/SPEC.md` §3 (as pastas já existem com `.gitkeep`/README — preencha o bootstrap).
3. Monte o layout shell: navegação lateral com as 5 telas e roteamento. As telas podem ficar vazias (só o título) nesta fase.
4. Configure o tema base (Tailwind + shadcn) e o pt-BR na UI.
5. Garanta que os MCPs do `.cursor/mcp.json` estão conectados (Supabase em read-only, GitHub, Cloudflare, EasyPanel, n8n). Se algum não conectar, me diga o que falta no `.env`.
6. Inicialize o git, faça o primeiro commit e publique o repositório no GitHub (via MCP), branch `main`.

**Como trabalhar:**
- Antes de codar, me mostre um plano curto da Fase 0 e o que vai instalar. Depois execute.
- Commits pequenos e descritivos.
- Peça confirmação antes de qualquer coisa destrutiva ou de deploy.
- Não avance para a Fase 1 sem eu validar a Fase 0 (app sobe, navega as 5 rotas, MCPs conectam).

Comece me apresentando o plano da Fase 0.
