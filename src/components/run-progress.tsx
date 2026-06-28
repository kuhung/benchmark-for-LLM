'use client'

import { BenchmarkProgress } from '@/lib/benchmark/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, XCircle, AlertTriangle, RotateCcw, BookOpen } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface RunProgressProps {
  progress: BenchmarkProgress
  onCancel: () => void
  onRetry?: () => void
  onDismiss?: () => void
  onViewCorsGuide?: () => void
}

export function RunProgress({ progress, onCancel, onRetry, onDismiss, onViewCorsGuide }: RunProgressProps) {
  const { t } = useI18n()

  if (progress.status === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
        <div className="mx-4 w-full max-w-sm rounded-lg border border-destructive/30 bg-card p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <h3 className="text-sm font-semibold">{t('benchmarkFailed')}</h3>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('benchmarkFailedDesc')}
          </p>

          {progress.errorMessage && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-xs text-destructive font-mono break-words max-h-28 overflow-y-auto">
              {progress.errorMessage}
            </div>
          )}

          <button
            onClick={onViewCorsGuide}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <BookOpen className="h-3.5 w-3.5" /> {t('viewCorsGuide')}
          </button>

          <div className="flex gap-2">
            <Button variant="default" size="default" onClick={onRetry} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-1.5" /> {t('retry')}
            </Button>
            <Button variant="outline" size="default" onClick={onDismiss} className="flex-1">
              {t('dismiss')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (progress.status !== 'running') return null

  const percent = progress.totalTasks > 0
    ? Math.round((progress.completedTasks / progress.totalTasks) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <h3 className="text-sm font-semibold">{t('runningBenchmark')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {progress.completedTasks} / {progress.totalTasks} {t('tasks')}
            </p>
          </div>
          <span className="ml-auto text-sm font-mono font-semibold text-primary">{percent}%</span>
        </div>

        <Progress value={percent} />

        <div className="text-xs text-muted-foreground space-y-1.5 font-mono">
          {progress.currentEndpoint && (
            <div className="flex justify-between">
              <span>{t('endpoint')}</span>
              <span className="text-foreground font-medium">{progress.currentEndpoint}</span>
            </div>
          )}
          {progress.currentRound && progress.totalRounds && (
            <div className="flex justify-between">
              <span>{t('round')}</span>
              <span className="text-foreground">{progress.currentRound} / {progress.totalRounds}</span>
            </div>
          )}
          {progress.currentConcurrency && (
            <div className="flex justify-between">
              <span>{t('concurrency')}</span>
              <span className="text-primary font-medium">{progress.currentConcurrency}x</span>
            </div>
          )}
        </div>

        {progress.liveMetrics && (
          <div className="grid grid-cols-2 gap-3">
            {typeof progress.liveMetrics.ttft === 'number' && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-[11px] text-muted-foreground">TTFT</p>
                <p className="text-lg font-semibold font-mono tabular-nums mt-0.5">
                  {progress.liveMetrics.ttft.toFixed(0)}
                  <span className="text-xs font-normal text-muted-foreground ml-0.5">ms</span>
                </p>
              </div>
            )}
            {typeof progress.liveMetrics.tps === 'number' && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-[11px] text-muted-foreground">TPS</p>
                <p className="text-lg font-semibold font-mono tabular-nums mt-0.5">
                  {progress.liveMetrics.tps.toFixed(1)}
                  <span className="text-xs font-normal text-muted-foreground ml-0.5">t/s</span>
                </p>
              </div>
            )}
          </div>
        )}

        <Button variant="destructive" size="default" onClick={onCancel} className="w-full">
          <XCircle className="h-4 w-4 mr-1.5" /> {t('cancel')}
        </Button>
      </div>
    </div>
  )
}
