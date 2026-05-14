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
import { Activity, Database, Gauge, Play, ShieldCheck, Zap } from 'lucide-react'

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
    <main className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground brutalist-border">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-bold uppercase tracking-widest sm:text-lg">LLM Inference Benchmark</h1>
              <p className="hidden text-xs text-muted-foreground font-mono sm:block">SYS.PERF_TEST // RUNNING IN BROWSER</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2 border-2 border-border bg-muted p-1">
            <button
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'new' ? 'bg-primary text-primary-foreground brutalist-border' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('new')}
            >
              [ NEW_TEST ]
            </button>
            <button
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-primary text-primary-foreground brutalist-border' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('history')}
            >
              [ HISTORY ]
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:py-12">
        {activeTab === 'new' && (
          <>
            {!session && (
              <>
                <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                  <div className="brutalist-border bg-card p-6 sm:p-8">
                    <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="inline-block border-2 border-primary px-2 py-1 text-xs font-bold uppercase text-primary mb-4">
                          Speed Lab
                        </div>
                        <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                          MEASURE <span className="text-primary">REAL</span> FEEL
                        </h2>
                        <p className="mt-4 max-w-2xl text-sm font-mono leading-relaxed text-muted-foreground">
                          &gt; Configure OpenAI-compatible endpoints.
                          <br />
                          &gt; Capture TTFT, TPS, ITL, and concurrency degradation.
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className="hidden shrink-0 md:inline-flex"
                        onClick={startBenchmark}
                        disabled={endpoints.length === 0 || progress.status === 'running'}
                      >
                        <Play className="h-5 w-5 mr-2 fill-current" /> EXECUTE_RUN
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="border-2 border-border bg-background p-5 transition-colors hover:border-cyan-500">
                        <Activity className="mb-4 h-6 w-6 text-cyan-500" />
                        <p className="text-sm font-bold uppercase">Stream Sample</p>
                        <p className="mt-2 font-mono text-xs text-muted-foreground">Token-by-token timing</p>
                      </div>
                      <div className="border-2 border-border bg-background p-5 transition-colors hover:border-emerald-500">
                        <ShieldCheck className="mb-4 h-6 w-6 text-emerald-500" />
                        <p className="text-sm font-bold uppercase">Local Privacy</p>
                        <p className="mt-2 font-mono text-xs text-muted-foreground">Keys stay in browser</p>
                      </div>
                      <div className="border-2 border-border bg-background p-5 transition-colors hover:border-rose-500">
                        <Database className="mb-4 h-6 w-6 text-rose-500" />
                        <p className="text-sm font-bold uppercase">Exportable</p>
                        <p className="mt-2 font-mono text-xs text-muted-foreground">Web & CLI compatible</p>
                      </div>
                      <div className="border-2 border-primary bg-primary p-5 text-primary-foreground shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        <Zap className="mb-4 h-6 w-6 text-primary-foreground" />
                        <p className="text-sm font-bold uppercase">{config.concurrencyLevels.length} Threads</p>
                        <p className="mt-2 font-mono text-xs opacity-80">{config.repeatCount}x / {config.maxTokens}t</p>
                      </div>
                    </div>
                  </div>
                  <div className="brutalist-border bg-card p-0">
                    <div className="border-b-2 border-border bg-muted px-4 py-2">
                      <p className="font-mono text-xs font-bold uppercase text-muted-foreground">SYS.CONFIG</p>
                    </div>
                    <div className="p-4">
                      <BenchmarkSettings config={config} onChange={setConfig} compact />
                    </div>
                  </div>
                </section>

                <div className="brutalist-border bg-card p-0">
                  <div className="border-b-2 border-border bg-muted px-4 py-2">
                    <p className="font-mono text-xs font-bold uppercase text-muted-foreground">SYS.ENDPOINTS</p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <EndpointConfig endpoints={endpoints} onChange={setEndpoints} />
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full md:hidden"
                  onClick={startBenchmark}
                  disabled={endpoints.length === 0 || progress.status === 'running'}
                >
                  <Play className="h-5 w-5 mr-2 fill-current" /> EXECUTE_RUN
                </Button>
              </>
            )}

            {session && (
              <>
                <ResultDashboard session={session} onSaved={() => setHistoryRefresh(n => n + 1)} />
                <Button variant="outline" size="lg" className="w-full" onClick={() => setSession(null)}>
                  [ NEW_RUN ]
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
