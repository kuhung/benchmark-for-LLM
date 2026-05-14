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
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
            <YAxis tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '2px solid var(--color-border)', borderRadius: 0, fontFamily: 'var(--font-mono)' }} />
            <Bar dataKey="median" name="P50" radius={[0, 0, 0, 0]}>
              {data.map(entry => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <ErrorBar dataKey="errorMargin" width={8} strokeWidth={2} stroke="var(--color-foreground)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
