'use client'

import { useState, useCallback } from 'react'
import { Endpoint, BenchmarkConfig, BenchmarkProgress, BenchmarkSession } from '@/lib/benchmark/types'
import { BenchmarkOrchestrator } from '@/lib/benchmark/orchestrator'
import { DEFAULT_PROMPT } from '@/lib/prompts'
import { EndpointConfig } from '@/components/endpoint-config'
import { BenchmarkSettings } from '@/components/benchmark-settings'
import { RunProgress } from '@/components/run-progress'
import { ResultDashboard } from '@/components/result-dashboard'
import { HistoryList } from '@/components/history-list'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw, Clock, Gauge } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { id: crypto.randomUUID(), name: 'Ollama', baseUrl: 'http://localhost:11434', modelId: 'llama3.2' },
  ])
  const [config, setConfig] = useState<BenchmarkConfig>({
    prompt: DEFAULT_PROMPT,
    maxTokens: 256,
    repeatCount: 5,
    concurrencyLevels: [1, 2, 4, 8],
  })
  const [progress, setProgress] = useState<BenchmarkProgress>({ status: 'idle', completedTasks: 0, totalTasks: 0 })
  const [session, setSession] = useState<BenchmarkSession | null>(null)
  const [orchestrator, setOrchestrator] = useState<BenchmarkOrchestrator | null>(null)
  const [historyRefresh, setHistoryRefresh] = useState(0)

  const startBenchmark = useCallback(async () => {
    if (endpoints.length === 0) return

    const orch = new BenchmarkOrchestrator((p) => setProgress({ ...p }))
    setOrchestrator(orch)
    setSession(null)
    setProgress({ status: 'running', completedTasks: 0, totalTasks: 0 })

    try {
      const result = await orch.run(endpoints, config)
      setSession(result)
    } catch (err) {
      console.error('Benchmark failed:', err)
      setProgress(p => ({ ...p, status: 'error' }))
    }
  }, [endpoints, config])

  const cancelBenchmark = () => {
    orchestrator?.cancel()
  }

  return (
    <main className="min-h-screen pb-12">
      {/* Header - 简洁，只做导航 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Gauge className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold tracking-wide">LLM Bench</span>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <button
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'new'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('new')}
            >
              New Test
            </button>
            <button
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <Clock className="h-3.5 w-3.5" />
              History
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {activeTab === 'new' && (
          <>
            {!session && (
              <div className="space-y-6 animate-fade-in">
                {/* Step 1: 端点配置 -- 用户首先需要知道测什么 */}
                <section>
                  <EndpointConfig endpoints={endpoints} onChange={setEndpoints} />
                </section>

                {/* Step 2: 测试参数 */}
                <section className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold mb-4">Test Parameters</h2>
                  <BenchmarkSettings config={config} onChange={setConfig} />
                </section>

                {/* Step 3: 执行 -- 最明确的 CTA */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={startBenchmark}
                  disabled={endpoints.length === 0 || progress.status === 'running'}
                >
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Run Benchmark
                </Button>
              </div>
            )}

            {session && (
              <div className="space-y-6 animate-fade-in">
                <ResultDashboard session={session} onSaved={() => setHistoryRefresh(n => n + 1)} />
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setSession(null)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Test
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <HistoryList
              onView={(s) => { setSession(s); setActiveTab('new') }}
              refreshTrigger={historyRefresh}
            />
          </div>
        )}
      </div>

      <RunProgress progress={progress} onCancel={cancelBenchmark} />
    </main>
  )
}
