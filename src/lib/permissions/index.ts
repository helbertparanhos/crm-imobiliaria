/**
 * Regras de papel no FRONT (PRD §3 / SPEC §7). Centralizam "quem vê/faz o quê"
 * para esconder UI e escopar dados mockados. **Isto NÃO é segurança** — a
 * garantia real é a RLS do Supabase na Fase 3. Aqui apenas espelhamos o
 * comportamento esperado para validar as visões por papel.
 */
import type { Profile, Role } from '@/types'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  corretor: 'Corretor',
}

export const isAdmin = (u: Profile) => u.papel === 'admin'
export const isGestor = (u: Profile) => u.papel === 'gestor'
export const isCorretor = (u: Profile) => u.papel === 'corretor'

/** Vê todos os registros da organização (admin/gestor) vs. só os próprios (corretor). */
export const canSeeAllOrg = (u: Profile) => u.papel === 'admin' || u.papel === 'gestor'

/** Configurar campos personalizados e etapas do funil (admin/gestor). */
export const canConfigure = (u: Profile) => u.papel === 'admin' || u.papel === 'gestor'

/** Gerir usuários e papéis (Admin, e Gestor dentro da própria conta). */
export const canManageUsers = (u: Profile) => u.papel === 'admin' || u.papel === 'gestor'

/** Configs críticas / cross-conta — somente Admin (PRD §4.5). */
export const canManageCriticalSettings = (u: Profile) => u.papel === 'admin'

/**
 * Escopo de dados por papel — espelha a RLS (Fase 3).
 * Admin/Gestor: toda a organização. Corretor: só as linhas onde é o dono.
 * @param ownerField campo âncora do registro (`ownerId` em contacts, `assignedTo` em leads/tasks).
 */
export function scopeByRole<T extends { organizationId: string }>(
  user: Profile,
  rows: T[],
  ownerField: keyof T,
): T[] {
  const sameOrg = rows.filter((r) => r.organizationId === user.organizationId)
  if (canSeeAllOrg(user)) return sameOrg
  return sameOrg.filter((r) => r[ownerField] === (user.id as unknown as T[keyof T]))
}
