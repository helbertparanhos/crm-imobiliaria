import { useMemo, useState } from 'react'
import { Plus, Users } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/lib/auth'
import { canSeeAllOrg } from '@/lib/permissions'
import type { Contact, PipelineStage, Profile } from '@/types'

import { ContactsFilters } from './components/contacts-filters'
import { ContactsTable } from './components/contacts-table'
import { ContactFormDialog } from './components/contact-form-dialog'
import { ContactDetailSheet } from './components/contact-detail-sheet'
import {
  useContacts,
  useCreateContact,
  useCurrentStages,
  useDeleteContact,
  useUpdateContact,
} from './hooks/use-contacts'
import {
  useCustomFieldDefs,
  useOrgUsers,
  useStages,
} from './hooks/use-contacts-meta'
import type { ContactFilters, ContactInput, SortKey } from './types'
import { ALL } from './types'

const BASE_FILTERS: ContactFilters = {
  search: '',
  ownerId: ALL,
  origem: ALL,
  tag: ALL,
}

export default function ContatosPage() {
  const currentUser = useCurrentUser()
  const canChooseOwner = canSeeAllOrg(currentUser)

  const [filters, setFilters] = useState<ContactFilters>(BASE_FILTERS)
  const [sortKey, setSortKey] = useState<SortKey>('nome')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)

  const { data: contacts, isLoading } = useContacts(filters)
  const { data: allVisible } = useContacts(BASE_FILTERS)
  const { data: stagesByContact } = useCurrentStages()
  const { data: stages } = useStages()
  const { data: orgUsers } = useOrgUsers()
  const { data: defs } = useCustomFieldDefs()

  const createMutation = useCreateContact()
  const updateMutation = useUpdateContact()
  const deleteMutation = useDeleteContact()

  const usersById = useMemo<Record<string, Profile>>(() => {
    const map: Record<string, Profile> = {}
    for (const u of orgUsers ?? []) map[u.id] = u
    return map
  }, [orgUsers])

  const stagesById = useMemo<Record<string, PipelineStage>>(() => {
    const map: Record<string, PipelineStage> = {}
    for (const s of stages ?? []) map[s.id] = s
    return map
  }, [stages])

  const tags = useMemo<string[]>(() => {
    const set = new Set<string>()
    for (const c of allVisible ?? []) for (const t of c.tags) set.add(t)
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [allVisible])

  const sortedContacts = useMemo<Contact[]>(() => {
    const rows = [...(contacts ?? [])]
    rows.sort((a, b) => {
      const cmp =
        sortKey === 'nome'
          ? a.nome.localeCompare(b.nome, 'pt-BR')
          : a.criadoEm.localeCompare(b.criadoEm)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [contacts, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'nome' ? 'asc' : 'desc')
    }
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(contact: Contact) {
    setEditing(contact)
    setFormOpen(true)
  }

  function openDetail(contact: Contact) {
    setSelected(contact)
    setDetailOpen(true)
  }

  function handleSubmit(input: ContactInput) {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, input },
        { onSuccess: () => setFormOpen(false) },
      )
    } else {
      createMutation.mutate(input, { onSuccess: () => setFormOpen(false) })
    }
  }

  function handleConfirmDelete() {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
  }

  return (
    <>
      <PageHeader
        title="Contatos"
        description="Lista central de contatos, com busca, filtros e campos personalizados."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo contato
          </Button>
        }
      />

      <ContactsFilters
        filters={filters}
        onChange={setFilters}
        owners={orgUsers ?? []}
        showOwnerFilter={canChooseOwner}
        tags={tags}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando contatos...</p>
      ) : sortedContacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum contato encontrado"
          description="Ajuste os filtros ou cadastre um novo contato."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Novo contato
            </Button>
          }
        />
      ) : (
        <ContactsTable
          contacts={sortedContacts}
          usersById={usersById}
          stagesByContact={stagesByContact ?? {}}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={openDetail}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      )}

      <ContactFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editing}
        defs={defs ?? []}
        users={orgUsers ?? []}
        currentUser={currentUser}
        canChooseOwner={canChooseOwner}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ContactDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contact={selected}
        defs={defs ?? []}
        stagesById={stagesById}
        usersById={usersById}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Excluir contato"
        description={
          deleteTarget
            ? `Tem certeza que deseja excluir "${deleteTarget.nome}"? Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
