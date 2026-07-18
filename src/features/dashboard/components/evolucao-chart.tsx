import { LineChart as LineChartIcon } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { EvolucaoPonto } from '../types'

interface EvolucaoChartProps {
  data: EvolucaoPonto[]
}

const AXIS_TICK = { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
const COLOR_CRIADOS = '#0ea5e9'
const COLOR_GANHOS = '#22c55e'

/** Evolução no período: leads criados vs. ganhos, agregados por dia ou semana. */
export function EvolucaoChart({ data }: EvolucaoChartProps) {
  const hasData = data.some((d) => d.criados > 0 || d.ganhos > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução no período</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="fillCriados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_CRIADOS} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLOR_CRIADOS} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillGanhos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_GANHOS} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLOR_GANHOS} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="periodo" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: 12,
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="criados"
                name="Leads criados"
                stroke={COLOR_CRIADOS}
                fill="url(#fillCriados)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="ganhos"
                name="Leads ganhos"
                stroke={COLOR_GANHOS}
                fill="url(#fillGanhos)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={LineChartIcon}
            title="Sem movimentação"
            description="Nenhum lead criado ou ganho no período selecionado."
          />
        )}
      </CardContent>
    </Card>
  )
}
