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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { useI18n, TranslationKey } from '@/lib/i18n'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

interface CompareViewProps {
  sessions: BenchmarkSession[]
}

function sessionLabel(session: BenchmarkSession, lang: string): string {
  const models = session.results.map(r => r.endpoint.modelId).join(', ')
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'
  const time = new Date(session.timestamp).toLocaleString(locale, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${models} (${time})`
}

function flattenResults(sessions: BenchmarkSession[], lang: string): { label: string; result: EndpointResult; sessionIdx: number }[] {
  const items: { label: string; result: EndpointResult; sessionIdx: number }[] = []
  sessions.forEach((session, sessionIdx) => {
    for (const result of session.results) {
      const label = `${result.endpoint.name} (${sessionLabel(session, lang)})`
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

const RADAR_DIMENSION_KEYS: { key: string; labelKey: TranslationKey }[] = [
  { key: 'speed', labelKey: 'radarSpeed' },
  { key: 'responsiveness', labelKey: 'radarResponse' },
  { key: 'smoothness', labelKey: 'radarSmooth' },
  { key: 'scalability', labelKey: 'radarScale' },
  { key: 'stability', labelKey: 'radarStable' },
]

export function CompareView({ sessions }: CompareViewProps) {
  const { t, lang } = useI18n()
  const items = flattenResults(sessions, lang)

  const hasRadarScores = items.some(({ result }) => result.score)
  const hasColdStart = items.some(({ result }) => result.coldStartTtft != null)

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

  const itlData = items.map(({ label, result, sessionIdx }) => ({
    name: label,
    value: Number(result.singleConcurrency.itl.p95.toFixed(1)),
    fill: COLORS[sessionIdx % COLORS.length],
  }))

  const e2eData = items.map(({ label, result, sessionIdx }) => ({
    name: label,
    value: Number(result.singleConcurrency.e2eLatency.median.toFixed(0)),
    fill: COLORS[sessionIdx % COLORS.length],
  }))

  const coldStartData = hasColdStart
    ? items
        .filter(({ result }) => result.coldStartTtft != null)
        .map(({ label, result, sessionIdx }) => ({
          name: label,
          value: Number(result.coldStartTtft!.toFixed(0)),
          fill: COLORS[sessionIdx % COLORS.length],
        }))
    : []

  const radarData = hasRadarScores
    ? RADAR_DIMENSION_KEYS.map(dim => {
        const entry: Record<string, string | number> = { dimension: t(dim.labelKey) }
        items.forEach(({ label, result }) => {
          if (result.score) {
            entry[label] = result.score[dim.key as keyof typeof result.score]
          }
        })
        return entry
      })
    : []

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-base font-semibold">{t('sessionComparison')}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('comparing')} {sessions.length} {t('sessions')} / {items.length} {t('endpointCount')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sessions.map((s, i) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-mono"
              style={{ backgroundColor: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length] }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {sessionLabel(s, lang)}
            </span>
          ))}
        </div>
      </div>

      {hasRadarScores && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-1.5">
              <span>{t('radarComparison')}</span>
              <div className="flex flex-wrap gap-3">
                {items.map(({ label, result }) => result.score && (
                  <span key={label} className="text-xs font-normal text-muted-foreground font-mono">
                    {label}: <span className="text-foreground font-semibold">{result.score.overall}</span>
                  </span>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" gridType="polygon" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--muted-foreground)' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                />
                {items.map(({ label, result, sessionIdx }) => result.score && (
                  <Radar
                    key={label}
                    name={label}
                    dataKey={label}
                    stroke={COLORS[sessionIdx % COLORS.length]}
                    fill={COLORS[sessionIdx % COLORS.length]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null
                    return (
                      <div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg text-xs font-mono">
                        <p className="font-semibold mb-1.5">{label}</p>
                        {payload.map((entry, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-muted-foreground truncate max-w-[180px]">{entry.name}:</span>
                            <span className="font-semibold tabular-nums">{String(entry.value)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.7 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CompareBarChart title={t('ttftComparison')} data={ttftData} />
        <CompareBarChart title={t('tpsComparison')} data={tpsData} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CompareBarChart title={t('itlComparison')} data={itlData} />
        <CompareBarChart title={t('e2eComparison')} data={e2eData} />
      </div>

      {hasColdStart && coldStartData.length > 0 && (
        <CompareBarChart title={t('coldStartComparison')} data={coldStartData} />
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">{t('detailedComparison')}</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table w-full min-w-[700px] text-sm font-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('session')}</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('endpoint')}</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('coldStartTtft')}</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('ttftP50')}</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('tpsP50')}</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('itlP95')}</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('e2eP50')}</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('score')}</th>
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
                    <span className="text-xs text-muted-foreground">{sessionLabel(sessions[sessionIdx], lang)}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-medium">{result.endpoint.name}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">{result.endpoint.modelId}</span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {result.coldStartTtft != null ? result.coldStartTtft.toFixed(0) : '-'}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{result.singleConcurrency.ttft.median.toFixed(0)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{result.singleConcurrency.tps.median.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{result.singleConcurrency.itl.p95.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{result.singleConcurrency.e2eLatency.median.toFixed(0)}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">
                    {result.score ? result.score.overall : '-'}
                  </td>
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
