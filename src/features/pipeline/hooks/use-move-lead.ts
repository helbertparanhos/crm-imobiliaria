import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentUser } from '@/lib/dev-session'
import type { LeadStatus } from '@/types'

import { moveLead } from '../repo'
import type { BoardData, MoveLeadVars } from '../types'

/** Move um lead entre etapas com update otimista + revalidação. */
export function useMoveLead() {
  const queryClient = useQueryClient()
  const user = useCurrentUser()
  const boardKey = ['pipeline', 'board', user.id]

  return useMutation({
    mutationFn: ({ leadId, toStageId }: MoveLeadVars) => moveLead(leadId, toStageId),
    onMutate: async ({ leadId, toStageId }) => {
      await queryClient.cancelQueries({ queryKey: boardKey })
      const previous = queryClient.getQueryData<BoardData>(boardKey)
      if (previous) {
        const stage = previous.stages.find((s) => s.id === toStageId)
        const status: LeadStatus = stage?.isGanho
          ? 'ganho'
          : stage?.isPerdido
            ? 'perdido'
            : 'aberto'
        queryClient.setQueryData<BoardData>(boardKey, {
          ...previous,
          leads: previous.leads.map((l) =>
            l.id === leadId ? { ...l, stageId: toStageId, status } : l,
          ),
        })
      }
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardKey, context.previous)
      }
      toast.error('Não foi possível mover o lead.')
    },
    onSuccess: () => {
      toast.success('Lead movido de etapa.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKey })
    },
  })
}
