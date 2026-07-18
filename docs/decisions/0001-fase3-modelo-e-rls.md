# ADR 0001 — Decisões da Fase 3 (modelo de dados e RLS)

Status: aceito · Data: 2026-07-18 · Fase: 3

Registra as decisões em aberto do SPEC §11 conforme implementadas nas migrations.

## 1. Papel Admin — Opção A (super-gestor da conta)
SPEC §7.4. Adotada a **opção A**: o Admin tem `organization_id` e opera como
super-gestor da própria organização. **Não há acesso cross-conta via RLS** — as
policies isolam tudo por `auth_org_id()`. Operações cross-conta (se necessárias)
ficam fora do app (Studio/Edge Function protegida). Menos superfície de risco.
Consequência nas policies: Admin e Gestor compartilham o predicado `can_see_all()`
(veem a org toda); o Corretor vê só o que é dele (`owner_id`/`assigned_to = auth.uid()`).

## 2. Campos personalizados — JSON no contato
SPEC §11. Os valores dos campos personalizados vivem em `contacts.campos_customizados`
(JSONB); as **definições** ficam em `custom_field_defs`. Simples e suficiente para o
MVP. Migrar para tabela de valores dedicada fica para depois, se necessário.

## 3. Invariantes por trigger (além da RLS)
O que a policy não expressa bem foi garantido por trigger `BEFORE UPDATE`:
- `protect_profile`: ninguém altera o próprio `papel` nem move o perfil de organização.
- `lock_organization_id`: contacts/leads/tasks não trocam de `organization_id`.
Além disso, `profiles_insert` proíbe criar `papel = 'admin'` pelo app.

## 4. Perfis ligados a auth.users
`profiles.id` referencia `auth.users(id)` (1:1). O seed cria os perfis casando
`auth.users` por e-mail — por isso os usuários precisam existir no Authentication
antes de rodar o seed.

## Pendências de verificação (não fechar a fase sem)
- Checklist de RLS do SPEC §7.6 (testar Corretor A × Corretor B, org de teste, etc.).
- Rodar o *security advisor* do Supabase e resolver alertas.
- Trocar `VITE_DATA_SOURCE=supabase` e validar as 5 telas com dados reais.
