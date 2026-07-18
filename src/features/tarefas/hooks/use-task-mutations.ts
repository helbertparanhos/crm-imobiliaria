/** Hooks de escrita (mutations) da feature Tarefas. */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createTask, deleteTask, toggleTask, updateTask } from '../repo'
import type { TaskInput } from '../types'

/** Invalida todas as queries de tarefas (lista/timeline) após uma mutação. */
function useInvalidateTasks() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: (input: TaskInput) => createTask(input),
    onSuccess: () => {
      invalidate()
      toast.success('Tarefa criada.')
    },
    onError: () => toast.error('Não foi possível criar a tarefa.'),
  })
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskInput }) =>
      updateTask(id, input),
    onSuccess: () => {
      invalidate()
      toast.success('Tarefa atualizada.')
    },
    onError: () => toast.error('Não foi possível atualizar a tarefa.'),
  })
}

export function useToggleTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: (id: string) => toggleTask(id),
    onSuccess: (task) => {
      invalidate()
      toast.success(
        task.status === 'concluida'
          ? 'Tarefa concluída.'
          : 'Tarefa reaberta.',
      )
    },
    onError: () => toast.error('Não foi possível atualizar a tarefa.'),
  })
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      invalidate()
      toast.success('Tarefa excluída.')
    },
    onError: () => toast.error('Não foi possível excluir a tarefa.'),
  })
}
