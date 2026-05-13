'use client'

import { BenchmarkSession } from '@/lib/benchmark/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartRadar } from '@/components/chart-radar'
import { ChartTTFT } from '@/components/chart-ttft'
import { ChartTPS } from '@/components/chart-tps'
import { ChartITL } from '@/components/chart-itl'
import { ChartThroughput } from '@/components/chart-throughput'
import { Download, Gauge, Save, Timer, TrendingUp, Zap } from 'lucide-react'
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

  const bestTps = Math.max(...session.results.map(r => r.singleConcurrency.tps.median))
  const bestTtft = Math.min(...session.results.map(r => r.singleConcurrency.ttft.median))
  const avgSuccess = session.results.reduce((sum, r) => sum + r.singleConcurrency.successRate, 0) / session.results.length

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm shadow-black/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Benchmark report</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">测评结果</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {session.results.length} 个端点，{session.config.repeatCount} 次重复，并发 {session.config.concurrencyLevels.join('/')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" /> 保存到历史
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" /> 导出 JSON
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <Timer className="mb-3 h-4 w-4 text-cyan-600" />
            <p className="text-xs font-bold uppercase text-muted-foreground">最佳 TTFT</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{bestTtft.toFixed(0)} ms</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <Zap className="mb-3 h-4 w-4 text-emerald-600" />
            <p className="text-xs font-bold uppercase text-muted-foreground">最佳 TPS</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{bestTps.toFixed(1)}</p>
          </div>
          <div className="rounded-lg border border-primary bg-primary p-4 text-white">
            <Gauge className="mb-3 h-4 w-4 text-sky-300" />
            <p className="text-xs font-bold uppercase text-primary-foreground/60">平均成功率</p>
            <p className="mt-1 text-2xl font-bold">{avgSuccess.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {session.results.some(r => r.score) && (
        <ChartRadar results={session.results} />
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartTTFT results={session.results} />
        <ChartTPS results={session.results} />
      </div>

      <ChartITL results={session.results} />
      <ChartThroughput results={session.results} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-600" />
            原始数据摘要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">端点</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">TTFT (ms)</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">TPS</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">ITL P95 (ms)</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">E2E (ms)</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">成功率</th>
                </tr>
              </thead>
              <tbody>
                {session.results.map(r => (
                  <tr key={r.endpoint.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 font-semibold text-foreground">{r.endpoint.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.singleConcurrency.ttft.median.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.singleConcurrency.tps.median.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.singleConcurrency.itl.p95.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.singleConcurrency.e2eLatency.median.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{r.singleConcurrency.successRate.toFixed(0)}%</td>
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
