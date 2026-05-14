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
    <div className="space-y-6">
      <div className="brutalist-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-block border-2 border-primary px-2 py-1 text-xs font-bold uppercase text-primary mb-3">
              Report
            </div>
            <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">BENCHMARK_RESULTS</h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              &gt; {session.results.length} ENDPOINTS | {session.config.repeatCount}x REPEATS | CONCURRENCY: {session.config.concurrencyLevels.join('/')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> SAVE_TO_HISTORY
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> EXPORT_JSON
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="border-2 border-border bg-background p-5 hover:border-cyan-500 transition-colors">
            <Timer className="mb-4 h-6 w-6 text-cyan-500" />
            <p className="text-xs font-bold uppercase text-muted-foreground">Best TTFT</p>
            <p className="mt-2 text-3xl font-bold text-foreground font-mono">{bestTtft.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">ms</span></p>
          </div>
          <div className="border-2 border-border bg-background p-5 hover:border-emerald-500 transition-colors">
            <Zap className="mb-4 h-6 w-6 text-emerald-500" />
            <p className="text-xs font-bold uppercase text-muted-foreground">Best TPS</p>
            <p className="mt-2 text-3xl font-bold text-foreground font-mono">{bestTps.toFixed(1)}</p>
          </div>
          <div className="border-2 border-primary bg-primary p-5 text-primary-foreground shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <Gauge className="mb-4 h-6 w-6 text-primary-foreground" />
            <p className="text-xs font-bold uppercase text-primary-foreground/80">Avg Success Rate</p>
            <p className="mt-2 text-3xl font-bold font-mono">{avgSuccess.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {session.results.some(r => r.score) && (
        <ChartRadar results={session.results} />
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartTTFT results={session.results} />
        <ChartTPS results={session.results} />
      </div>

      <ChartITL results={session.results} />
      <ChartThroughput results={session.results} />

      <div className="brutalist-border bg-card p-0">
        <div className="border-b-2 border-border bg-muted px-4 py-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-500" />
          <span className="font-bold uppercase tracking-widest text-sm">RAW_DATA_SUMMARY</span>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto border-2 border-border">
            <table className="w-full min-w-[720px] text-sm font-mono">
              <thead className="bg-muted border-b-2 border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase text-muted-foreground">Endpoint</th>
                  <th className="px-4 py-3 text-right font-bold uppercase text-muted-foreground">TTFT (ms)</th>
                  <th className="px-4 py-3 text-right font-bold uppercase text-muted-foreground">TPS</th>
                  <th className="px-4 py-3 text-right font-bold uppercase text-muted-foreground">ITL P95 (ms)</th>
                  <th className="px-4 py-3 text-right font-bold uppercase text-muted-foreground">E2E (ms)</th>
                  <th className="px-4 py-3 text-right font-bold uppercase text-muted-foreground">Success</th>
                </tr>
              </thead>
              <tbody>
                {session.results.map(r => (
                  <tr key={r.endpoint.id} className="border-b-2 border-border/50 last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-foreground">{r.endpoint.name}</td>
                    <td className="px-4 py-4 text-right">{r.singleConcurrency.ttft.median.toFixed(0)}</td>
                    <td className="px-4 py-4 text-right text-emerald-500">{r.singleConcurrency.tps.median.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right text-cyan-500">{r.singleConcurrency.itl.p95.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right">{r.singleConcurrency.e2eLatency.median.toFixed(0)}</td>
                    <td className="px-4 py-4 text-right font-bold">{r.singleConcurrency.successRate.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
