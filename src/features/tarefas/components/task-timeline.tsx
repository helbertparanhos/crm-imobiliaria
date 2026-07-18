/** Visão em timeline: tarefas pendentes por prioridade e prazo. */
import { CalendarClock } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { PriorityBadge } from '@/components/shared/badges'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useTasks } from '../hooks/use-tasks'
import { isOverdue, sortForTimeline } from '../helpers'
import type { TaskWithRelations } from '../types'

interface TaskTimelineProps {
  onEdit: (task: TaskWithRelations) => void
}

export function TaskTimeline({ onEdit }: TaskTimelineProps) {
  const tasksQuery = useTasks('todas')

  if (tasksQuery.isLoading) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Carregando tarefas…
      </p>
    )
  }

  const pending = sortForTimeline(
    (tasksQuery.data ?? []).filter((task) => task.status === 'pendente'),
  )

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Sem tarefas pendentes"
        description="Tudo em dia. Crie uma nova tarefa para acompanhar aqui."
      />
    )
  }

  return (
    <ol className="relative ml-3 border-l pl-6">
      {pending.map((task) => {
        const overdue = isOverdue(task)
        return (
          <li key={task.id} className="mb-6 last:mb-0">
            <span
              className={cn(
                'absolute -left-[7px] mt-1 h-3 w-3 rounded-full border-2 border-background',
                overdue ? 'bg-destructive' : 'bg-primary',
              )}
              aria-hidden
            />
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  overdue ? 'text-destructive' : 'text-muted-foreground',
                )}
              >
                {task.dueDate
                  ? `${overdue ? 'Vencida em ' : ''}${formatDate(task.dueDate)}`
                  : 'Sem prazo'}
              </span>

              <button
                type="button"
                onClick={() => onEdit(task)}
                className="w-full rounded-md border bg-card p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{task.titulo}</span>
                  <PriorityBadge priority={task.prioridade} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span>{task.contactNome}</span>
                  <span aria-hidden>•</span>
                  <span>{task.assigneeNome}</span>
                  {task.leadTitulo ? (
                    <>
                      <span aria-hidden>•</span>
                      <span>{task.leadTitulo}</span>
                    </>
                  ) : null}
                </div>
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
