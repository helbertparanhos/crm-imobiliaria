import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Título da tela (pt-BR). */
  title: string
  /** Subtítulo/descrição opcional. */
  description?: string
  /** Ações à direita (ex.: botão "Novo contato") — usadas a partir da Fase 1. */
  actions?: ReactNode
}

/** Cabeçalho padrão de tela, reutilizado por todas as áreas. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}
