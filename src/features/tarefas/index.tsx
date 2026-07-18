/** Tela de Tarefas (PRD §4.4): lista + timeline, com CRUD via dialog. */
import { useState } from 'react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { TaskFormDialog } from './components/task-form-dialog'
import { TaskList } from './components/task-list'
import { TaskTimeline } from './components/task-timeline'
import { useDeleteTask } from './hooks/use-task-mutations'
import type { TaskFilter, TaskWithRelations } from './types'

export default function TarefasPage() {
  const [filter, setFilter] = useState<TaskFilter>('minhas')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TaskWithRelations | null>(null)
  const [toDelete, setToDelete] = useState<TaskWithRelations | null>(null)

  const deleteTask = useDeleteTask()

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (task: TaskWithRelations) => {
    setEditing(task)
    setFormOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Tarefas"
        description="Lista e timeline de tarefas vinculadas a contatos, por prioridade e prazo."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova tarefa
          </Button>
        }
      />

      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <TaskList
            filter={filter}
            onFilterChange={setFilter}
            onEdit={openEdit}
            onDelete={setToDelete}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TaskTimeline onEdit={openEdit} />
        </TabsContent>
      </Tabs>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
        title="Excluir tarefa"
        description={
          toDelete
            ? `A tarefa "${toDelete.titulo}" será removida permanentemente.`
            : undefined
        }
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          if (toDelete) deleteTask.mutate(toDelete.id)
        }}
      />
    </>
  )
}
