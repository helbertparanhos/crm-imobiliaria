import { Construction } from 'lucide-react'

/** Marcador visual das telas vazias da Fase 0. Substituído pelo conteúdo real na Fase 1. */
export function PhasePlaceholder() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 p-10 text-center">
      <Construction className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium">Tela em construção</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Conteúdo com dados mockados chega na Fase 1.
      </p>
    </div>
  )
}
