import { PieChart } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { LeadsPorEtapaPonto } from '../types'

interface LeadsPorEtapaChartProps {
  data: LeadsPorEtapaPonto[]
}

const AXIS_TICK = { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }

/** Distribuição atual de leads abertos por etapa, cada barra na cor da etapa. */
export function LeadsPorEtapaChart({ data }: LeadsPorEtapaChartProps) {
  const hasData = data.some((d) => d.quantidade > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leads por etapa</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="etapa" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: 12,
                }}
                formatter={(value) => [value, 'Leads abertos']}
              />
              <Bar dataKey="quantidade" name="Leads abertos" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.etapa} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={PieChart}
            title="Sem leads abertos"
            description="Não há leads abertos para exibir na distribuição por etapa."
          />
        )}
      </CardContent>
    </Card>
  )
}
