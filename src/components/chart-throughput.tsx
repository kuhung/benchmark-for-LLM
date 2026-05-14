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

const COLORS = ['#ccff00', '#00f0ff', '#ff0055', '#ff9900', '#b000ff']

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
        <CardTitle>Concurrency Degradation</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="border-2 border-border bg-background p-4">
            <p className="mb-4 text-xs font-bold uppercase text-muted-foreground border-b-2 border-border pb-2">TPS vs Concurrency</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="concurrency" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '2px solid var(--color-border)', borderRadius: 0, fontFamily: 'var(--font-mono)' }} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
                {results.map((r, i) => (
                  <Line
                    key={r.endpoint.id}
                    type="step"
                    dataKey={`${r.endpoint.name}_tps`}
                    name={r.endpoint.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={3}
                    dot={{ r: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="border-2 border-border bg-background p-4">
            <p className="mb-4 text-xs font-bold uppercase text-muted-foreground border-b-2 border-border pb-2">TTFT vs Concurrency (ms)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="concurrency" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '2px solid var(--color-border)', borderRadius: 0, fontFamily: 'var(--font-mono)' }} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
                {results.map((r, i) => (
                  <Line
                    key={r.endpoint.id}
                    type="step"
                    dataKey={`${r.endpoint.name}_ttft`}
                    name={r.endpoint.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={3}
                    dot={{ r: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
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
