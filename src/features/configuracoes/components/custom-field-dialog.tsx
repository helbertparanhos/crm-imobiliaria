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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { CustomFieldDef } from '@/types'

import {
  useCreateCustomField,
  useUpdateCustomField,
} from '../hooks/use-custom-fields'
import {
  FIELD_TYPE_OPTIONS,
  customFieldSchema,
  type CustomFieldFormValues,
} from '../types'

interface CustomFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Campo em edição; `null` cria um novo. */
  field: CustomFieldDef | null
  /** Ordem sugerida para um novo campo. */
  nextOrder: number
}

function parseOptions(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((o) => o.trim())
    .filter((o) => o.length > 0)
}

/** Diálogo de criar/editar um campo personalizado de contato. */
export function CustomFieldDialog({
  open,
  onOpenChange,
  field,
  nextOrder,
}: CustomFieldDialogProps) {
  const createField = useCreateCustomField()
  const updateField = useUpdateCustomField()
  const isEditing = field !== null

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CustomFieldFormValues>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      label: '',
      chave: '',
      tipo: 'text',
      opcoes: '',
      ordem: nextOrder,
    },
  })

  useEffect(() => {
    if (!open) return
    reset(
      field
        ? {
            label: field.label,
            chave: field.chave,
            tipo: field.tipo,
            opcoes: (field.opcoes ?? []).join('\n'),
            ordem: field.ordem,
          }
        : {
            label: '',
            chave: '',
            tipo: 'text',
            opcoes: '',
            ordem: nextOrder,
          },
    )
  }, [open, field, nextOrder, reset])

  const tipo = watch('tipo')

  const onSubmit = handleSubmit((values) => {
    const input = {
      label: values.label,
      chave: values.chave,
      tipo: values.tipo,
      opcoes: values.tipo === 'select' ? parseOptions(values.opcoes) : [],
      ordem: values.ordem,
    }
    if (field) {
      updateField.mutate(
        { id: field.id, patch: input },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createField.mutate(input, { onSuccess: () => onOpenChange(false) })
    }
  })

  const isPending = createField.isPending || updateField.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar campo' : 'Novo campo personalizado'}
          </DialogTitle>
          <DialogDescription>
            Campos personalizados aparecem no cadastro de contatos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cf-label">Rótulo</Label>
            <Input id="cf-label" {...register('label')} />
            {errors.label ? (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cf-chave">Chave</Label>
            <Input id="cf-chave" {...register('chave')} placeholder="ex.: renda_mensal" />
            {errors.chave ? (
              <p className="text-sm text-destructive">{errors.chave.message}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cf-tipo">Tipo</Label>
              <Controller
                control={control}
                name="tipo"
                render={({ field: f }) => (
                  <Select value={f.value} onValueChange={f.onChange}>
                    <SelectTrigger id="cf-tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cf-ordem">Ordem</Label>
              <Input
                id="cf-ordem"
                type="number"
                min={1}
                {...register('ordem', { valueAsNumber: true })}
              />
              {errors.ordem ? (
                <p className="text-sm text-destructive">
                  {errors.ordem.message}
                </p>
              ) : null}
            </div>
          </div>
          {tipo === 'select' ? (
            <div className="grid gap-2">
              <Label htmlFor="cf-opcoes">Opções</Label>
              <Textarea
                id="cf-opcoes"
                {...register('opcoes')}
                placeholder="Uma opção por linha"
              />
              {errors.opcoes ? (
                <p className="text-sm text-destructive">
                  {errors.opcoes.message}
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
            <Button type="submit" disabled={isPending}>
              {isEditing ? 'Salvar' : 'Criar campo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
