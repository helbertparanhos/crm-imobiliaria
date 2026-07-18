import { useQuery } from '@tanstack/react-query'

import { useCurrentUser } from '@/lib/auth'

import { getDashboard } from '../repo'
import type { DashboardData, DashboardPeriod } from '../types'

/**
 * Dados agregados da Dashboard. O `user.id` entra na queryKey para refazer o
 * fetch ao trocar de usuário (o escopo por papel muda o resultado).
 */
export function useDashboard(period: DashboardPeriod) {
  const user = useCurrentUser()
  return useQuery<DashboardData>({
    queryKey: ['dashboard', user.id, period],
    queryFn: () => getDashboard(period),
  })
}
