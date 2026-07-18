/** Hooks (TanStack Query) da feature Contatos. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentUser } from '@/lib/dev-session'

import {
  createContact,
  deleteContact,
  getContactById,
  getContactRelations,
  listContacts,
  listCurrentStages,
  updateContact,
} from '../repo'
import type { ContactFilters, ContactInput } from '../types'

/** Lista de contatos filtrada (refaz o fetch ao trocar de usuário). */
export function useContacts(filters: ContactFilters) {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['contacts', user.id, 'list', filters],
    queryFn: () => listContacts(filters),
  })
}

/** Detalhe de um contato. */
export function useContact(id: string | null) {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['contacts', user.id, 'detail', id],
    queryFn: () => getContactById(id as string),
    enabled: id !== null,
  })
}

/** Leads e tarefas vinculados ao contato. */
export function useContactRelations(id: string | null) {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['contacts', user.id, 'relations', id],
    queryFn: () => getContactRelations(id as string),
    enabled: id !== null,
  })
}

/** Mapa de etapa atual por contato (coluna da tabela). */
export function useCurrentStages() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['contacts', user.id, 'stages'],
    queryFn: () => listCurrentStages(),
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ContactInput) => createContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contato criado com sucesso.')
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; input: ContactInput }) =>
      updateContact(vars.id, vars.input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contato atualizado com sucesso.')
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contato excluído.')
    },
  })
}
