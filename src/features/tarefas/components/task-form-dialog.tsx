/** Dialog de criação/edição de tarefa (react-hook-form + zod). */
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PRIORITY_LABELS } from '@/lib/constants'
import { useCurrentUser } from '@/lib/auth'
import { canSeeAllOrg } from '@/lib/permissions'
import { toDateInputValue } from '@/lib/format'
import type { TaskPriority } from '@/types'

import {
  useContactsForSelect,
  useLeadsByContact,
  useOrgUsers,
} from '../hooks/use-tasks'
import { useCreateTask, useUpdateTask } from '../hooks/use-task-mutations'
import type { TaskInput, TaskWithRelations } from '../types'

/** Sentinela para "nenhum lead" (Radix Select não aceita valor vazio). */
const NO_LEAD = '__none__'

const PRIORITIES: TaskPriority[] = ['alta', 'media', 'baixa']

const schema = z.object({
  titulo: z.string().trim().min(1, 'Informe um título.'),
  descricao: z.string().trim().max(500, 'Máximo de 500 caracteres.'),
  contactId: z.string().min(1, 'Selecione um contato.'),
  leadId: z.string(),
  prioridade: z.enum(['baixa', 'media', 'alta']),
  dueDate: z.string(),
  assignedTo: z.string().min(1, 'Selecione um responsável.'),
})

type FormValues = z.infer<typeof schema>

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Tarefa em edição; ausente para criação. */
  task?: TaskWithRelations | null
}

export function TaskFormDialog({ open, onOpenChange, task }: TaskFormDialogProps) {
  const user = useCurrentUser()
  const canChooseAssignee = canSeeAllOrg(user)

  const contactsQuery = useContactsForSelect()
  const usersQuery = useOrgUsers()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: '',
      descricao: '',
      contactId: '',
      leadId: '',
      prioridade: 'media',
      dueDate: '',
      assignedTo: user.id,
    },
  })

  const contactId = watch('contactId')
  const leadsQuery = useLeadsByContact(contactId)

  // Reinicia o formulário ao abrir / trocar a tarefa em edição.
  useEffect(() => {
    if (!open) return
    reset(
      task
        ? {
            titulo: task.titulo,
            descricao: task.descricao,
            contactId: task.contactId,
            leadId: task.leadId ?? '',
            prioridade: task.prioridade,
            dueDate: toDateInputValue(task.dueDate),
            assignedTo: task.assignedTo,
          }
        : {
            titulo: '',
            descricao: '',
            contactId: '',
            leadId: '',
            prioridade: 'media',
            dueDate: '',
            assignedTo: user.id,
          },
    )
  }, [open, task, reset, user.id])

  const onSubmit = (values: FormValues) => {
    const input: TaskInput = values
    if (task) {
      updateTask.mutate(
        { id: task.id, input },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createTask.mutate(input, { onSuccess: () => onOpenChange(false) })
    }
  }

  const contactOptions = contactsQuery.data ?? []
  const leadOptions = leadsQuery.data ?? []
  const userOptions = usersQuery.data ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar tarefa' : 'Nova tarefa'}</DialogTitle>
          <DialogDescription>
            Toda tarefa é vinculada a um contato.
          </DialogDescription>
        </DialogHeader>

        <form
          id="task-form"
          className="grid gap-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor="task-titulo">Título</Label>
            <Input
              id="task-titulo"
              placeholder="Ex.: Enviar proposta revisada"
              {...register('titulo')}
            />
            {errors.titulo ? (
              <p className="text-xs text-destructive">{errors.titulo.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-descricao">Descrição</Label>
            <Textarea
              id="task-descricao"
              placeholder="Detalhes da tarefa (opcional)"
              {...register('descricao')}
            />
            {errors.descricao ? (
              <p className="text-xs text-destructive">{errors.descricao.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-contact">Contato</Label>
            <Controller
              control={control}
              name="contactId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Ao trocar o contato, limpa o lead selecionado.
                    setValue('leadId', '')
                  }}
                >
                  <SelectTrigger id="task-contact">
                    <SelectValue placeholder="Selecione um contato" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.contactId ? (
              <p className="text-xs text-destructive">{errors.contactId.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-lead">Lead (opcional)</Label>
            <Controller
              control={control}
              name="leadId"
              render={({ field }) => (
                <Select
                  value={field.value === '' ? NO_LEAD : field.value}
                  onValueChange={(value) =>
                    field.onChange(value === NO_LEAD ? '' : value)
                  }
                  disabled={!contactId}
                >
                  <SelectTrigger id="task-lead">
                    <SelectValue placeholder="Nenhum lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_LEAD}>Nenhum lead</SelectItem>
                    {leadOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="task-prioridade">Prioridade</Label>
              <Controller
                control={control}
                name="prioridade"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-prioridade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {PRIORITY_LABELS[priority]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-due">Prazo</Label>
              <Input id="task-due" type="date" {...register('dueDate')} />
            </div>
          </div>

          {canChooseAssignee ? (
            <div className="grid gap-2">
              <Label htmlFor="task-assignee">Responsável</Label>
              <Controller
                control={control}
                name="assignedTo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-assignee">
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {userOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assignedTo ? (
                <p className="text-xs text-destructive">
                  {errors.assignedTo.message}
                </p>
              ) : null}
            </div>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form="task-form" disabled={isSubmitting}>
            {task ? 'Salvar' : 'Criar tarefa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
