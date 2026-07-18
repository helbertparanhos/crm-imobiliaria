import { useQuery } from '@tanstack/react-query'

import { useCurrentUser } from '@/lib/auth'

import { getBoard } from '../repo'

/** Quadro kanban escopado pelo usuário atual. */
export function useBoard() {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['pipeline', 'board', user.id],
    queryFn: getBoard,
  })
}
