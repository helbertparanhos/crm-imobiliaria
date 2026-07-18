/** Visão em lista das tarefas, com filtro por visão. */
import { CheckCircle2, MoreVertical, Pencil, Trash2 } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { PriorityBadge, TaskStatusBadge } from '@/components/shared/badges'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useTasks } from '../hooks/use-tasks'
import { useToggleTask } from '../hooks/use-task-mutations'
import { isOverdue } from '../helpers'
import type { TaskFilter, TaskWithRelations } from '../types'

const FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'minhas', label: 'Minhas' },
  { value: 'atrasadas', label: 'Atrasadas' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'proximas', label: 'Próximas' },
  { value: 'todas', label: 'Todas' },
  { value: 'concluidas', label: 'Concluídas' },
]

interface TaskListProps {
  filter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
  onEdit: (task: TaskWithRelations) => void
  onDelete: (task: TaskWithRelations) => void
}

export function TaskList({ filter, onFilterChange, onEdit, onDelete }: TaskListProps) {
  const tasksQuery = useTasks(filter)
  const toggleTask = useToggleTask()

  const items = tasksQuery.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="w-48">
          <Select value={filter} onValueChange={(value) => onFilterChange(value as TaskFilter)}>
            <SelectTrigger aria-label="Filtrar tarefas">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!tasksQuery.isLoading ? (
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'tarefa' : 'tarefas'}
          </span>
        ) : null}
      </div>

      {tasksQuery.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Carregando tarefas…
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nenhuma tarefa aqui"
          description="Ajuste o filtro ou crie uma nova tarefa vinculada a um contato."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((task) => {
            const overdue = isOverdue(task)
            const done = task.status === 'concluida'
            return (
              <li key={task.id}>
                <Card className="flex items-start gap-3 p-4">
                  <Checkbox
                    className="mt-1"
                    checked={done}
                    disabled={toggleTask.isPending}
                    onCheckedChange={() => toggleTask.mutate(task.id)}
                    aria-label={done ? 'Reabrir tarefa' : 'Concluir tarefa'}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'font-medium',
                          done && 'text-muted-foreground line-through',
                        )}
                      >
                        {task.titulo}
                      </span>
                      <PriorityBadge priority={task.prioridade} />
                      <TaskStatusBadge status={task.status} />
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>{task.contactNome}</span>
                      <span aria-hidden>•</span>
                      <span>{task.assigneeNome}</span>
                      {task.dueDate ? (
                        <>
                          <span aria-hidden>•</span>
                          <span
                            className={cn(
                              overdue && 'font-medium text-destructive',
                            )}
                          >
                            {overdue ? 'Vencida em ' : 'Prazo '}
                            {formatDate(task.dueDate)}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        aria-label="Ações da tarefa"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(task)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
