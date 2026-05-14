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
  ErrorBar,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#ccff00', '#00f0ff', '#ff0055', '#ff9900', '#b000ff']

interface ChartTTFTProps {
  results: EndpointResult[]
}

export function ChartTTFT({ results }: ChartTTFTProps) {
  const data = results.map((r, i) => ({
    name: r.endpoint.name,
    median: Number(r.singleConcurrency.ttft.median.toFixed(1)),
    p95: Number(r.singleConcurrency.ttft.p95.toFixed(1)),
    errorMargin: Number((r.singleConcurrency.ttft.p95 - r.singleConcurrency.ttft.median).toFixed(1)),
    fill: COLORS[i % COLORS.length],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>TTFT (ms)</CardTitle>
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
            <Bar dataKey="median" name="P50" radius={[2, 2, 0, 0]}>
              {data.map(entry => (
                <Cell key={entry.name} fill={entry.fill} fillOpacity={0.85} />
              ))}
              <ErrorBar dataKey="errorMargin" width={6} strokeWidth={2} stroke="var(--color-foreground)" strokeOpacity={0.4} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
