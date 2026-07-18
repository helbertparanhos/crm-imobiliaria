-- ============================================================================
-- Fase 3 — Helpers de contexto + Policies RLS + Triggers de invariantes
-- SPEC §7. Deny-by-default: cada tabela só libera o que estas policies permitem.
-- Policies SEPARADAS por operação, com WITH CHECK em toda escrita.
-- ============================================================================

-- 7.2 Helpers SECURITY DEFINER (evitam recursão de RLS ao ler o próprio profile).
--     STABLE + search_path fixo. Leem profiles como owner (bypassam RLS).
create or replace function public.auth_org_id()
returns uuid language sql stable security definer set search_path = public, pg_temp as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.auth_role()
returns user_role language sql stable security definer set search_path = public, pg_temp as $$
  select papel from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select public.auth_role() = 'admin';
$$;

create or replace function public.is_gestor()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select public.auth_role() = 'gestor';
$$;

create or replace function public.is_corretor()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select public.auth_role() = 'corretor';
$$;

-- Vê tudo da organização (admin/gestor) vs. só o próprio (corretor).
create or replace function public.can_see_all()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select public.auth_role() in ('admin', 'gestor');
$$;

-- ============================================================================
-- organizations — a própria org; escrita: admin/gestor.
-- ============================================================================
create policy organizations_select on organizations for select to authenticated
  using (id = auth_org_id());
create policy organizations_update on organizations for update to authenticated
  using (id = auth_org_id() and can_see_all())
  with check (id = auth_org_id() and can_see_all());

-- ============================================================================
-- profiles — o próprio (todos) + a org toda (admin/gestor).
-- Escrita: admin/gestor na própria org. Ninguém muda o próprio papel nem a org
-- (garantido pelo trigger abaixo). Não se cria 'admin' pelo app.
-- ============================================================================
create policy profiles_select on profiles for select to authenticated
  using (
    organization_id = auth_org_id()
    and (id = (select auth.uid()) or can_see_all())
  );
create policy profiles_insert on profiles for insert to authenticated
  with check (
    organization_id = auth_org_id()
    and can_see_all()
    and papel <> 'admin'
  );
create policy profiles_update on profiles for update to authenticated
  using (organization_id = auth_org_id() and can_see_all())
  with check (organization_id = auth_org_id() and can_see_all());
create policy profiles_delete on profiles for delete to authenticated
  using (organization_id = auth_org_id() and is_admin() and id <> (select auth.uid()));

-- ============================================================================
-- pipeline_stages / custom_field_defs — leitura: org toda; escrita: admin/gestor.
-- ============================================================================
create policy stages_select on pipeline_stages for select to authenticated
  using (organization_id = auth_org_id());
create policy stages_insert on pipeline_stages for insert to authenticated
  with check (organization_id = auth_org_id() and can_see_all());
create policy stages_update on pipeline_stages for update to authenticated
  using (organization_id = auth_org_id() and can_see_all())
  with check (organization_id = auth_org_id() and can_see_all());
create policy stages_delete on pipeline_stages for delete to authenticated
  using (organization_id = auth_org_id() and can_see_all());

create policy cfd_select on custom_field_defs for select to authenticated
  using (organization_id = auth_org_id());
create policy cfd_insert on custom_field_defs for insert to authenticated
  with check (organization_id = auth_org_id() and can_see_all());
create policy cfd_update on custom_field_defs for update to authenticated
  using (organization_id = auth_org_id() and can_see_all())
  with check (organization_id = auth_org_id() and can_see_all());
create policy cfd_delete on custom_field_defs for delete to authenticated
  using (organization_id = auth_org_id() and can_see_all());

-- ============================================================================
-- contacts — Corretor: só onde owner_id = auth.uid(). Gestor/Admin: org toda.
-- WITH CHECK impede gravar em outra org ou (corretor) para outro dono.
-- ============================================================================
create policy contacts_select on contacts for select to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or owner_id = (select auth.uid()))
  );
create policy contacts_insert on contacts for insert to authenticated
  with check (
    organization_id = auth_org_id()
    and (can_see_all() or owner_id = (select auth.uid()))
  );
create policy contacts_update on contacts for update to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or owner_id = (select auth.uid()))
  )
  with check (
    organization_id = auth_org_id()
    and (can_see_all() or owner_id = (select auth.uid()))
  );
create policy contacts_delete on contacts for delete to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or owner_id = (select auth.uid()))
  );

-- ============================================================================
-- leads — mesma regra, âncora assigned_to.
-- ============================================================================
create policy leads_select on leads for select to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  );
create policy leads_insert on leads for insert to authenticated
  with check (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  );
create policy leads_update on leads for update to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  )
  with check (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  );
create policy leads_delete on leads for delete to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  );

-- ============================================================================
-- tasks — mesma regra, âncora assigned_to.
-- ============================================================================
create policy tasks_select on tasks for select to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  );
create policy tasks_insert on tasks for insert to authenticated
  with check (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  );
create policy tasks_update on tasks for update to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  )
  with check (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  );
create policy tasks_delete on tasks for delete to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or assigned_to = (select auth.uid()))
  );

-- ============================================================================
-- activities — leitura: admin/gestor da org, ou o próprio ator. Escrita: próprio ator.
-- ============================================================================
create policy activities_select on activities for select to authenticated
  using (
    organization_id = auth_org_id()
    and (can_see_all() or ator = (select auth.uid()))
  );
create policy activities_insert on activities for insert to authenticated
  with check (organization_id = auth_org_id() and ator = (select auth.uid()));

-- ============================================================================
-- Triggers de invariantes (SPEC §7.5) — o que a policy não expressa bem.
-- ============================================================================

-- Ninguém muda o próprio papel; ninguém move o perfil de organização.
create or replace function public.protect_profile()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.organization_id <> old.organization_id then
    raise exception 'Não é permitido mover o perfil de organização.';
  end if;
  if new.papel <> old.papel and old.id = auth.uid() then
    raise exception 'Você não pode alterar o próprio papel.';
  end if;
  return new;
end;
$$;
create trigger trg_protect_profile
  before update on profiles
  for each row execute function public.protect_profile();

-- Registros de negócio não podem trocar de organização em UPDATE.
create or replace function public.lock_organization_id()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if new.organization_id <> old.organization_id then
    raise exception 'Não é permitido mover o registro de organização.';
  end if;
  return new;
end;
$$;
create trigger trg_lock_org_contacts before update on contacts
  for each row execute function public.lock_organization_id();
create trigger trg_lock_org_leads before update on leads
  for each row execute function public.lock_organization_id();
create trigger trg_lock_org_tasks before update on tasks
  for each row execute function public.lock_organization_id();
