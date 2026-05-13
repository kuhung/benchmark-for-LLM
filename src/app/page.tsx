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
import { Activity, Database, Gauge, Play, ShieldCheck } from 'lucide-react'

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
      <header className="border-b border-border bg-card/85 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">LLM Inference Benchmark</h1>
              <p className="text-xs text-muted-foreground">浏览器内完成 LLM 延迟、吞吐和稳定性测评</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1 rounded-md border border-border bg-muted p-1">
            <button
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('new')}
            >
              新建测评
            </button>
            <button
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('history')}
            >
              历史记录
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'new' && (
          <>
            {!session && (
              <>
                <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-primary">Speed lab</p>
                        <h2 className="mt-2 text-2xl font-bold">测你的模型服务真实体感</h2>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
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
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md border border-border bg-background p-3">
                        <Activity className="mb-2 h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">流式采样</p>
                        <p className="text-xs text-muted-foreground">逐 token 记录到达时间</p>
                      </div>
                      <div className="rounded-md border border-border bg-background p-3">
                        <ShieldCheck className="mb-2 h-4 w-4 text-amber-600" />
                        <p className="text-sm font-semibold">本地隐私</p>
                        <p className="text-xs text-muted-foreground">API Key 不离开浏览器</p>
                      </div>
                      <div className="rounded-md border border-border bg-background p-3">
                        <Database className="mb-2 h-4 w-4 text-rose-700" />
                        <p className="text-sm font-semibold">可导入导出</p>
                        <p className="text-xs text-muted-foreground">Web 与 CLI 结果兼容</p>
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
