import { useState } from 'react'
import { ListChecks, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import type { CustomFieldDef } from '@/types'

import {
  useCustomFields,
  useDeleteCustomField,
} from '../hooks/use-custom-fields'
import { FIELD_TYPE_LABELS } from '../types'
import { CustomFieldDialog } from './custom-field-dialog'

/** Aba "Campos personalizados" — apenas admin/gestor (canConfigure). */
export function CustomFieldsTab() {
  const { data: fields, isLoading } = useCustomFields()
  const deleteField = useDeleteCustomField()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CustomFieldDef | null>(null)
  const [toDelete, setToDelete] = useState<CustomFieldDef | null>(null)

  const nextOrder = (fields?.reduce((max, f) => Math.max(max, f.ordem), 0) ?? 0) + 1

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (field: CustomFieldDef) => {
    setEditing(field)
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-xl">Campos personalizados</CardTitle>
          <CardDescription>
            Campos extras coletados no cadastro de contatos.
          </CardDescription>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Novo campo
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || !fields ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : fields.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Nenhum campo personalizado"
            description="Crie campos para coletar informações específicas dos contatos."
            action={
              <Button onClick={openCreate}>
                <Plus />
                Novo campo
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px]">Ordem</TableHead>
                <TableHead>Rótulo</TableHead>
                <TableHead>Chave</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Opções</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="text-muted-foreground">{f.ordem}</TableCell>
                  <TableCell className="font-medium">{f.label}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {f.chave}
                  </TableCell>
                  <TableCell>{FIELD_TYPE_LABELS[f.tipo]}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {f.tipo === 'select' ? (f.opcoes ?? []).join(', ') : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${f.label}`}
                        onClick={() => openEdit(f)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${f.label}`}
                        onClick={() => setToDelete(f)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CustomFieldDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        field={editing}
        nextOrder={nextOrder}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
        title="Excluir campo personalizado"
        description={
          toDelete
            ? `O campo "${toDelete.label}" será removido. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          if (toDelete) deleteField.mutate(toDelete.id)
          setToDelete(null)
        }}
      />
    </Card>
  )
}
