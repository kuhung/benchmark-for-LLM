'use client'

import { BenchmarkProgress } from '@/lib/benchmark/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Loader2, XCircle } from 'lucide-react'

interface RunProgressProps {
  progress: BenchmarkProgress
  onCancel: () => void
}

export function RunProgress({ progress, onCancel }: RunProgressProps) {
  if (progress.status !== 'running') return null

  const percent = progress.totalTasks > 0
    ? Math.round((progress.completedTasks / progress.totalTasks) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="mx-4 w-full max-w-md space-y-6 border-2 border-primary bg-card p-6 shadow-[8px_8px_0px_0px_var(--color-primary)]">
        <div className="flex items-center gap-3 border-b-2 border-border pb-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <h3 className="text-lg font-bold uppercase tracking-widest">Running Benchmark</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase font-mono">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="h-4 w-full border-2 border-border bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="text-sm font-mono text-muted-foreground space-y-2">
          <p className="flex justify-between border-b border-border/50 pb-1">
            <span>Tasks</span>
            <span className="text-foreground">{progress.completedTasks} / {progress.totalTasks}</span>
          </p>
          {progress.currentEndpoint && (
            <p className="flex justify-between border-b border-border/50 pb-1">
              <span>Endpoint</span>
              <span className="text-foreground font-bold">{progress.currentEndpoint}</span>
            </p>
          )}
          {progress.currentRound && progress.totalRounds && (
            <p className="flex justify-between border-b border-border/50 pb-1">
              <span>Round</span>
              <span className="text-foreground">{progress.currentRound} / {progress.totalRounds}</span>
            </p>
          )}
          {progress.currentConcurrency && (
            <p className="flex justify-between border-b border-border/50 pb-1">
              <span>Concurrency</span>
              <span className="text-primary font-bold">{progress.currentConcurrency}x</span>
            </p>
          )}
          {progress.liveMetrics && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              {typeof progress.liveMetrics.ttft === 'number' && (
                <div className="border-2 border-border bg-background p-3">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Live TTFT</p>
                  <p className="text-lg text-foreground font-bold">{progress.liveMetrics.ttft.toFixed(0)} <span className="text-xs font-normal">ms</span></p>
                </div>
              )}
              {typeof progress.liveMetrics.tps === 'number' && (
                <div className="border-2 border-border bg-background p-3">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Live TPS</p>
                  <p className="text-lg text-foreground font-bold">{progress.liveMetrics.tps.toFixed(1)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Button variant="destructive" size="lg" onClick={onCancel} className="w-full">
          <XCircle className="h-5 w-5 mr-2" /> ABORT_RUN
        </Button>
      </div>
    </div>
  )
}
