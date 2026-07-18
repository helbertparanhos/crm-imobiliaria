import { useState } from 'react'
import { ArrowDown, ArrowUp, GitBranch, Pencil, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { StageBadge } from '@/components/shared/badges'
import type { PipelineStage } from '@/types'

import {
  useDeleteStage,
  useReorderStage,
  useStages,
} from '../hooks/use-stages'
import { StageDialog } from './stage-dialog'

/** Aba "Etapas do funil" — apenas admin/gestor (canConfigure). */
export function StagesTab() {
  const { data: stages, isLoading } = useStages()
  const reorderStage = useReorderStage()
  const deleteStage = useDeleteStage()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PipelineStage | null>(null)
  const [toDelete, setToDelete] = useState<PipelineStage | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (stage: PipelineStage) => {
    setEditing(stage)
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-xl">Etapas do funil</CardTitle>
          <CardDescription>
            Ordene as colunas do funil e defina quais representam ganho ou perda.
          </CardDescription>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Nova etapa
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || !stages ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : stages.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="Nenhuma etapa configurada"
            description="Crie etapas para montar o funil de vendas."
            action={
              <Button onClick={openCreate}>
                <Plus />
                Nova etapa
              </Button>
            }
          />
        ) : (
          <ul className="divide-y rounded-md border">
            {stages.map((stage, index) => (
              <li
                key={stage.id}
                className="flex items-center justify-between gap-4 p-3"
              >
                <div className="flex items-center gap-3">
                  <StageBadge stage={stage} />
                  {stage.isGanho ? (
                    <Badge className="border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                      Ganho
                    </Badge>
                  ) : null}
                  {stage.isPerdido ? (
                    <Badge className="border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      Perda
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Mover ${stage.nome} para cima`}
                    disabled={index === 0 || reorderStage.isPending}
                    onClick={() =>
                      reorderStage.mutate({ id: stage.id, direction: 'up' })
                    }
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Mover ${stage.nome} para baixo`}
                    disabled={index === stages.length - 1 || reorderStage.isPending}
                    onClick={() =>
                      reorderStage.mutate({ id: stage.id, direction: 'down' })
                    }
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${stage.nome}`}
                    onClick={() => openEdit(stage)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${stage.nome}`}
                    onClick={() => setToDelete(stage)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <StageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stage={editing}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
        title="Excluir etapa"
        description={
          toDelete
            ? `A etapa "${toDelete.nome}" será removida do funil. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          if (toDelete) deleteStage.mutate(toDelete.id)
          setToDelete(null)
        }}
      />
    </Card>
  )
}
