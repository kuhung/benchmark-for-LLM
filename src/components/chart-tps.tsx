'use client'

import { EndpointResult } from '@/lib/benchmark/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#ccff00', '#00f0ff', '#ff0055', '#ff9900', '#b000ff']

interface ChartTPSProps {
  results: EndpointResult[]
}

export function ChartTPS({ results }: ChartTPSProps) {
  const data = results.map((r, i) => ({
    name: r.endpoint.name,
    median: Number(r.singleConcurrency.tps.median.toFixed(1)),
    fill: COLORS[i % COLORS.length],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>TPS (tokens/s)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '2px solid var(--color-border)',
                borderRadius: 0,
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                boxShadow: '4px 4px 0px 0px var(--color-primary)',
              }}
            />
            <Bar dataKey="median" name="TPS (P50)" radius={[2, 2, 0, 0]}>
              {data.map(entry => (
                <Cell key={entry.name} fill={entry.fill} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
