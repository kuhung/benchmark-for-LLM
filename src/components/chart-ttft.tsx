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

const COLORS = ['#0891b2', '#059669', '#e11d48', '#d97706', '#7c3aed']

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
        <CardTitle>TTFT 首字延迟 (ms)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="median" name="P50" radius={[6, 6, 0, 0]}>
              {data.map(entry => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <ErrorBar dataKey="errorMargin" width={4} strokeWidth={1.5} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
