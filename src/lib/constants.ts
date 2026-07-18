/** Constantes globais da aplicação. Textos de UI em pt-BR (ver CLAUDE.md). */

export const APP_NAME = 'CRM Imobiliária'

/** Caminhos de rota centralizados — usados pelo router e pela navegação. */
export const ROUTES = {
  dashboard: '/',
  contatos: '/contatos',
  pipeline: '/pipeline',
  tarefas: '/tarefas',
  configuracoes: '/configuracoes',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
