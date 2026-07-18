import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  LEAD_STATUS_LABELS,
  PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '@/lib/constants'
import { ROLE_LABELS } from '@/lib/permissions'
import type {
  LeadStatus,
  PipelineStage,
  Role,
  TaskPriority,
  TaskStatus,
} from '@/types'

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  alta: 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  media: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  baixa: 'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge className={cn(PRIORITY_CLASSES[priority])}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}

const LEAD_STATUS_CLASSES: Record<LeadStatus, string> = {
  aberto: 'border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  ganho: 'border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  perdido: 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge className={cn(LEAD_STATUS_CLASSES[status])}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  )
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={status === 'concluida' ? 'secondary' : 'outline'}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  )
}

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant="outline">{ROLE_LABELS[role]}</Badge>
}

/** Etapa do funil com um ponto colorido (usa a cor configurada da etapa). */
export function StageBadge({ stage }: { stage: Pick<PipelineStage, 'nome' | 'cor'> }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: stage.cor }}
        aria-hidden
      />
      {stage.nome}
    </span>
  )
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {tag}
    </Badge>
  )
}
