-- ============================================================================
-- Fase 3 — Esquema base do CRM Imobiliária (SPEC §5)
-- Multi-tenant: TODA tabela de negócio tem organization_id (âncora da RLS).
-- RLS é habilitada aqui (deny-by-default); as policies vêm na migration seguinte.
-- ============================================================================

-- Tipos ----------------------------------------------------------------------
create type user_role as enum ('admin', 'gestor', 'corretor');

-- Organização ----------------------------------------------------------------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

-- Perfis (espelham auth.users 1:1; guardam papel + organização) --------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references organizations (id) on delete cascade,
  nome text not null,
  email text not null,
  papel user_role not null default 'corretor',
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Etapas do funil ------------------------------------------------------------
create table pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  nome text not null,
  ordem int not null default 0,
  cor text not null default '#64748b',
  is_ganho boolean not null default false,
  is_perdido boolean not null default false
);

-- Definições de campos personalizados ----------------------------------------
create table custom_field_defs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  entidade text not null default 'contact' check (entidade in ('contact')),
  chave text not null,
  label text not null,
  tipo text not null check (tipo in ('text', 'number', 'select', 'date', 'bool')),
  opcoes jsonb,
  ordem int not null default 0
);

-- Contatos -------------------------------------------------------------------
create table contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  nome text not null,
  telefone text not null default '',
  email text not null default '',
  origem text not null default 'outro'
    check (origem in ('site', 'indicacao', 'portal', 'whatsapp', 'telefone', 'outro')),
  tags jsonb not null default '[]'::jsonb,
  campos_customizados jsonb not null default '{}'::jsonb,
  owner_id uuid not null references profiles (id),
  criado_por uuid references profiles (id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Leads (cards do funil) -----------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  stage_id uuid not null references pipeline_stages (id),
  titulo text not null,
  valor_estimado numeric not null default 0,
  assigned_to uuid not null references profiles (id),
  status text not null default 'aberto' check (status in ('aberto', 'ganho', 'perdido')),
  posicao int not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  fechado_em timestamptz
);

-- Tarefas --------------------------------------------------------------------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  lead_id uuid references leads (id) on delete set null,
  titulo text not null,
  descricao text not null default '',
  prioridade text not null default 'media' check (prioridade in ('baixa', 'media', 'alta')),
  status text not null default 'pendente' check (status in ('pendente', 'concluida')),
  due_date timestamptz,
  assigned_to uuid not null references profiles (id),
  criado_por uuid references profiles (id),
  criado_em timestamptz not null default now(),
  concluida_em timestamptz
);

-- Atividades (log opcional p/ dashboard/timeline) ----------------------------
create table activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  contact_id uuid references contacts (id) on delete cascade,
  lead_id uuid references leads (id) on delete cascade,
  tipo text not null,
  payload jsonb not null default '{}'::jsonb,
  ator uuid references profiles (id),
  criado_em timestamptz not null default now()
);

-- Índices (SPEC §5) ----------------------------------------------------------
create index idx_profiles_org on profiles (organization_id);
create index idx_contacts_org on contacts (organization_id);
create index idx_contacts_owner on contacts (owner_id);
create index idx_leads_org on leads (organization_id);
create index idx_leads_assigned on leads (assigned_to);
create index idx_leads_stage on leads (stage_id);
create index idx_leads_contact on leads (contact_id);
create index idx_tasks_org on tasks (organization_id);
create index idx_tasks_assigned on tasks (assigned_to);
create index idx_tasks_contact on tasks (contact_id);
create index idx_tasks_due_status on tasks (due_date, status);
create index idx_cfd_org on custom_field_defs (organization_id);
create index idx_stages_org on pipeline_stages (organization_id);
create index idx_activities_org on activities (organization_id);

-- RLS: habilitada em TODAS as tabelas (deny-by-default; policies na próxima migration)
alter table organizations     enable row level security;
alter table profiles          enable row level security;
alter table pipeline_stages   enable row level security;
alter table custom_field_defs enable row level security;
alter table contacts          enable row level security;
alter table leads             enable row level security;
alter table tasks             enable row level security;
alter table activities        enable row level security;

-- Privilégios de tabela para o role autenticado (as LINHAS ainda são governadas pela RLS).
-- A service_role continua fora do front (SPEC §7.1) — nada aqui a expõe.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
