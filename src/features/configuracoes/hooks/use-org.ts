import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentUser } from '@/lib/auth'
import type { Organization } from '@/types'

import { getOrg, updateOrg } from '../repo'

export function useOrg() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['config', 'org', user.id],
    queryFn: () => getOrg(),
  })
}

export function useUpdateOrg() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Pick<Organization, 'nome'>>) => updateOrg(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'org', user.id] })
      toast.success('Dados da conta atualizados.')
    },
  })
}
