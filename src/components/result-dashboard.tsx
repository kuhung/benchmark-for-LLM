'use client'

import { BenchmarkSession } from '@/lib/benchmark/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartRadar } from '@/components/chart-radar'
import { ChartTTFT } from '@/components/chart-ttft'
import { ChartTPS } from '@/components/chart-tps'
import { ChartThroughput } from '@/components/chart-throughput'
import { Download, Save } from 'lucide-react'
import { saveSession, exportSession } from '@/lib/store'

interface ResultDashboardProps {
  session: BenchmarkSession
  onSaved?: () => void
}

export function ResultDashboard({ session, onSaved }: ResultDashboardProps) {
  const handleExport = async () => {
    const json = await exportSession(session)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-${new Date(session.timestamp).toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    await saveSession(session)
    onSaved?.()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">测评结果</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4" /> 保存到历史
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" /> 导出 JSON
          </Button>
        </div>
      </div>

      {session.results.some(r => r.score) && (
        <ChartRadar results={session.results} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartTTFT results={session.results} />
        <ChartTPS results={session.results} />
      </div>

      <ChartThroughput results={session.results} />

      <Card>
        <CardHeader>
          <CardTitle>原始数据摘要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">端点</th>
                  <th className="text-right py-2 px-3 font-medium">TTFT (ms)</th>
                  <th className="text-right py-2 px-3 font-medium">TPS</th>
                  <th className="text-right py-2 px-3 font-medium">ITL P95 (ms)</th>
                  <th className="text-right py-2 px-3 font-medium">E2E (ms)</th>
                  <th className="text-right py-2 px-3 font-medium">成功率</th>
                </tr>
              </thead>
              <tbody>
                {session.results.map(r => (
                  <tr key={r.endpoint.id} className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium">{r.endpoint.name}</td>
                    <td className="text-right py-2 px-3">{r.singleConcurrency.ttft.median.toFixed(0)}</td>
                    <td className="text-right py-2 px-3">{r.singleConcurrency.tps.median.toFixed(1)}</td>
                    <td className="text-right py-2 px-3">{r.singleConcurrency.itl.p95.toFixed(1)}</td>
                    <td className="text-right py-2 px-3">{r.singleConcurrency.e2eLatency.median.toFixed(0)}</td>
                    <td className="text-right py-2 px-3">{r.singleConcurrency.successRate.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
