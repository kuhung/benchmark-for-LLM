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

const ECHARTS_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

import { useI18n } from '@/lib/i18n'

interface ChartThroughputProps {
  results: EndpointResult[]
}

export function ChartThroughput({ results }: ChartThroughputProps) {
  const { t } = useI18n()
  const allConcurrencies = [...new Set(results.flatMap(r => r.concurrencyResults.map(c => c.concurrency)))].sort((a, b) => a - b)

  const data = allConcurrencies.map(concurrency => {
    const entry: Record<string, number | string> = { concurrency: `${concurrency}x` }
    results.forEach(r => {
      const cr = r.concurrencyResults.find(c => c.concurrency === concurrency)
      if (cr) {
        const keyName = `${r.endpoint.name} (${r.endpoint.modelId})`
        entry[`${keyName}_tps`] = Number(cr.metrics.tps.median.toFixed(1))
        entry[`${keyName}_ttft`] = Number(cr.metrics.ttft.median.toFixed(0))
      }
    })
    return entry
  })

  if (allConcurrencies.length < 2) return null

  const tooltipStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
  }

  const tooltipLabelStyle = {
    color: 'var(--foreground)',
    marginBottom: '4px',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('throughputChartTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs text-muted-foreground">{t('throughputTpsVsConcurrency')}</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="concurrency"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }} />
                {results.map((r, i) => {
                  const keyName = `${r.endpoint.name} (${r.endpoint.modelId})`
                  return (
                    <Line
                      key={r.endpoint.id}
                      type="monotone"
                      dataKey={`${keyName}_tps`}
                      name={keyName}
                      stroke={ECHARTS_COLORS[i % ECHARTS_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 0, fill: ECHARTS_COLORS[i % ECHARTS_COLORS.length] }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--background)', fill: ECHARTS_COLORS[i % ECHARTS_COLORS.length] }}
                    />
                  )
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="mb-3 text-xs text-muted-foreground">{t('throughputTtftVsConcurrency')}</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="concurrency"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }} />
                {results.map((r, i) => {
                  const keyName = `${r.endpoint.name} (${r.endpoint.modelId})`
                  return (
                    <Line
                      key={r.endpoint.id}
                      type="monotone"
                      dataKey={`${keyName}_ttft`}
                      name={keyName}
                      stroke={ECHARTS_COLORS[i % ECHARTS_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 0, fill: ECHARTS_COLORS[i % ECHARTS_COLORS.length] }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--background)', fill: ECHARTS_COLORS[i % ECHARTS_COLORS.length] }}
                    />
                  )
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
