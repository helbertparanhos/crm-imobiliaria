import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/shared/empty-state'
import { useCurrentUser } from '@/lib/dev-session'
import { ROLE_LABELS, canSeeAllOrg } from '@/lib/permissions'

import { useBoard } from '../hooks/use-board'
import {
  useContactsForSelect,
  useOrgUsers,
} from '../hooks/use-lead-form-data'
import { useCreateLead } from '../hooks/use-create-lead'
import type { NewLeadFormValues } from '../types'

const schema = z.object({
  contactId: z.string().min(1, 'Selecione um contato'),
  titulo: z
    .string()
    .trim()
    .min(1, 'Informe um título')
    .max(120, 'Máximo de 120 caracteres'),
  valorEstimado: z
    .number({ invalid_type_error: 'Informe um valor' })
    .min(0, 'Valor inválido'),
  stageId: z.string().min(1, 'Selecione uma etapa'),
  assignedTo: z.string().min(1, 'Selecione um responsável'),
})

/** Dialog de criação de lead. Corretor tem responsável forçado a si mesmo. */
export function NewLeadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const user = useCurrentUser()
  const canChooseOwner = canSeeAllOrg(user)

  const board = useBoard()
  const contactsQuery = useContactsForSelect()
  const usersQuery = useOrgUsers()
  const createLead = useCreateLead()

  const stages = board.data?.stages ?? []
  const contacts = contactsQuery.data ?? []
  const users = usersQuery.data ?? []
  const defaultStageId = stages[0]?.id ?? ''

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewLeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contactId: '',
      titulo: '',
      valorEstimado: 0,
      stageId: defaultStageId,
      assignedTo: user.id,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        contactId: '',
        titulo: '',
        valorEstimado: 0,
        stageId: defaultStageId,
        assignedTo: user.id,
      })
    }
  }, [open, defaultStageId, user.id, reset])

  const noContacts = !contactsQuery.isLoading && contacts.length === 0

  function onSubmit(values: NewLeadFormValues) {
    createLead.mutate(
      {
        contactId: values.contactId,
        titulo: values.titulo.trim(),
        valorEstimado: values.valorEstimado,
        stageId: values.stageId,
        assignedTo: canChooseOwner ? values.assignedTo : user.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
          <DialogDescription>
            Cadastre um lead no funil a partir de um contato existente.
          </DialogDescription>
        </DialogHeader>

        {noContacts ? (
          <EmptyState
            title="Nenhum contato disponível"
            description="Cadastre um contato antes de criar um lead no funil."
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lead-contact">Contato</Label>
              <Controller
                control={control}
                name="contactId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="lead-contact">
                      <SelectValue placeholder="Selecione um contato" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
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

            <div className="space-y-1.5">
              <Label htmlFor="lead-titulo">Título</Label>
              <Input
                id="lead-titulo"
                placeholder="Ex.: Apartamento Vila Mariana"
                {...register('titulo')}
              />
              {errors.titulo ? (
                <p className="text-xs text-destructive">{errors.titulo.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lead-valor">Valor estimado (R$)</Label>
              <Input
                id="lead-valor"
                type="number"
                min={0}
                step={1000}
                {...register('valorEstimado', { valueAsNumber: true })}
              />
              {errors.valorEstimado ? (
                <p className="text-xs text-destructive">
                  {errors.valorEstimado.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lead-stage">Etapa inicial</Label>
              <Controller
                control={control}
                name="stageId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="lead-stage">
                      <SelectValue placeholder="Selecione uma etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.stageId ? (
                <p className="text-xs text-destructive">{errors.stageId.message}</p>
              ) : null}
            </div>

            {canChooseOwner ? (
              <div className="space-y-1.5">
                <Label htmlFor="lead-owner">Responsável</Label>
                <Controller
                  control={control}
                  name="assignedTo"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="lead-owner">
                        <SelectValue placeholder="Selecione um responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nome} · {ROLE_LABELS[u.papel]}
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createLead.isPending}>
                {createLead.isPending ? 'Salvando…' : 'Criar lead'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
