import { useEffect } from 'react'
import { Controller, useForm, type Control } from 'react-hook-form'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ORIGIN_OPTIONS } from '@/lib/constants'
import { ROLE_LABELS } from '@/lib/permissions'
import type { Contact, ContactOrigin, CustomFieldDef, Profile } from '@/types'

import type { ContactInput, CustomFieldValue } from '../types'

const schema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.'),
  telefone: z.string().trim().min(1, 'Informe o telefone.'),
  email: z.string().trim().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  origem: z.enum(['site', 'indicacao', 'portal', 'whatsapp', 'telefone', 'outro']),
  tagsText: z.string(),
  ownerId: z.string().min(1, 'Selecione o responsável.'),
  camposCustomizados: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
})

type ContactFormValues = z.infer<typeof schema>

interface ContactFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Contato em edição, ou null para criação. */
  contact: Contact | null
  defs: CustomFieldDef[]
  users: Profile[]
  currentUser: Profile
  /** Se falso, o campo "Responsável" é oculto e o dono é forçado ao usuário atual. */
  canChooseOwner: boolean
  submitting: boolean
  onSubmit: (input: ContactInput) => void
}

function buildDefaultCustomValues(
  defs: CustomFieldDef[],
  contact: Contact | null,
): Record<string, CustomFieldValue> {
  const values: Record<string, CustomFieldValue> = {}
  for (const def of defs) {
    const current = contact?.camposCustomizados[def.chave]
    if (current !== undefined) {
      values[def.chave] = current
      continue
    }
    values[def.chave] = def.tipo === 'bool' ? false : null
  }
  return values
}

function buildDefaults(
  contact: Contact | null,
  defs: CustomFieldDef[],
  fallbackOwnerId: string,
): ContactFormValues {
  return {
    nome: contact?.nome ?? '',
    telefone: contact?.telefone ?? '',
    email: contact?.email ?? '',
    origem: contact?.origem ?? 'site',
    tagsText: contact?.tags.join(', ') ?? '',
    ownerId: contact?.ownerId ?? fallbackOwnerId,
    camposCustomizados: buildDefaultCustomValues(defs, contact),
  }
}

export function ContactFormDialog({
  open,
  onOpenChange,
  contact,
  defs,
  users,
  currentUser,
  canChooseOwner,
  submitting,
  onSubmit,
}: ContactFormDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(contact, defs, currentUser.id),
  })

  // Ressincroniza o formulário sempre que o dialog abre ou o alvo muda.
  useEffect(() => {
    if (open) reset(buildDefaults(contact, defs, currentUser.id))
  }, [open, contact, defs, currentUser.id, reset])

  const submit = handleSubmit((values) => {
    const tags = values.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    const camposCustomizados: Record<string, CustomFieldValue> = {}
    for (const def of defs) {
      const raw = values.camposCustomizados[def.chave]
      camposCustomizados[def.chave] = raw === '' ? null : (raw ?? null)
    }
    onSubmit({
      nome: values.nome.trim(),
      telefone: values.telefone.trim(),
      email: values.email.trim(),
      origem: values.origem,
      tags,
      ownerId: canChooseOwner ? values.ownerId : currentUser.id,
      camposCustomizados,
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{contact ? 'Editar contato' : 'Novo contato'}</DialogTitle>
          <DialogDescription>
            {contact
              ? 'Atualize os dados do contato.'
              : 'Preencha os dados para cadastrar um novo contato.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contact-nome">Nome</Label>
            <Input id="contact-nome" {...register('nome')} />
            {errors.nome ? (
              <p className="text-xs text-destructive">{errors.nome.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-telefone">Telefone</Label>
              <Input id="contact-telefone" {...register('telefone')} />
              {errors.telefone ? (
                <p className="text-xs text-destructive">{errors.telefone.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">E-mail</Label>
              <Input id="contact-email" type="email" {...register('email')} />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-origem">Origem</Label>
              <Controller
                control={control}
                name="origem"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as ContactOrigin)}
                  >
                    <SelectTrigger id="contact-origem">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGIN_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {canChooseOwner ? (
              <div className="space-y-1.5">
                <Label htmlFor="contact-owner">Responsável</Label>
                <Controller
                  control={control}
                  name="ownerId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="contact-owner">
                        <SelectValue placeholder="Selecione" />
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
                {errors.ownerId ? (
                  <p className="text-xs text-destructive">{errors.ownerId.message}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-tags">Tags</Label>
            <Input
              id="contact-tags"
              placeholder="Separe por vírgula. Ex.: quente, investidor"
              {...register('tagsText')}
            />
          </div>

          {defs.length > 0 ? (
            <div className="space-y-4 border-t pt-4">
              <p className="text-sm font-medium">Campos personalizados</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {defs.map((def) => (
                  <CustomFieldControl key={def.id} def={def} control={control} />
                ))}
              </div>
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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface CustomFieldControlProps {
  def: CustomFieldDef
  control: Control<ContactFormValues>
}

function CustomFieldControl({ def, control }: CustomFieldControlProps) {
  const name = `camposCustomizados.${def.chave}` as const
  const fieldId = `cf-${def.chave}`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        if (def.tipo === 'bool') {
          return (
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id={fieldId}
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <Label htmlFor={fieldId}>{def.label}</Label>
            </div>
          )
        }

        if (def.tipo === 'select') {
          return (
            <div className="space-y-1.5">
              <Label htmlFor={fieldId}>{def.label}</Label>
              <Select
                value={typeof field.value === 'string' ? field.value : ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger id={fieldId}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(def.opcoes ?? []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }

        const inputType =
          def.tipo === 'number' ? 'number' : def.tipo === 'date' ? 'date' : 'text'

        return (
          <div className="space-y-1.5">
            <Label htmlFor={fieldId}>{def.label}</Label>
            <Input
              id={fieldId}
              type={inputType}
              value={
                field.value === null || field.value === undefined
                  ? ''
                  : String(field.value)
              }
              onChange={(e) => {
                if (def.tipo === 'number') {
                  field.onChange(e.target.value === '' ? null : Number(e.target.value))
                } else {
                  field.onChange(e.target.value)
                }
              }}
            />
          </div>
        )
      }}
    />
  )
}
