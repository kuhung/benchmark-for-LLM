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

const COLORS = ['#ccff00', '#00f0ff', '#ff0055', '#ff9900', '#b000ff']
const DIMENSIONS = [
  { key: 'speed', label: 'Speed' },
  { key: 'responsiveness', label: 'Response' },
  { key: 'smoothness', label: 'Smoothness' },
  { key: 'scalability', label: 'Scale' },
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
          Overall Score
          {results.map(r => r.score && (
            <span key={r.endpoint.id} className="text-sm font-normal text-muted-foreground ml-2 font-mono">
              [{r.endpoint.name}: {r.score.overall}]
            </span>
          ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data}>
            <PolarGrid stroke="var(--color-border)" gridType="polygon" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)', fill: 'var(--color-foreground)' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
            {results.map((r, i) => (
              <Radar
                key={r.endpoint.id}
                name={r.endpoint.name}
                dataKey={r.endpoint.name}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.2}
                strokeWidth={3}
              />
            ))}
            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
