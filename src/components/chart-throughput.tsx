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

const COLORS = ['#a3e635', '#38bdf8', '#f472b6', '#fb923c', '#a78bfa']

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

  const tooltipStyle = {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Concurrency Scaling</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs text-muted-foreground">TPS vs Concurrency</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="concurrency"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }} />
                {results.map((r, i) => (
                  <Line
                    key={r.endpoint.id}
                    type="monotone"
                    dataKey={`${r.endpoint.name}_tps`}
                    name={r.endpoint.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-background)', fill: COLORS[i % COLORS.length] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="mb-3 text-xs text-muted-foreground">TTFT vs Concurrency (ms)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="concurrency"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }} />
                {results.map((r, i) => (
                  <Line
                    key={r.endpoint.id}
                    type="monotone"
                    dataKey={`${r.endpoint.name}_ttft`}
                    name={r.endpoint.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-background)', fill: COLORS[i % COLORS.length] }}
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
