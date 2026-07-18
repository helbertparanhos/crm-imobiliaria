import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentUser } from '@/lib/dev-session'

import {
  createUser,
  listUsers,
  updateUser,
  type CreateUserInput,
  type UpdateUserPatch,
} from '../repo'

export function useUsers() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['config', 'users', user.id],
    queryFn: () => listUsers(),
  })
}

export function useCreateUser() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'users', user.id] })
      toast.success('Usuário convidado.')
    },
  })
}

export function useUpdateUser() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateUserPatch }) =>
      updateUser(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'users', user.id] })
      toast.success('Usuário atualizado.')
    },
  })
}

/** Atualiza o próprio perfil (nome/e-mail) — mesma origem de dados dos usuários. */
export function useUpdateProfile() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: UpdateUserPatch) => updateUser(user.id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'users', user.id] })
      toast.success('Perfil atualizado.')
    },
  })
}
