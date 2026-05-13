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
import { Play, Gauge } from 'lucide-react'

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
    <main className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gauge className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">LLM Inference Benchmark</h1>
          </div>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('new')}
            >
              新建测评
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('history')}
            >
              历史记录
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'new' && (
          <>
            {!session && (
              <>
                <EndpointConfig endpoints={endpoints} onChange={setEndpoints} />
                <BenchmarkSettings config={config} onChange={setConfig} />
                <Button
                  size="lg"
                  className="w-full"
                  onClick={startBenchmark}
                  disabled={endpoints.length === 0 || progress.status === 'running'}
                >
                  <Play className="h-4 w-4" /> 开始测评
                </Button>
              </>
            )}

            {session && (
              <>
                <ResultDashboard session={session} onSaved={() => setHistoryRefresh(n => n + 1)} />
                <Button variant="outline" className="w-full" onClick={() => setSession(null)}>
                  重新测评
                </Button>
              </>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <HistoryList
            onView={(s) => { setSession(s); setActiveTab('new') }}
            refreshTrigger={historyRefresh}
          />
        )}
      </div>

      <RunProgress progress={progress} onCancel={cancelBenchmark} />
    </main>
  )
}
