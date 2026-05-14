'use client'

import { EndpointResult } from '@/lib/benchmark/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from 'recharts'

interface ChartITLProps {
  results: EndpointResult[]
}

export function ChartITL({ results }: ChartITLProps) {
  const data = results.map(result => ({
    name: result.endpoint.name,
    p50: Number(result.singleConcurrency.itl.median.toFixed(1)),
    p95: Number(result.singleConcurrency.itl.p95.toFixed(1)),
    p99: Number(result.singleConcurrency.itl.p99.toFixed(1)),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>ITL Distribution (ms)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 12, bottom: 10, left: 6 }}>
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
            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }} />
            <Bar dataKey="p50" name="P50" fill="#ccff00" fillOpacity={0.85} radius={[2, 2, 0, 0]} />
            <Bar dataKey="p95" name="P95" fill="#00f0ff" fillOpacity={0.85} radius={[2, 2, 0, 0]} />
            <Bar dataKey="p99" name="P99" fill="#ff0055" fillOpacity={0.85} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
