'use client'

import { BenchmarkSession } from '@/lib/benchmark/types'
import { Button } from '@/components/ui/button'
import { ChartRadar } from '@/components/chart-radar'
import { ChartTTFT } from '@/components/chart-ttft'
import { ChartTPS } from '@/components/chart-tps'
import { ChartITL } from '@/components/chart-itl'
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

  const bestTps = Math.max(...session.results.map(r => r.singleConcurrency.tps.median))
  const bestTtft = Math.min(...session.results.map(r => r.singleConcurrency.ttft.median))
  const avgSuccess = session.results.reduce((sum, r) => sum + r.singleConcurrency.successRate, 0) / session.results.length

  return (
    <div className="space-y-6">
      {/* 头部：关键指标一目了然 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold">Results</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {session.results.length} endpoints / {session.config.repeatCount}x repeats / concurrency {session.config.concurrencyLevels.join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export
            </Button>
          </div>
        </div>

        {/* 核心指标卡片：用户第一眼看到最重要的数字 */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-muted p-4">
            <p className="text-xs text-muted-foreground">Best TTFT</p>
            <p className="text-2xl font-semibold font-mono tabular-nums mt-1">
              {bestTtft.toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground ml-1">ms</span>
            </p>
          </div>
          <div className="rounded-md bg-muted p-4">
            <p className="text-xs text-muted-foreground">Best TPS</p>
            <p className="text-2xl font-semibold font-mono tabular-nums mt-1">
              {bestTps.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">t/s</span>
            </p>
          </div>
          <div className="rounded-md bg-primary/10 border border-primary/20 p-4">
            <p className="text-xs text-primary/70">Avg Success</p>
            <p className="text-2xl font-semibold font-mono tabular-nums mt-1 text-primary">
              {avgSuccess.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Radar */}
      {session.results.some(r => r.score) && (
        <ChartRadar results={session.results} />
      )}

      {/* Charts: 两列布局，对比清晰 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartTTFT results={session.results} />
        <ChartTPS results={session.results} />
      </div>

      <ChartITL results={session.results} />
      <ChartThroughput results={session.results} />

      {/* 原始数据表 */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Raw Data</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="data-table w-full min-w-[640px] text-sm font-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Endpoint</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">TTFT (ms)</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">TPS</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">ITL P95 (ms)</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">E2E (ms)</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Success</th>
              </tr>
            </thead>
            <tbody>
              {session.results.map(r => (
                <tr key={r.endpoint.id} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-3 font-medium text-foreground">{r.endpoint.name}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{r.singleConcurrency.ttft.median.toFixed(0)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-primary">{r.singleConcurrency.tps.median.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{r.singleConcurrency.itl.p95.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{r.singleConcurrency.e2eLatency.median.toFixed(0)}</td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">{r.singleConcurrency.successRate.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
