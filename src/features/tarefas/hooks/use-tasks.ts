/** Hooks de leitura (TanStack Query) da feature Tarefas. */
import { useQuery } from '@tanstack/react-query'

import { useCurrentUser } from '@/lib/dev-session'

import {
  listContactsForSelect,
  listLeadsByContact,
  listOrgUsers,
  listTasks,
} from '../repo'
import type { TaskFilter } from '../types'

/** Lista as tarefas da visão selecionada, escopadas por papel. */
export function useTasks(filter: TaskFilter) {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['tasks', user.id, filter],
    queryFn: () => listTasks(filter),
  })
}

/** Contatos disponíveis para vincular a tarefa (escopados por papel). */
export function useContactsForSelect() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['tasks-contacts', user.id],
    queryFn: listContactsForSelect,
  })
}

/** Leads do contato selecionado (para o campo opcional de lead). */
export function useLeadsByContact(contactId: string) {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['tasks-leads', user.id, contactId],
    queryFn: () => listLeadsByContact(contactId),
    enabled: contactId.length > 0,
  })
}

/** Usuários da organização (opções de responsável). */
export function useOrgUsers() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['tasks-org-users', user.id],
    queryFn: listOrgUsers,
  })
}
