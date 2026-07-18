import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { PERIOD_OPTIONS } from '../types'
import type { DashboardPeriod } from '../types'

interface PeriodSelectProps {
  value: DashboardPeriod
  onChange: (value: DashboardPeriod) => void
}

/** Filtro de período do cabeçalho — afeta KPIs "no período" e o gráfico de evolução. */
export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as DashboardPeriod)}>
      <SelectTrigger className="w-[150px]" aria-label="Período">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
