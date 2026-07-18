# PRD — CRM Imobiliária (MVP)

> **Documento de Requisitos de Produto.** Descreve *o quê* e *por quê*. O *como* técnico está no `SPEC.md`.
> Versão: 0.1 (MVP de validação) · Idioma do produto: pt-BR

---

## 1. Visão e problema

Imobiliárias trabalham com captadores e gestores que precisam registrar contatos, acompanhar negociações por etapa e não perder follow-ups. Hoje isso vive em planilhas e no WhatsApp: sem visão de funil, sem controle de quem fala com quem, sem métricas.

O objetivo do MVP é entregar um **CRM interno, simples e funcional**, usado pela equipe da imobiliária (multilogin), com o essencial: contatos, funil (pipeline), tarefas e um painel de métricas — com **controle de acesso por papel** para que cada corretor veja só o que é dele e o gestor veja tudo.

**Este MVP é para validar o fluxo.** Prioriza-se clareza e velocidade de teste, não completude de features.

## 2. Objetivos do MVP

- Centralizar contatos com campos personalizáveis, busca e filtro.
- Visualizar e movimentar leads em um funil kanban.
- Criar tarefas vinculadas a contatos, com prioridade e prazo.
- Ver um dashboard com métricas de leads e etapas.
- Suportar múltiplos usuários com papéis (Admin, Gestor, Corretor) e visibilidade correta por papel.

### Fora de escopo (agora)
- Integração com portais (ZAP, Viva Real), assinatura de contratos, financeiro/comissões, app mobile nativo, e-mail marketing, chat embutido. Podem entrar depois.

## 3. Personas e papéis

| Papel | Quem é | O que enxerga | O que pode fazer |
|---|---|---|---|
| **Admin** | Dono do software (Strat) | Tudo, cross-conta | Configurar e alterar qualquer coisa, gerir contas/usuários/papéis, configs críticas |
| **Gestor** | Dono da conta na imobiliária | **Todos** os leads/contatos/tarefas da sua organização | CRUD total no operacional; configura campos e etapas; gere usuários da própria conta (sem tocar em configs de Admin) |
| **Corretor** | Captador/corretor | **Apenas** os leads/contatos/tarefas atribuídos a ele | CRUD no que é dele; não vê o funil dos outros; não mexe em config crítica |

**Regra de ouro de acesso:** Corretor nunca vê dado de outro corretor. Gestor vê tudo da conta. Admin vê tudo. Essa regra é garantida no **banco (RLS)**, não só no front — ver `SPEC.md`.

## 4. Telas e requisitos funcionais

### 4.1 Dashboard
Agrega dados e métricas do CRM (leads e etapas).
- Cards de números: total de contatos, leads abertos, leads ganhos/perdidos no período, tarefas pendentes/atrasadas.
- Gráfico de leads por etapa do funil (distribuição atual).
- Gráfico de evolução (leads criados vs. ganhos ao longo do tempo).
- Filtro por período.
- **Respeita o papel:** Corretor vê métricas só da sua carteira; Gestor/Admin veem da conta toda.

### 4.2 Contatos
Lista central de todos os contatos.
- Tabela com colunas (nome, telefone, e-mail, origem, responsável, etapa atual, tags).
- **Campos personalizáveis:** o Gestor/Admin define campos extras (texto, número, seleção, data, sim/não) que aparecem no contato.
- Busca por texto e filtros (por responsável, origem, tag, campo customizado).
- Ordenação por coluna.
- Detalhe do contato (drawer/painel): dados, campos customizados, leads e tarefas vinculadas, histórico.
- CRUD de contato. Corretor só vê/edita os seus.

### 4.3 Pipeline
O funil em si — colunas (etapas) e cards de leads.
- Colunas = etapas configuráveis (ex.: Novo → Contato feito → Visita → Proposta → Fechado/Perdido).
- Cards de lead com resumo (nome do contato, valor estimado, responsável, etiqueta).
- Arrastar-e-soltar o card entre etapas (muda a etapa do lead).
- Abrir o card leva ao detalhe do contato/lead.
- Criar lead a partir de um contato.
- **Visibilidade por papel:** Corretor vê só cards atribuídos a ele; Gestor/Admin veem todos.

### 4.4 Tarefas
Lista + timeline de prioridades. Toda tarefa é criada e **vinculada a um contato**.
- Criar tarefa vinculada a um contato (e opcionalmente a um lead).
- Campos: título, descrição, prioridade (baixa/média/alta), prazo, responsável, status (pendente/concluída).
- Visão em **lista** (com filtros: minhas, atrasadas, hoje, próximas) e visão em **timeline** ordenada por prioridade/prazo.
- Marcar como concluída.
- Corretor vê as tarefas atribuídas a ele; Gestor/Admin veem as da conta.

### 4.5 Configurações
Conta + usuário + o que for necessário.
- **Conta:** dados da organização/imobiliária. (Admin; Gestor limitado.)
- **Usuário:** perfil, senha, preferências do próprio usuário. (Todos, para si.)
- **Usuários & papéis:** convidar/gerir usuários e definir papel (Gestor/Corretor). (Admin, e Gestor dentro da sua conta.)
- **Campos personalizados:** criar/editar campos de contato. (Admin/Gestor.)
- **Etapas do funil:** criar/reordenar/renomear etapas. (Admin/Gestor.)
- **Configs críticas** (billing, chaves, cross-conta): **somente Admin**.

## 5. Requisitos não-funcionais

- **Simplicidade acima de tudo** — é um MVP de validação.
- **Segurança de dados por papel garantida no banco (RLS).** O front nunca é a única linha de defesa.
- **Multilogin** com sessões independentes por usuário.
- Responsivo (uso majoritário em desktop; tolerável em tablet/mobile).
- Idioma pt-BR em toda a interface.
- Performance suficiente para dezenas de milhares de contatos por conta (não é requisito de escala massiva no MVP).

## 6. Estratégia de entrega — FRONT PRIMEIRO

> **Decisão de produto:** construir o **frontend inteiro com dados falsos (mock) primeiro**, validar telas e fluxo, e só nas **fases finais** entrar backend, banco e RLS. Detalhamento técnico e critérios de aceite por fase no `SPEC.md`.

- **Fase 0** — Setup do projeto (esqueleto, layout, navegação, MCPs).
- **Fase 1** — Frontend completo com **dados mockados** (foco principal do início). Todas as 5 telas navegáveis e funcionais visualmente.
- **Fase 2** — Autenticação e multilogin (login por papel, proteção de rotas).
- **Fase 3** — Backend: modelagem no Supabase + **RLS** + troca de mock por dados reais.
- **Fase 4** — Integrações externas (n8n).
- **Fase 5** — Deploy (GitHub → EasyPanel) + domínio (Cloudflare).

## 7. Métricas de sucesso do MVP
- A equipe consegue cadastrar contatos, mover leads no funil e criar tarefas sem treino formal.
- Cada papel enxerga exatamente o que deveria (validado com 1 admin, 1 gestor, 2 corretores).
- Zero vazamento entre carteiras de corretores (teste explícito de RLS na Fase 3).

## 8. Riscos e mitigação
- **RLS mal configurada = vazamento de dados.** Mitigação: deny-by-default, testes com os 3 papéis, checklist no `SPEC.md`.
- **Escopo inchar.** Mitigação: manter o fora-de-escopo travado; novas ideias viram backlog.
- **Acoplar o front ao Supabase cedo demais.** Mitigação: camada de dados abstrata (repositório/hooks) — mock e Supabase atrás da mesma interface.
