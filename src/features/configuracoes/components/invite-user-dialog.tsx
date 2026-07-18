import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
import { ROLE_LABELS } from '@/lib/permissions'

import { useCreateUser } from '../hooks/use-users'
import { inviteUserSchema, type InviteUserFormValues } from '../types'

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Diálogo para convidar um novo usuário (gestor ou corretor). */
export function InviteUserDialog({ open, onOpenChange }: InviteUserDialogProps) {
  const createUser = useCreateUser()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { nome: '', email: '', papel: 'corretor' },
  })

  const onSubmit = handleSubmit((values) => {
    createUser.mutate(values, {
      onSuccess: () => {
        reset()
        onOpenChange(false)
      },
    })
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar usuário</DialogTitle>
          <DialogDescription>
            O novo usuário entra ativo na organização.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="invite-nome">Nome</Label>
            <Input id="invite-nome" {...register('nome')} />
            {errors.nome ? (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-email">E-mail</Label>
            <Input id="invite-email" type="email" {...register('email')} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-papel">Papel</Label>
            <Controller
              control={control}
              name="papel"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="invite-papel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestor">{ROLE_LABELS.gestor}</SelectItem>
                    <SelectItem value="corretor">
                      {ROLE_LABELS.corretor}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              Convidar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
