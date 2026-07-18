import type { ReactNode } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  LeadStatusBadge,
  StageBadge,
  TagBadge,
  TaskStatusBadge,
} from '@/components/shared/badges'
import { EmptyState } from '@/components/shared/empty-state'
import { ORIGIN_LABELS } from '@/lib/constants'
import { formatBRL, formatDate, formatNumber, fromNow } from '@/lib/format'
import type {
  Contact,
  CustomFieldDef,
  CustomFieldType,
  PipelineStage,
  Profile,
} from '@/types'

import { useContactRelations } from '../hooks/use-contacts'
import type { CustomFieldValue } from '../types'

interface ContactDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  defs: CustomFieldDef[]
  stagesById: Record<string, PipelineStage>
  usersById: Record<string, Profile>
}

function formatCustomValue(tipo: CustomFieldType, value: CustomFieldValue): string {
  if (value === null || value === undefined || value === '') return '—'
  if (tipo === 'bool') return value ? 'Sim' : 'Não'
  if (tipo === 'number' && typeof value === 'number') return formatNumber(value)
  if (tipo === 'date' && typeof value === 'string') return formatDate(value)
  return String(value)
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function ContactDetailSheet({
  open,
  onOpenChange,
  contact,
  defs,
  stagesById,
  usersById,
}: ContactDetailSheetProps) {
  const { data: relations, isLoading } = useContactRelations(contact?.id ?? null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {contact ? (
          <>
            <SheetHeader>
              <SheetTitle>{contact.nome}</SheetTitle>
              <SheetDescription>
                Responsável: {usersById[contact.ownerId]?.nome ?? '—'}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <section className="grid grid-cols-2 gap-4">
                <Field label="Telefone">{contact.telefone}</Field>
                <Field label="E-mail">{contact.email}</Field>
                <Field label="Origem">{ORIGIN_LABELS[contact.origem]}</Field>
                <Field label="Tags">
                  {contact.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </Field>
              </section>

              {defs.length > 0 ? (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Campos personalizados</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {defs.map((def) => (
                        <Field key={def.id} label={def.label}>
                          {formatCustomValue(
                            def.tipo,
                            contact.camposCustomizados[def.chave] ?? null,
                          )}
                        </Field>
                      ))}
                    </div>
                  </section>
                </>
              ) : null}

              <Separator />
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Leads vinculados</h3>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : relations && relations.leads.length > 0 ? (
                  <ul className="space-y-2">
                    {relations.leads.map((lead) => {
                      const stage = stagesById[lead.stageId]
                      return (
                        <li
                          key={lead.id}
                          className="flex items-center justify-between gap-2 rounded-md border p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {lead.titulo}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              {stage ? <StageBadge stage={stage} /> : null}
                              <LeadStatusBadge status={lead.status} />
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-medium">
                            {formatBRL(lead.valorEstimado)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum lead vinculado.
                  </p>
                )}
              </section>

              <Separator />
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Tarefas vinculadas</h3>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : relations && relations.tasks.length > 0 ? (
                  <ul className="space-y-2">
                    {relations.tasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between gap-2 rounded-md border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {task.titulo}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Prazo:{' '}
                            {task.dueDate ? formatDate(task.dueDate) : 'Sem prazo'}
                          </p>
                        </div>
                        <TaskStatusBadge status={task.status} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma tarefa vinculada.
                  </p>
                )}
              </section>

              <Separator />
              <section className="space-y-1">
                <h3 className="text-sm font-semibold">Histórico</h3>
                <p className="text-xs text-muted-foreground">
                  Criado {fromNow(contact.criadoEm)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Atualizado {fromNow(contact.atualizadoEm)}
                </p>
              </section>
            </div>
          </>
        ) : (
          <EmptyState title="Selecione um contato" />
        )}
      </SheetContent>
    </Sheet>
  )
}
