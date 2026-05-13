'use client'

import { EndpointResult } from '@/lib/benchmark/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea']

interface ChartThroughputProps {
  results: EndpointResult[]
}

export function ChartThroughput({ results }: ChartThroughputProps) {
  const allConcurrencies = [...new Set(results.flatMap(r => r.concurrencyResults.map(c => c.concurrency)))].sort((a, b) => a - b)

  const data = allConcurrencies.map(concurrency => {
    const entry: Record<string, number | string> = { concurrency: `${concurrency}x` }
    results.forEach(r => {
      const cr = r.concurrencyResults.find(c => c.concurrency === concurrency)
      if (cr) {
        entry[`${r.endpoint.name}_tps`] = Number(cr.metrics.tps.median.toFixed(1))
        entry[`${r.endpoint.name}_ttft`] = Number(cr.metrics.ttft.median.toFixed(0))
      }
    })
    return entry
  })

  if (allConcurrencies.length < 2) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>并发退化曲线</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">TPS vs 并发数</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="concurrency" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {results.map((r, i) => (
                  <Line
                    key={r.endpoint.id}
                    type="monotone"
                    dataKey={`${r.endpoint.name}_tps`}
                    name={r.endpoint.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">TTFT vs 并发数 (ms)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="concurrency" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {results.map((r, i) => (
                  <Line
                    key={r.endpoint.id}
                    type="monotone"
                    dataKey={`${r.endpoint.name}_ttft`}
                    name={r.endpoint.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
