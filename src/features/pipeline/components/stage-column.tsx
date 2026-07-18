import { useDroppable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/format'
import type { PipelineStage } from '@/types'

import type { BoardLead } from '../types'
import { LeadCard } from './lead-card'

/** Coluna do funil = etapa. Recebe cards via drop e mostra totais no cabeçalho. */
export function StageColumn({
  stage,
  leads,
  onOpenLead,
}: {
  stage: PipelineStage
  leads: BoardLead[]
  onOpenLead: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  const total = leads.reduce((sum, l) => sum + l.valorEstimado, 0)

  return (
    <section className="flex w-72 shrink-0 flex-col">
      <header className="mb-2 px-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: stage.cor }}
            aria-hidden
          />
          <h2 className="text-sm font-semibold">{stage.nome}</h2>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {leads.length}
          </span>
        </div>
        <p className="mt-1 pl-4 text-xs text-muted-foreground">{formatBRL(total)}</p>
      </header>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[160px] flex-1 flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors',
          isOver ? 'border-ring bg-accent/50' : 'border-transparent bg-muted/40',
        )}
      >
        {leads.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-muted-foreground">
            Nenhum lead nesta etapa.
          </p>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onOpen={onOpenLead} />
          ))
        )}
      </div>
    </section>
  )
}
