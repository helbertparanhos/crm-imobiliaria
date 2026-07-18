import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  /** Texto auxiliar abaixo do valor (ex.: "3 atrasadas"). */
  hint?: string
  /** Destaque de cor do valor (ex.: alerta para atrasadas). */
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

const TONE_CLASSES = {
  default: 'text-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
} as const

export function KpiCard({ title, value, icon: Icon, hint, tone = 'default' }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', TONE_CLASSES[tone])}>{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
