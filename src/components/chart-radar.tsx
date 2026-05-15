'use client'

import { EndpointResult } from '@/lib/benchmark/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { useI18n, TranslationKey } from '@/lib/i18n'

const ECHARTS_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

interface ChartRadarProps {
  results: EndpointResult[]
}

const DIMENSION_KEYS: { key: string; labelKey: TranslationKey; descKey: TranslationKey }[] = [
  { key: 'speed', labelKey: 'radarSpeed', descKey: 'radarSpeedDesc' },
  { key: 'responsiveness', labelKey: 'radarResponse', descKey: 'radarResponseDesc' },
  { key: 'smoothness', labelKey: 'radarSmooth', descKey: 'radarSmoothDesc' },
  { key: 'scalability', labelKey: 'radarScale', descKey: 'radarScaleDesc' },
  { key: 'stability', labelKey: 'radarStable', descKey: 'radarStableDesc' },
]

export function ChartRadar({ results }: ChartRadarProps) {
  const { t } = useI18n()

  const DIMENSIONS = DIMENSION_KEYS.map(d => ({
    key: d.key,
    label: t(d.labelKey),
    desc: t(d.descKey),
  }))

  const data = DIMENSIONS.map(dim => {
    const entry: Record<string, string | number> = { dimension: dim.label, _desc: dim.desc as string }
    results.forEach(r => {
      if (r.score) {
        const keyName = `${r.endpoint.name} (${r.endpoint.modelId})`
        entry[keyName] = r.score[dim.key as keyof typeof r.score]
      }
    })
    return entry
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span>{t('overallScore')}</span>
            {results.map(r => r.score && (
              <span key={r.endpoint.id} className="text-xs font-normal text-muted-foreground font-mono">
                {r.endpoint.name} ({r.endpoint.modelId}): <span className="text-foreground font-semibold">{r.score.overall}</span>
              </span>
            ))}
          </div>
          <span className="text-[11px] font-normal text-muted-foreground">
            {t('radarHigherIsBetter')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data}>
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
            {results.map((r, i) => {
              const keyName = `${r.endpoint.name} (${r.endpoint.modelId})`
              return (
                <Radar
                  key={r.endpoint.id}
                  name={keyName}
                  dataKey={keyName}
                  stroke={ECHARTS_COLORS[i % ECHARTS_COLORS.length]}
                  fill={ECHARTS_COLORS[i % ECHARTS_COLORS.length]}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              )
            })}
            <Tooltip
              content={({ payload, label }) => {
                if (!payload || payload.length === 0) return null
                const desc = String((payload[0]?.payload as Record<string, unknown>)?._desc ?? '')
                return (
                  <div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg text-xs font-mono">
                    <p className="font-semibold mb-1">{label}</p>
                    {desc && <p className="text-muted-foreground mb-1.5 text-[11px] max-w-[220px]">{String(desc)}</p>}
                    {payload.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-muted-foreground">{entry.name}:</span>
                        <span className="font-semibold tabular-nums">{String(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }} />
          </RadarChart>
        </ResponsiveContainer>
        {/* Dimension legend below chart */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-2">
          {DIMENSIONS.map(dim => (
            <div key={dim.key} className="text-center">
              <p className="text-[11px] font-medium">{dim.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{dim.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
