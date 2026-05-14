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
import { Activity, Database, Gauge, Play, ShieldCheck, Zap, Terminal, Clock } from 'lucide-react'

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

  const features = [
    { icon: Activity, label: 'Stream Sample', desc: 'Token-by-token timing', color: 'text-[#00f0ff]', hoverBorder: 'hover:border-[#00f0ff]/50', hoverGlow: 'hover:shadow-[0_0_20px_rgba(0,240,255,0.08)]' },
    { icon: ShieldCheck, label: 'Local Privacy', desc: 'Keys stay in browser', color: 'text-emerald-400', hoverBorder: 'hover:border-emerald-400/50', hoverGlow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]' },
    { icon: Database, label: 'Exportable', desc: 'Web & CLI compatible', color: 'text-[#ff0055]', hoverBorder: 'hover:border-[#ff0055]/50', hoverGlow: 'hover:shadow-[0_0_20px_rgba(255,0,85,0.08)]' },
  ]

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border/80 bg-background/80 backdrop-blur-2xl">
        <div className="gradient-line opacity-40" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="relative flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground border-2 border-primary-foreground">
              <Gauge className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#00f0ff] animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-[0.2em] sm:text-base">
                LLM Bench
              </h1>
              <p className="hidden text-[10px] text-muted-foreground/60 font-mono tracking-wider sm:block">
                PERF_TEST // BROWSER_RUNTIME
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 border-2 border-border bg-muted/50 p-1 animate-fade-in delay-200">
            <button
              className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'new'
                  ? 'bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }`}
              onClick={() => setActiveTab('new')}
            >
              <Terminal className="inline-block h-3.5 w-3.5 mr-1.5 -mt-0.5" />
              NEW
            </button>
            <button
              className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <Clock className="inline-block h-3.5 w-3.5 mr-1.5 -mt-0.5" />
              HISTORY
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:py-10">
        {activeTab === 'new' && (
          <>
            {!session && (
              <>
                {/* Hero Section */}
                <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                  <div className="brutalist-border bg-card p-6 sm:p-8 relative overflow-hidden">
                    {/* Decorative corner accents */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary/20 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary/20 pointer-events-none" />

                    <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between relative">
                      <div className="animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 border-2 border-primary/60 px-2.5 py-1 text-xs font-bold uppercase text-primary mb-4 bg-primary/5">
                          <span className="h-1.5 w-1.5 bg-primary animate-pulse" />
                          Speed Lab
                        </div>
                        <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.1]">
                          MEASURE
                          <br />
                          <span className="text-primary neon-glow">REAL</span> FEEL
                        </h2>
                        <p className="mt-5 max-w-2xl text-sm font-mono leading-relaxed text-muted-foreground">
                          <span className="text-primary/70">&gt;</span> Configure OpenAI-compatible endpoints.
                          <br />
                          <span className="text-primary/70">&gt;</span> Capture TTFT, TPS, ITL, and concurrency degradation.
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className="hidden shrink-0 md:inline-flex animate-fade-in delay-300"
                        onClick={startBenchmark}
                        disabled={endpoints.length === 0 || progress.status === 'running'}
                      >
                        <Play className="h-5 w-5 mr-2 fill-current" /> EXECUTE
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                      {features.map((feat, i) => (
                        <div
                          key={feat.label}
                          className={`border-2 border-border bg-background/60 p-4 transition-all duration-300 ${feat.hoverBorder} ${feat.hoverGlow} animate-fade-in-up`}
                          style={{ animationDelay: `${200 + i * 100}ms` }}
                        >
                          <feat.icon className={`mb-3 h-5 w-5 ${feat.color}`} />
                          <p className="text-xs font-bold uppercase tracking-wide">{feat.label}</p>
                          <p className="mt-1.5 font-mono text-[11px] text-muted-foreground/70">{feat.desc}</p>
                        </div>
                      ))}
                      <div
                        className="border-2 border-primary bg-primary p-4 text-primary-foreground shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] animate-fade-in-up"
                        style={{ animationDelay: '500ms' }}
                      >
                        <Zap className="mb-3 h-5 w-5" />
                        <p className="text-xs font-bold uppercase tracking-wide">{config.concurrencyLevels.length} Threads</p>
                        <p className="mt-1.5 font-mono text-[11px] opacity-70">{config.repeatCount}x / {config.maxTokens}t</p>
                      </div>
                    </div>
                  </div>

                  <div className="brutalist-border bg-card p-0 animate-slide-in-right delay-200">
                    <div className="terminal-header">
                      <span className="terminal-dot bg-[#ff5f57]" />
                      <span className="terminal-dot bg-[#febc2e]" />
                      <span className="terminal-dot bg-[#28c840]" />
                      <p className="ml-2 font-mono text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">SYS.CONFIG</p>
                    </div>
                    <div className="p-4">
                      <BenchmarkSettings config={config} onChange={setConfig} compact />
                    </div>
                  </div>
                </section>

                {/* Endpoints Section */}
                <div className="brutalist-border bg-card p-0 animate-fade-in-up delay-400">
                  <div className="terminal-header">
                    <span className="terminal-dot bg-[#ff5f57]" />
                    <span className="terminal-dot bg-[#febc2e]" />
                    <span className="terminal-dot bg-[#28c840]" />
                    <p className="ml-2 font-mono text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">SYS.ENDPOINTS</p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <EndpointConfig endpoints={endpoints} onChange={setEndpoints} />
                  </div>
                </div>

                {/* Mobile execute button */}
                <Button
                  size="lg"
                  className="w-full md:hidden animate-fade-in-up delay-500"
                  onClick={startBenchmark}
                  disabled={endpoints.length === 0 || progress.status === 'running'}
                >
                  <Play className="h-5 w-5 mr-2 fill-current" /> EXECUTE_RUN
                </Button>
              </>
            )}

            {session && (
              <div className="animate-fade-in-up">
                <ResultDashboard session={session} onSaved={() => setHistoryRefresh(n => n + 1)} />
                <div className="mt-6">
                  <Button variant="outline" size="lg" className="w-full" onClick={() => setSession(null)}>
                    <Terminal className="h-5 w-5 mr-2" /> NEW_RUN
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in-up">
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
