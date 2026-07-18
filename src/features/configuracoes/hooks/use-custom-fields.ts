import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentUser } from '@/lib/dev-session'

import {
  createCustomFieldDef,
  deleteCustomFieldDef,
  listCustomFieldDefs,
  updateCustomFieldDef,
  type CustomFieldInput,
} from '../repo'

export function useCustomFields() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['config', 'custom-fields', user.id],
    queryFn: () => listCustomFieldDefs(),
  })
}

export function useCreateCustomField() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomFieldInput) => createCustomFieldDef(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['config', 'custom-fields', user.id],
      })
      toast.success('Campo personalizado criado.')
    },
  })
}

export function useUpdateCustomField() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CustomFieldInput> }) =>
      updateCustomFieldDef(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['config', 'custom-fields', user.id],
      })
      toast.success('Campo personalizado atualizado.')
    },
  })
}

export function useDeleteCustomField() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomFieldDef(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['config', 'custom-fields', user.id],
      })
      toast.success('Campo personalizado excluído.')
    },
  })
}
