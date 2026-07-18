import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'

import { EmptyState } from '@/components/shared/empty-state'
import { KanbanSquare } from 'lucide-react'

import { useBoard } from '../hooks/use-board'
import { useMoveLead } from '../hooks/use-move-lead'
import { LeadCardContent } from './lead-card'
import { StageColumn } from './stage-column'
import { LeadDetailDialog } from './lead-detail-dialog'

/** Quadro kanban com arrastar-e-soltar entre etapas. */
export function Board() {
  const { data, isLoading } = useBoard()
  const moveLead = useMoveLead()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  if (isLoading || !data) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-64 w-72 shrink-0 animate-pulse rounded-lg bg-muted/60"
          />
        ))}
      </div>
    )
  }

  if (data.stages.length === 0) {
    return (
      <EmptyState
        icon={KanbanSquare}
        title="Nenhuma etapa configurada"
        description="Configure as etapas do funil para começar a organizar seus leads."
      />
    )
  }

  const activeLead = activeId
    ? data.leads.find((l) => l.id === activeId) ?? null
    : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const fromStageId = active.data.current?.stageId as string | undefined
    const toStageId = String(over.id)
    if (!fromStageId || fromStageId === toStageId) return
    moveLead.mutate({ leadId: String(active.id), toStageId })
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {data.stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              leads={data.leads.filter((l) => l.stageId === stage.id)}
              onOpenLead={setDetailId}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <LeadCardContent lead={activeLead} dragging /> : null}
        </DragOverlay>
      </DndContext>

      <LeadDetailDialog
        leadId={detailId}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
      />
    </>
  )
}
