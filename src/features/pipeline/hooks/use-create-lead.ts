import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentUser } from '@/lib/auth'

import { createLead } from '../repo'
import type { CreateLeadInput } from '../types'

/** Cria um lead e revalida o quadro. */
export function useCreateLead() {
  const queryClient = useQueryClient()
  const user = useCurrentUser()

  return useMutation({
    mutationFn: (input: CreateLeadInput) => createLead(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline', 'board', user.id] })
      toast.success('Lead criado com sucesso.')
    },
    onError: () => {
      toast.error('Não foi possível criar o lead.')
    },
  })
}
