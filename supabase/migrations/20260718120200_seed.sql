-- ============================================================================
-- Fase 3 — Seed inicial (idempotente).
-- Cria a organização, os PERFIS a partir dos usuários já existentes em
-- auth.users (casando por e-mail — assim profiles.id = auth.users.id, exigido
-- pela RLS), as etapas do funil, os campos personalizados e um conjunto de
-- dados demo pertencentes à Ana (admin) para testar com um único login.
-- Rode DEPOIS de criar os usuários no Authentication do Supabase.
-- ============================================================================
do $$
declare
  org  uuid := '00000000-0000-0000-0000-000000000001';
  ana  uuid;
  s_novo uuid; s_contato uuid; s_visita uuid; s_proposta uuid; s_fechado uuid;
  c1 uuid; c2 uuid; c3 uuid; c4 uuid;
begin
  -- Organização -------------------------------------------------------------
  insert into organizations (id, nome) values (org, 'Imobiliária Horizonte')
    on conflict (id) do nothing;

  -- Perfis a partir de auth.users (por e-mail). Papéis conforme o seed da Fase 1.
  insert into profiles (id, organization_id, nome, email, papel)
  select u.id, org, v.nome, u.email, v.papel::user_role
  from (values
    ('ana@horizonte.com.br',     'Ana Admin',       'admin'),
    ('gustavo@horizonte.com.br', 'Gustavo Gestor',  'gestor'),
    ('carla@horizonte.com.br',   'Carla Corretora', 'corretor'),
    ('caio@horizonte.com.br',    'Caio Corretor',   'corretor')
  ) as v (email, nome, papel)
  join auth.users u on lower(u.email) = v.email
  on conflict (id) do nothing;

  -- Etapas do funil (só se ainda não houver) --------------------------------
  if not exists (select 1 from pipeline_stages where organization_id = org) then
    insert into pipeline_stages (organization_id, nome, ordem, cor, is_ganho, is_perdido) values
      (org, 'Novo',          1, '#64748b', false, false),
      (org, 'Contato feito', 2, '#0ea5e9', false, false),
      (org, 'Visita',        3, '#6366f1', false, false),
      (org, 'Proposta',      4, '#f59e0b', false, false),
      (org, 'Fechado',       5, '#22c55e', true,  false),
      (org, 'Perdido',       6, '#ef4444', false, true);
  end if;

  -- Campos personalizados (só se ainda não houver) --------------------------
  if not exists (select 1 from custom_field_defs where organization_id = org) then
    insert into custom_field_defs (organization_id, entidade, chave, label, tipo, opcoes, ordem) values
      (org, 'contact', 'tipo_imovel', 'Tipo de imóvel',    'select', '["Apartamento","Casa","Terreno","Comercial"]'::jsonb, 1),
      (org, 'contact', 'interesse',   'Interesse',         'select', '["Compra","Aluguel"]'::jsonb, 2),
      (org, 'contact', 'orcamento',   'Orçamento (R$)',    'number', null, 3),
      (org, 'contact', 'newsletter',  'Aceita newsletter', 'bool',   null, 4);
  end if;

  -- Dados demo pertencentes à Ana (só se ela existir e ainda não houver contatos)
  select id into ana from profiles where email = 'ana@horizonte.com.br' limit 1;

  if ana is not null and not exists (select 1 from contacts where organization_id = org) then
    select id into s_novo     from pipeline_stages where organization_id = org and ordem = 1;
    select id into s_contato  from pipeline_stages where organization_id = org and ordem = 2;
    select id into s_visita   from pipeline_stages where organization_id = org and ordem = 3;
    select id into s_proposta from pipeline_stages where organization_id = org and ordem = 4;
    select id into s_fechado  from pipeline_stages where organization_id = org and ordem = 5;

    insert into contacts (organization_id, nome, telefone, email, origem, tags, campos_customizados, owner_id, criado_por)
    values
      (org, 'Marcos Almeida',  '(11) 98888-1010', 'marcos.almeida@email.com',  'site',      '["quente"]'::jsonb,     '{"tipo_imovel":"Apartamento","interesse":"Compra","orcamento":650000,"newsletter":true}'::jsonb,  ana, ana),
      (org, 'Fernanda Lima',   '(11) 97777-2020', 'fernanda.lima@email.com',   'indicacao', '["investidor"]'::jsonb, '{"tipo_imovel":"Comercial","interesse":"Compra","orcamento":1200000,"newsletter":false}'::jsonb, ana, ana),
      (org, 'Roberto Souza',   '(11) 96666-3030', 'roberto.souza@email.com',   'portal',    '["morno"]'::jsonb,      '{"tipo_imovel":"Casa","interesse":"Compra","orcamento":850000,"newsletter":true}'::jsonb,        ana, ana),
      (org, 'Juliana Prado',   '(11) 95555-4040', 'juliana.prado@email.com',   'whatsapp',  '["aluguel"]'::jsonb,    '{"tipo_imovel":"Apartamento","interesse":"Aluguel","orcamento":3500,"newsletter":true}'::jsonb,  ana, ana);

    select id into c1 from contacts where organization_id = org and email = 'marcos.almeida@email.com';
    select id into c2 from contacts where organization_id = org and email = 'fernanda.lima@email.com';
    select id into c3 from contacts where organization_id = org and email = 'roberto.souza@email.com';
    select id into c4 from contacts where organization_id = org and email = 'juliana.prado@email.com';

    insert into leads (organization_id, contact_id, stage_id, titulo, valor_estimado, assigned_to, status, posicao, criado_em)
    values
      (org, c1, s_proposta, 'Apartamento Vila Mariana', 650000,  ana, 'aberto', 1, now() - interval '38 days'),
      (org, c2, s_visita,   'Sala comercial Berrini',   1200000, ana, 'aberto', 1, now() - interval '31 days'),
      (org, c3, s_contato,  'Casa Tatuapé',             850000,  ana, 'aberto', 1, now() - interval '26 days'),
      (org, c4, s_novo,     'Aluguel apto Moema',       3500,    ana, 'aberto', 1, now() - interval '19 days');

    insert into tasks (organization_id, contact_id, titulo, descricao, prioridade, status, due_date, assigned_to, criado_por)
    values
      (org, c1, 'Enviar proposta revisada', 'Cliente pediu ajuste no valor de entrada.', 'alta',  'pendente', now() - interval '1 day', ana, ana),
      (org, c2, 'Agendar visita à sala',    'Confirmar disponibilidade da portaria.',    'media', 'pendente', now(),                     ana, ana),
      (org, c3, 'Ligar para retomar contato', '',                                        'media', 'pendente', now() + interval '2 days', ana, ana);
  end if;
end $$;
