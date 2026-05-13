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
    <main className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight sm:text-base">LLM Inference Benchmark</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">浏览器内完成延迟、吞吐和稳定性测评</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1 rounded-full border border-border bg-muted p-1">
            <button
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${activeTab === 'new' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('new')}
            >
              新建测评
            </button>
            <button
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('history')}
            >
              历史记录
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:py-7">
        {activeTab === 'new' && (
          <>
            {!session && (
              <>
                <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                  <div className="rounded-lg border border-border/80 bg-card p-5 shadow-sm shadow-black/5">
                    <div className="mb-5 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">Speed lab</p>
                        <h2 className="mt-2 text-2xl font-bold tracking-normal text-foreground sm:text-3xl">测你的模型服务真实体感</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                          配置 OpenAI-compatible endpoint，直接采集 TTFT、TPS、ITL 和并发退化曲线。
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className="hidden shrink-0 md:inline-flex"
                        onClick={startBenchmark}
                        disabled={endpoints.length === 0 || progress.status === 'running'}
                      >
                        <Play className="h-4 w-4" /> 开始测评
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="rounded-lg border border-border bg-muted/40 p-4">
                        <Activity className="mb-3 h-4 w-4 text-cyan-600" />
                        <p className="text-sm font-bold">流式采样</p>
                        <p className="mt-1 text-xs text-muted-foreground">逐 token 记录到达时间</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/40 p-4">
                        <ShieldCheck className="mb-3 h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-bold">本地隐私</p>
                        <p className="mt-1 text-xs text-muted-foreground">API Key 不离开浏览器</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/40 p-4">
                        <Database className="mb-3 h-4 w-4 text-rose-600" />
                        <p className="text-sm font-bold">可导入导出</p>
                        <p className="mt-1 text-xs text-muted-foreground">Web 与 CLI 结果兼容</p>
                      </div>
                      <div className="rounded-lg border border-primary bg-primary p-4 text-white">
                        <Zap className="mb-3 h-4 w-4 text-sky-300" />
                        <p className="text-sm font-bold">{config.concurrencyLevels.length} 组并发</p>
                        <p className="mt-1 text-xs text-primary-foreground/70">{config.repeatCount} 次重复，最多 {config.maxTokens} tokens</p>
                      </div>
                    </div>
                  </div>
                  <BenchmarkSettings config={config} onChange={setConfig} compact />
                </section>

                <EndpointConfig endpoints={endpoints} onChange={setEndpoints} />
                <Button
                  size="lg"
                  className="w-full md:hidden"
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
