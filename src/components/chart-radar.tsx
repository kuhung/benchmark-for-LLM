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

const COLORS = ['#0891b2', '#059669', '#e11d48', '#d97706', '#7c3aed']
const DIMENSIONS = [
  { key: 'speed', label: 'Speed' },
  { key: 'responsiveness', label: 'Responsiveness' },
  { key: 'smoothness', label: 'Smoothness' },
  { key: 'scalability', label: 'Scalability' },
  { key: 'stability', label: 'Stability' },
]

interface ChartRadarProps {
  results: EndpointResult[]
}

export function ChartRadar({ results }: ChartRadarProps) {
  const data = DIMENSIONS.map(dim => {
    const entry: Record<string, string | number> = { dimension: dim.label }
    results.forEach(r => {
      if (r.score) {
        entry[r.endpoint.name] = r.score[dim.key as keyof typeof r.score]
      }
    })
    return entry
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          综合评分
          {results.map(r => r.score && (
            <span key={r.endpoint.id} className="text-sm font-normal text-muted-foreground">
              {r.endpoint.name}: {r.score.overall}分
            </span>
          ))}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data}>
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            {results.map((r, i) => (
              <Radar
                key={r.endpoint.id}
                name={r.endpoint.name}
                dataKey={r.endpoint.name}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
