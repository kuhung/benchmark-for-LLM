'use client'

import { EndpointResult } from '@/lib/benchmark/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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
        <CardTitle>ITL 输出间隔分布 (ms)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 12, bottom: 10, left: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="p50" name="P50" fill="#0891b2" radius={[6, 6, 0, 0]} />
            <Bar dataKey="p95" name="P95" fill="#d97706" radius={[6, 6, 0, 0]} />
            <Bar dataKey="p99" name="P99" fill="#e11d48" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
