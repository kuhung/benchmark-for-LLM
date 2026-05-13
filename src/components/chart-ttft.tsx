'use client'

import { EndpointResult } from '@/lib/benchmark/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ErrorBar,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea']

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
            <Bar dataKey="median" name="P50">
              <ErrorBar dataKey="errorMargin" width={4} strokeWidth={1.5} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
