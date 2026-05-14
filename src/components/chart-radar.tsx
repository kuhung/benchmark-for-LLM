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

const COLORS = ['#a3e635', '#38bdf8', '#f472b6', '#fb923c', '#a78bfa']
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
        entry[r.endpoint.name] = r.score[dim.key as keyof typeof r.score]
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
              {r.endpoint.name}: {r.score.overall}
            </span>
          ))}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="var(--color-border)" gridType="polygon" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
            />
            {results.map((r, i) => (
              <Radar
                key={r.endpoint.id}
                name={r.endpoint.name}
                dataKey={r.endpoint.name}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
