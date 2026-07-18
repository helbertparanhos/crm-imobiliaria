# CRM Imobiliária

CRM interno para imobiliária — multilogin, 5 telas (Dashboard, Contatos, Pipeline, Tarefas, Configurações) e 3 papéis (Admin, Gestor, Corretor). MVP de validação: **simples e funcional**.

## Documentação (leia nesta ordem)
1. `docs/PRD.md` — requisitos de produto (o quê / por quê).
2. `docs/SPEC.md` — especificação técnica (como), modelo de dados e **estratégia RLS**.
3. `CLAUDE.md` — guia para o agente (Claude Code no Cursor).

## Abordagem: FRONT PRIMEIRO
Constrói-se todo o frontend com **dados mockados** e só nas fases finais entram backend, Supabase e RLS:

- **Fase 0** Setup · **Fase 1** Frontend (mock) · **Fase 2** Auth/multilogin · **Fase 3** Backend + RLS · **Fase 4** n8n · **Fase 5** Deploy + domínio.

Critérios de aceite de cada fase no `SPEC.md` §10.

## Stack
Vite + React + TypeScript · Tailwind + shadcn/ui · TanStack Query · Zustand · Supabase (Fase 3) · n8n · EasyPanel · Cloudflare.

## Setup dos MCPs (Cursor)
1. Copie `.env.example` para `.env` e preencha os tokens (Supabase, GitHub, EasyPanel, n8n).
2. O `.cursor/mcp.json` já referencia essas variáveis. Reinicie o Cursor e verifique os MCPs conectados.
3. Cloudflare autentica por OAuth no primeiro uso (sem token no `.env`).

> O scaffold (package.json, vite/tsconfig/tailwind config, código) é gerado na **Fase 0** pelo Cursor — não vem neste pacote de planejamento.

## Segurança (resumo)
- RLS em todas as tabelas, deny-by-default, isolamento por organização, visibilidade por papel (SPEC §7).
- `service_role` **nunca** no frontend. Segredos nunca no repositório.
