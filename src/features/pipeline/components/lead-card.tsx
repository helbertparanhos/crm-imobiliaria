import { useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, User } from 'lucide-react'

import { LeadStatusBadge } from '@/components/shared/badges'
import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/format'

import type { BoardLead } from '../types'

/** Conteúdo visual do card — reutilizado no quadro e no DragOverlay. */
export function LeadCardContent({
  lead,
  dragging = false,
}: {
  lead: BoardLead
  dragging?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-shadow',
        dragging ? 'shadow-lg ring-2 ring-ring' : 'hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight">{lead.titulo}</p>
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{lead.contatoNome}</p>
      <p className="mt-2 text-sm font-semibold">{formatBRL(lead.valorEstimado)}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" aria-hidden />
          {lead.responsavelNome}
        </span>
        <LeadStatusBadge status={lead.status} />
      </div>
    </div>
  )
}

/** Card arrastável do funil. Clique (sem arrastar) abre o detalhe. */
export function LeadCard({
  lead,
  onOpen,
}: {
  lead: BoardLead
  onOpen: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { stageId: lead.stageId },
  })
  const pointerDown = useRef<{ x: number; y: number } | null>(null)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1,
      }}
      {...attributes}
      {...listeners}
      onPointerDownCapture={(e) => {
        pointerDown.current = { x: e.clientX, y: e.clientY }
      }}
      onClick={(e) => {
        const start = pointerDown.current
        if (start) {
          const moved =
            Math.abs(e.clientX - start.x) > 5 || Math.abs(e.clientY - start.y) > 5
          if (moved) return
        }
        onOpen(lead.id)
      }}
      className="cursor-grab touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing"
    >
      <LeadCardContent lead={lead} />
    </div>
  )
}
