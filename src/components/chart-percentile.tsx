'use client'

import { EndpointResult, StatsSummary } from '@/lib/benchmark/types'
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

const ECHARTS_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

import { useI18n } from '@/lib/i18n'

interface ChartPercentileProps {
  results: EndpointResult[]
}

const PERCENTILE_LABELS = ['P50', 'P75', 'P90', 'P95', 'P99']

function extractPercentiles(stats: StatsSummary): number[] {
  return [
    stats.median,
    stats.p75 ?? stats.median,
    stats.p90 ?? stats.p95,
    stats.p95,
    stats.p99,
  ]
}

export function ChartPercentile({ results }: ChartPercentileProps) {
  const { t } = useI18n()
  const data = PERCENTILE_LABELS.map((label, i) => {
    const entry: Record<string, string | number> = { percentile: label }
    for (const r of results) {
      const ttftPercentiles = extractPercentiles(r.singleConcurrency.ttft)
      const keyName = `${r.endpoint.name} (${r.endpoint.modelId})`
      entry[keyName] = Number(ttftPercentiles[i].toFixed(1))
    }
    return entry
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('percentileChartTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 12, bottom: 10, left: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="percentile"
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--foreground)', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }} />
            {results.map((r, i) => {
              const keyName = `${r.endpoint.name} (${r.endpoint.modelId})`
              return (
                  <Line
                  key={r.endpoint.id}
                  type="stepAfter"
                  dataKey={keyName}
                  stroke={ECHARTS_COLORS[i % ECHARTS_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0, fill: ECHARTS_COLORS[i % ECHARTS_COLORS.length] }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--background)', fill: ECHARTS_COLORS[i % ECHARTS_COLORS.length] }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
