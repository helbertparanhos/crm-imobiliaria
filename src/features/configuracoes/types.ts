/** Tipos e schemas locais dos formulários da tela de Configurações. */
import { z } from 'zod'

import type { CustomFieldType } from '@/types'

/** Rótulos pt-BR dos tipos de campo personalizado. */
export const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Texto',
  number: 'Número',
  select: 'Seleção',
  date: 'Data',
  bool: 'Sim/Não',
}

export const FIELD_TYPE_OPTIONS = (
  Object.entries(FIELD_TYPE_LABELS) as [CustomFieldType, string][]
).map(([value, label]) => ({ value, label }))

// --- Meu perfil -----------------------------------------------------------
export const profileSchema = z.object({
  nome: z.string().min(2, 'Informe o nome.'),
  email: z.string().email('E-mail inválido.'),
})
export type ProfileFormValues = z.infer<typeof profileSchema>

// --- Conta ----------------------------------------------------------------
export const accountSchema = z.object({
  nome: z.string().min(2, 'Informe o nome da organização.'),
})
export type AccountFormValues = z.infer<typeof accountSchema>

// --- Convidar usuário -----------------------------------------------------
export const inviteUserSchema = z.object({
  nome: z.string().min(2, 'Informe o nome.'),
  email: z.string().email('E-mail inválido.'),
  papel: z.enum(['gestor', 'corretor']),
})
export type InviteUserFormValues = z.infer<typeof inviteUserSchema>

// --- Campo personalizado --------------------------------------------------
const FIELD_TYPES = ['text', 'number', 'select', 'date', 'bool'] as const

export const customFieldSchema = z
  .object({
    label: z.string().min(2, 'Informe o rótulo.'),
    chave: z
      .string()
      .min(2, 'Informe a chave.')
      .regex(
        /^[a-z][a-z0-9_]*$/,
        'Use letras minúsculas, números e _ (comece com letra).',
      ),
    tipo: z.enum(FIELD_TYPES),
    opcoes: z.string(),
    ordem: z
      .number({ invalid_type_error: 'Informe um número.' })
      .int('Use um número inteiro.')
      .min(1, 'A ordem deve ser maior ou igual a 1.'),
  })
  .refine((v) => v.tipo !== 'select' || v.opcoes.trim().length > 0, {
    message: 'Informe ao menos uma opção para o tipo Seleção.',
    path: ['opcoes'],
  })
export type CustomFieldFormValues = z.infer<typeof customFieldSchema>

// --- Etapa do funil -------------------------------------------------------
export const stageSchema = z.object({
  nome: z.string().min(2, 'Informe o nome da etapa.'),
  cor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Use uma cor no formato HEX (#RRGGBB).'),
  isGanho: z.boolean(),
  isPerdido: z.boolean(),
})
export type StageFormValues = z.infer<typeof stageSchema>
