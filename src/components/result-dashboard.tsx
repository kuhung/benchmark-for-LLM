'use client'

import { BenchmarkSession } from '@/lib/benchmark/types'
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

  const stats = [
    {
      icon: Timer,
      label: 'Best TTFT',
      value: `${bestTtft.toFixed(0)}`,
      unit: 'ms',
      color: 'text-[#00f0ff]',
      borderHover: 'hover:border-[#00f0ff]/40',
      glow: 'hover:shadow-[0_0_20px_rgba(0,240,255,0.06)]',
    },
    {
      icon: Zap,
      label: 'Best TPS',
      value: `${bestTps.toFixed(1)}`,
      unit: 't/s',
      color: 'text-emerald-400',
      borderHover: 'hover:border-emerald-400/40',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.06)]',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="brutalist-border bg-card p-6 sm:p-8 relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/15 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-primary/15 pointer-events-none" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 border-2 border-primary/60 px-2.5 py-1 text-xs font-bold uppercase text-primary mb-3 bg-primary/5">
              <span className="h-1.5 w-1.5 bg-primary" />
              Report
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
              BENCHMARK<span className="text-primary">_</span>RESULTS
            </h2>
            <p className="mt-2 font-mono text-xs text-muted-foreground/60 tracking-wider">
              <span className="text-primary/60">&gt;</span> {session.results.length} ENDPOINTS | {session.config.repeatCount}x REPEATS | CONC: {session.config.concurrencyLevels.join('/')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} className="text-[10px] h-8">
              <Save className="h-3.5 w-3.5 mr-1.5" /> SAVE
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="text-[10px] h-8">
              <Download className="h-3.5 w-3.5 mr-1.5" /> EXPORT
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`border-2 border-border bg-background/50 p-5 transition-all duration-300 ${stat.borderHover} ${stat.glow} animate-fade-in-up`}
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <stat.icon className={`mb-3 h-5 w-5 ${stat.color}`} />
              <p className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wider">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-foreground font-mono tabular-nums">
                {stat.value}
                <span className="text-xs font-normal text-muted-foreground/40 ml-1">{stat.unit}</span>
              </p>
            </div>
          ))}
          <div
            className="border-2 border-primary bg-primary p-5 text-primary-foreground shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <Gauge className="mb-3 h-5 w-5" />
            <p className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Avg Success</p>
            <p className="mt-2 text-3xl font-bold font-mono tabular-nums">{avgSuccess.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Radar */}
      {session.results.some(r => r.score) && (
        <div className="animate-fade-in-up delay-200">
          <ChartRadar results={session.results} />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="animate-fade-in-up delay-300">
          <ChartTTFT results={session.results} />
        </div>
        <div className="animate-fade-in-up delay-400">
          <ChartTPS results={session.results} />
        </div>
      </div>

      <div className="animate-fade-in-up delay-500">
        <ChartITL results={session.results} />
      </div>

      <div className="animate-fade-in-up delay-600">
        <ChartThroughput results={session.results} />
      </div>

      {/* Raw Data Table */}
      <div className="brutalist-border bg-card p-0 animate-fade-in-up delay-700">
        <div className="terminal-header">
          <span className="terminal-dot bg-[#ff5f57]" />
          <span className="terminal-dot bg-[#febc2e]" />
          <span className="terminal-dot bg-[#28c840]" />
          <div className="ml-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#00f0ff]" />
            <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">RAW_DATA</span>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto border-2 border-border/60">
            <table className="data-table w-full min-w-[720px] text-sm font-mono">
              <thead className="bg-muted/50 border-b-2 border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wider">Endpoint</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wider">TTFT (ms)</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wider">TPS</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wider">ITL P95 (ms)</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wider">E2E (ms)</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wider">Success</th>
                </tr>
              </thead>
              <tbody>
                {session.results.map(r => (
                  <tr key={r.endpoint.id} className="border-b border-border/30 last:border-0 transition-colors">
                    <td className="px-4 py-4 font-bold text-foreground">{r.endpoint.name}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{r.singleConcurrency.ttft.median.toFixed(0)}</td>
                    <td className="px-4 py-4 text-right tabular-nums text-emerald-400">{r.singleConcurrency.tps.median.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right tabular-nums text-[#00f0ff]">{r.singleConcurrency.itl.p95.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{r.singleConcurrency.e2eLatency.median.toFixed(0)}</td>
                    <td className="px-4 py-4 text-right font-bold tabular-nums">{r.singleConcurrency.successRate.toFixed(0)}%</td>
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
