import { ArrowDown, ArrowUp, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StageBadge, TagBadge } from '@/components/shared/badges'
import { ORIGIN_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { Contact, PipelineStage, Profile } from '@/types'

import type { SortDir, SortKey } from '../types'

interface ContactsTableProps {
  contacts: Contact[]
  usersById: Record<string, Profile>
  stagesByContact: Record<string, PipelineStage | null>
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  onRowClick: (contact: Contact) => void
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

function SortableHead({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
}) {
  const Icon = !active ? ChevronsUpDown : dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </button>
    </TableHead>
  )
}

export function ContactsTable({
  contacts,
  usersById,
  stagesByContact,
  sortKey,
  sortDir,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
}: ContactsTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead
              label="Nome"
              active={sortKey === 'nome'}
              dir={sortDir}
              onClick={() => onSort('nome')}
            />
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Etapa atual</TableHead>
            <TableHead>Tags</TableHead>
            <SortableHead
              label="Criado em"
              active={sortKey === 'criadoEm'}
              dir={sortDir}
              onClick={() => onSort('criadoEm')}
            />
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => {
            const stage = stagesByContact[contact.id] ?? null
            return (
              <TableRow
                key={contact.id}
                className="cursor-pointer"
                onClick={() => onRowClick(contact)}
              >
                <TableCell className="font-medium">{contact.nome}</TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.telefone}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.email}
                </TableCell>
                <TableCell>{ORIGIN_LABELS[contact.origem]}</TableCell>
                <TableCell>{usersById[contact.ownerId]?.nome ?? '—'}</TableCell>
                <TableCell>
                  {stage ? <StageBadge stage={stage} /> : '—'}
                </TableCell>
                <TableCell>
                  {contact.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(contact.criadoEm)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${contact.nome}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(contact)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${contact.nome}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(contact)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
