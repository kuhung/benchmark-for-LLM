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
} from 'recharts'

const ECHARTS_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
const DIMENSIONS = [
  { key: 'speed', label: 'Speed' },
  { key: 'responsiveness', label: 'Response' },
  { key: 'smoothness', label: 'Smooth' },
  { key: 'scalability', label: 'Scale' },
  { key: 'stability', label: 'Stable' },
]

interface ChartRadarProps {
  results: EndpointResult[]
}

export function ChartRadar({ results }: ChartRadarProps) {
  const data = DIMENSIONS.map(dim => {
    const entry: Record<string, string | number> = { dimension: dim.label }
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
        <CardTitle>
          Overall Score
          {results.map(r => r.score && (
            <span key={r.endpoint.id} className="ml-3 text-xs font-normal text-muted-foreground font-mono">
              {r.endpoint.name} ({r.endpoint.modelId}): {r.score.overall}
            </span>
          ))}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
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
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              )
            })}
            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
