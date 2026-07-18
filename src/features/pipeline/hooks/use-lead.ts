import { useQuery } from '@tanstack/react-query'

import { useCurrentUser } from '@/lib/dev-session'

import { getLeadById } from '../repo'

/** Detalhe de um lead (habilitado só quando há id selecionado). */
export function useLead(id: string | null) {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['pipeline', 'lead', user.id, id],
    queryFn: () => getLeadById(id as string),
    enabled: id !== null,
  })
}
