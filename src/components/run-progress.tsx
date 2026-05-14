'use client'

import { BenchmarkProgress } from '@/lib/benchmark/types'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-xl animate-fade-in">
      <div className="mx-4 w-full max-w-md space-y-6 border-2 border-primary bg-card p-6 shadow-[8px_8px_0px_0px_var(--color-primary)] relative overflow-hidden animate-fade-in-up delay-100">
        {/* Animated top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#00f0ff] pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#00f0ff] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#00f0ff] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#00f0ff] pointer-events-none" />

        <div className="flex items-center gap-3 border-b-2 border-border pb-4">
          <div className="relative">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="absolute inset-0 h-6 w-6 animate-ping opacity-20 text-primary">
              <Loader2 className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-[0.15em]">Running Benchmark</h3>
            <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider mt-0.5">SYS.EXEC // ACTIVE</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase font-mono">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary">{percent}%</span>
          </div>
          <div className="relative h-5 w-full border-2 border-border bg-muted/30 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out relative"
              style={{ width: `${percent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </div>
            {/* Scan line */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-primary/60 transition-all duration-500 ease-out"
              style={{ left: `${percent}%` }}
            />
          </div>
        </div>

        <div className="text-sm font-mono text-muted-foreground space-y-2">
          <p className="flex justify-between border-b border-border/30 pb-1.5">
            <span className="text-muted-foreground/70">Tasks</span>
            <span className="text-foreground tabular-nums">{progress.completedTasks} / {progress.totalTasks}</span>
          </p>
          {progress.currentEndpoint && (
            <p className="flex justify-between border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground/70">Endpoint</span>
              <span className="text-foreground font-bold">{progress.currentEndpoint}</span>
            </p>
          )}
          {progress.currentRound && progress.totalRounds && (
            <p className="flex justify-between border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground/70">Round</span>
              <span className="text-foreground tabular-nums">{progress.currentRound} / {progress.totalRounds}</span>
            </p>
          )}
          {progress.currentConcurrency && (
            <p className="flex justify-between border-b border-border/30 pb-1.5">
              <span className="text-muted-foreground/70">Concurrency</span>
              <span className="text-primary font-bold">{progress.currentConcurrency}x</span>
            </p>
          )}
          {progress.liveMetrics && (
            <div className="grid grid-cols-2 gap-3 pt-3">
              {typeof progress.liveMetrics.ttft === 'number' && (
                <div className="border-2 border-border bg-background/60 p-3 transition-all hover:border-[#00f0ff]/40">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">Live TTFT</p>
                  <p className="text-lg text-foreground font-bold tabular-nums mt-1">
                    {progress.liveMetrics.ttft.toFixed(0)}
                    <span className="text-[10px] font-normal text-muted-foreground/60 ml-1">ms</span>
                  </p>
                </div>
              )}
              {typeof progress.liveMetrics.tps === 'number' && (
                <div className="border-2 border-border bg-background/60 p-3 transition-all hover:border-emerald-400/40">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">Live TPS</p>
                  <p className="text-lg text-foreground font-bold tabular-nums mt-1">{progress.liveMetrics.tps.toFixed(1)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Button variant="destructive" size="lg" onClick={onCancel} className="w-full">
          <XCircle className="h-5 w-5 mr-2" /> ABORT
        </Button>
      </div>
    </div>
  )
}
