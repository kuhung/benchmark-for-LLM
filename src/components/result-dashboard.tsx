'use client'

import { BenchmarkSession } from '@/lib/benchmark/types'
import { Button } from '@/components/ui/button'
import { ChartRadar } from '@/components/chart-radar'
import { ChartTTFT } from '@/components/chart-ttft'
import { ChartTPS } from '@/components/chart-tps'
import { ChartITL } from '@/components/chart-itl'
import { ChartThroughput } from '@/components/chart-throughput'
import { ChartPercentile } from '@/components/chart-percentile'
import { Download, Check, FileSpreadsheet, FileText } from 'lucide-react'
import { exportSession } from '@/lib/store'
import { exportCSV } from '@/lib/export-csv'
import { generateMarkdownReport } from '@/lib/report'
import { RawDataTable } from '@/components/raw-data-table'
import { useI18n } from '@/lib/i18n'

interface ResultDashboardProps {
  session: BenchmarkSession
}

export function ResultDashboard({ session }: ResultDashboardProps) {
  const { t } = useI18n()

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

  const handleExportCSV = () => {
    const csv = exportCSV(session)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-${new Date(session.timestamp).toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportMarkdown = () => {
    const md = generateMarkdownReport(session)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-${new Date(session.timestamp).toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
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
            <h2 className="text-base font-semibold">{t('results')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {session.results.length} {t('endpointCount')} / {session.config.repeatCount} {t('repeats')} / {t('concurrency')} {session.config.concurrencyLevels.join(', ')}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> {t('autoSaved')}
            </span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportMarkdown}>
              <FileText className="h-3.5 w-3.5 mr-1.5" /> {t('report')}
            </Button>
          </div>
        </div>

        {/* 核心指标卡片：用户第一眼看到最重要的数字 */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-muted p-4">
            <p className="text-xs text-muted-foreground">{t('bestTtft')}</p>
            <p className="text-2xl font-semibold font-mono tabular-nums mt-1">
              {bestTtft.toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground ml-1">ms</span>
            </p>
          </div>
          <div className="rounded-md bg-muted p-4">
            <p className="text-xs text-muted-foreground">{t('bestTps')}</p>
            <p className="text-2xl font-semibold font-mono tabular-nums mt-1">
              {bestTps.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">t/s</span>
            </p>
          </div>
          <div className="rounded-md bg-muted p-4">
            <p className="text-xs text-muted-foreground">{t('avgSuccess')}</p>
            <p className="text-2xl font-semibold font-mono tabular-nums mt-1">
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
      <ChartPercentile results={session.results} />
      <ChartThroughput results={session.results} />

      {/* 原始数据表 -- 动态颜色高亮 */}
      <RawDataTable results={session.results} />
    </div>
  )
}
