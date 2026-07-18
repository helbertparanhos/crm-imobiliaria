import { useQuery } from '@tanstack/react-query'

import { useCurrentUser } from '@/lib/dev-session'

import { listContactsForSelect, listOrgUsers } from '../repo'

/** Contatos escopados para o select de novo lead. */
export function useContactsForSelect() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['pipeline', 'contacts-select', user.id],
    queryFn: listContactsForSelect,
  })
}

/** Usuários ativos da organização (escolha de responsável). */
export function useOrgUsers() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['pipeline', 'org-users', user.id],
    queryFn: listOrgUsers,
  })
}
