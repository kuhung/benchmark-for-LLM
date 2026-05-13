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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <h3 className="font-semibold">测评进行中</h3>
        </div>

        <Progress value={percent} />

        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            进度: {progress.completedTasks} / {progress.totalTasks} ({percent}%)
          </p>
          {progress.currentEndpoint && (
            <p>当前端点: <span className="text-foreground font-medium">{progress.currentEndpoint}</span></p>
          )}
          {progress.currentRound && progress.totalRounds && (
            <p>轮次: {progress.currentRound} / {progress.totalRounds}</p>
          )}
          {progress.currentConcurrency && (
            <p>并发: {progress.currentConcurrency}x</p>
          )}
          {progress.liveMetrics && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {typeof progress.liveMetrics.ttft === 'number' && (
                <div className="rounded-md border border-border bg-background px-3 py-2">
                  <p className="text-xs">最新 TTFT</p>
                  <p className="text-foreground font-semibold">{progress.liveMetrics.ttft.toFixed(0)} ms</p>
                </div>
              )}
              {typeof progress.liveMetrics.tps === 'number' && (
                <div className="rounded-md border border-border bg-background px-3 py-2">
                  <p className="text-xs">最新 TPS</p>
                  <p className="text-foreground font-semibold">{progress.liveMetrics.tps.toFixed(1)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Button variant="destructive" size="sm" onClick={onCancel} className="w-full">
          <XCircle className="h-4 w-4" /> 取消测评
        </Button>
      </div>
    </div>
  )
}
