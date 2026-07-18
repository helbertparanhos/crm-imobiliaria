import { useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import type { PipelineStage } from '@/types'

import { useCreateStage, useUpdateStage } from '../hooks/use-stages'
import { stageSchema, type StageFormValues } from '../types'

interface StageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Etapa em edição; `null` cria uma nova. */
  stage: PipelineStage | null
}

const DEFAULT_COLOR = '#64748b'

/** Diálogo de criar/editar uma etapa do funil. */
export function StageDialog({ open, onOpenChange, stage }: StageDialogProps) {
  const createStage = useCreateStage()
  const updateStage = useUpdateStage()
  const isEditing = stage !== null

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StageFormValues>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      nome: '',
      cor: DEFAULT_COLOR,
      isGanho: false,
      isPerdido: false,
    },
  })

  useEffect(() => {
    if (!open) return
    reset(
      stage
        ? {
            nome: stage.nome,
            cor: stage.cor,
            isGanho: stage.isGanho,
            isPerdido: stage.isPerdido,
          }
        : { nome: '', cor: DEFAULT_COLOR, isGanho: false, isPerdido: false },
    )
  }, [open, stage, reset])

  const cor = watch('cor')

  const onSubmit = handleSubmit((values) => {
    if (stage) {
      updateStage.mutate(
        { id: stage.id, patch: values },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createStage.mutate(values, { onSuccess: () => onOpenChange(false) })
    }
  })

  const isPending = createStage.isPending || updateStage.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar etapa' : 'Nova etapa'}</DialogTitle>
          <DialogDescription>
            Etapas definem as colunas do funil de vendas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="stage-nome">Nome</Label>
            <Input id="stage-nome" {...register('nome')} />
            {errors.nome ? (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stage-cor">Cor</Label>
            <div className="flex items-center gap-3">
              <input
                id="stage-cor"
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(cor) ? cor : DEFAULT_COLOR}
                onChange={(e) =>
                  setValue('cor', e.target.value, { shouldDirty: true })
                }
                className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
                aria-label="Selecionar cor"
              />
              <Input
                {...register('cor')}
                className="font-mono"
                placeholder="#RRGGBB"
              />
            </div>
            {errors.cor ? (
              <p className="text-sm text-destructive">{errors.cor.message}</p>
            ) : null}
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="stage-ganho">Etapa de ganho</Label>
              <p className="text-xs text-muted-foreground">
                Marca o negócio como fechado com sucesso.
              </p>
            </div>
            <Controller
              control={control}
              name="isGanho"
              render={({ field }) => (
                <Switch
                  id="stage-ganho"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    if (checked) setValue('isPerdido', false)
                  }}
                />
              )}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="stage-perdido">Etapa de perda</Label>
              <p className="text-xs text-muted-foreground">
                Marca o negócio como perdido.
              </p>
            </div>
            <Controller
              control={control}
              name="isPerdido"
              render={({ field }) => (
                <Switch
                  id="stage-perdido"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    if (checked) setValue('isGanho', false)
                  }}
                />
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
            <Button type="submit" disabled={isPending}>
              {isEditing ? 'Salvar' : 'Criar etapa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
