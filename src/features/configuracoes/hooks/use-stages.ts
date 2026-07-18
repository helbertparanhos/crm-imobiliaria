import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentUser } from '@/lib/dev-session'

import {
  createStage,
  deleteStage,
  listStages,
  reorderStage,
  updateStage,
  type ReorderDirection,
  type StageInput,
} from '../repo'

export function useStages() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['config', 'stages', user.id],
    queryFn: () => listStages(),
  })
}

export function useCreateStage() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StageInput) => createStage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'stages', user.id] })
      toast.success('Etapa criada.')
    },
  })
}

export function useUpdateStage() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<StageInput> }) =>
      updateStage(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'stages', user.id] })
      toast.success('Etapa atualizada.')
    },
  })
}

export function useReorderStage() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: ReorderDirection }) =>
      reorderStage(id, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'stages', user.id] })
    },
  })
}

export function useDeleteStage() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'stages', user.id] })
      toast.success('Etapa excluída.')
    },
  })
}
