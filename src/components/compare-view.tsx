'use client'

import { BenchmarkSession, EndpointResult } from '@/lib/benchmark/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#a3e635', '#38bdf8', '#f472b6', '#fb923c', '#a78bfa', '#e879f9', '#34d399', '#fbbf24']

interface CompareViewProps {
  sessions: BenchmarkSession[]
}

function sessionLabel(session: BenchmarkSession): string {
  return new Date(session.timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function flattenResults(sessions: BenchmarkSession[]): { label: string; result: EndpointResult; sessionIdx: number }[] {
  const items: { label: string; result: EndpointResult; sessionIdx: number }[] = []
  sessions.forEach((session, sessionIdx) => {
    for (const result of session.results) {
      const label = `${result.endpoint.name} (${sessionLabel(session)})`
      items.push({ label, result, sessionIdx })
    }
  })
  return items
}

const tooltipStyle = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
}

export function CompareView({ sessions }: CompareViewProps) {
  const items = flattenResults(sessions)

  const ttftData = items.map(({ label, result, sessionIdx }) => ({
    name: label,
    value: Number(result.singleConcurrency.ttft.median.toFixed(1)),
    fill: COLORS[sessionIdx % COLORS.length],
  }))

  const tpsData = items.map(({ label, result, sessionIdx }) => ({
    name: label,
    value: Number(result.singleConcurrency.tps.median.toFixed(1)),
    fill: COLORS[sessionIdx % COLORS.length],
  }))

  const successData = items.map(({ label, result, sessionIdx }) => ({
    name: label,
    value: Number(result.singleConcurrency.successRate.toFixed(1)),
    fill: COLORS[sessionIdx % COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Session Comparison</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Comparing {sessions.length} sessions / {items.length} endpoints
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sessions.map((s, i) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-mono"
              style={{ backgroundColor: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {sessionLabel(s)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CompareBarChart title="TTFT Comparison (ms)" data={ttftData} />
        <CompareBarChart title="TPS Comparison (t/s)" data={tpsData} />
      </div>
      <CompareBarChart title="Success Rate (%)" data={successData} />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Detailed Comparison</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table w-full min-w-[700px] text-sm font-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Session</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Endpoint</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">TTFT P50</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">TPS P50</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">ITL P95</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">E2E P50</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Success</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ label, result, sessionIdx }) => (
                <tr key={label} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-3">
                    <span
                      className="inline-block h-2 w-2 rounded-full mr-1.5"
                      style={{ backgroundColor: COLORS[sessionIdx % COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground">{sessionLabel(sessions[sessionIdx])}</span>
                  </td>
                  <td className="px-3 py-3 font-medium">{result.endpoint.name}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{result.singleConcurrency.ttft.median.toFixed(0)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{result.singleConcurrency.tps.median.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{result.singleConcurrency.itl.p95.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{result.singleConcurrency.e2eLatency.median.toFixed(0)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{result.singleConcurrency.successRate.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CompareBarChart({ title, data }: { title: string; data: { name: string; value: number; fill: string }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              {data.map((entry, idx) => (
                <rect key={idx} fill={entry.fill} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
