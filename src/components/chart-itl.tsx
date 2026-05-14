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
        <CardTitle>ITL Distribution (ms)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 12, bottom: 10, left: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
            <YAxis tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '2px solid var(--color-border)', borderRadius: 0, fontFamily: 'var(--font-mono)' }} />
            <Bar dataKey="p50" name="P50" fill="#ccff00" radius={[0, 0, 0, 0]} />
            <Bar dataKey="p95" name="P95" fill="#00f0ff" radius={[0, 0, 0, 0]} />
            <Bar dataKey="p99" name="P99" fill="#ff0055" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
