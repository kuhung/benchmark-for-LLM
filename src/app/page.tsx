'use client'

import { useState, useCallback, useEffect } from 'react'
import { Endpoint, BenchmarkConfig, BenchmarkProgress, BenchmarkSession } from '@/lib/benchmark/types'
import { BenchmarkOrchestrator } from '@/lib/benchmark/orchestrator'
import { fetchModels } from '@/lib/benchmark/runner'
import { saveSession } from '@/lib/store'
import { DEFAULT_PROMPT } from '@/lib/prompts'
import { EndpointConfig, PRESETS } from '@/components/endpoint-config'
import { BenchmarkSettings } from '@/components/benchmark-settings'
import { RunProgress } from '@/components/run-progress'
import { ResultDashboard } from '@/components/result-dashboard'
import { HistoryList } from '@/components/history-list'
import { CompareView } from '@/components/compare-view'
import { ThemeToggle } from '@/components/theme-toggle'
import { LangToggle } from '@/components/lang-toggle'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw, Clock, Gauge, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function Home() {
  const { t, lang } = useI18n()
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [isDiscovering, setIsDiscovering] = useState(true)
  const [config, setConfig] = useState<BenchmarkConfig>({
    prompt: { ...DEFAULT_PROMPT },
    promptId: 'medium',
    maxTokens: 256,
    repeatCount: 5,
    concurrencyLevels: [1, 2, 4, 8],
    thinkingEnabled: false,
  })

  const [progress, setProgress] = useState<BenchmarkProgress>({ status: 'idle', completedTasks: 0, totalTasks: 0 })
  const [session, setSession] = useState<BenchmarkSession | null>(null)
  const [orchestrator, setOrchestrator] = useState<BenchmarkOrchestrator | null>(null)
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [compareSessions, setCompareSessions] = useState<BenchmarkSession[] | null>(null)

  useEffect(() => {
    async function discover() {
      // Send requests in parallel to find the first active preset
      const promises = PRESETS.map(async (preset) => {
        try {
          const res = await fetchModels(preset.baseUrl)
          if (res.ok && res.models.length > 0) {
            return { preset, models: res.models }
          }
        } catch {
          // ignore
        }
        return null
      })
      
      const results = await Promise.all(promises)
      const firstActive = results.find(r => r !== null)
      
      if (firstActive) {
        let modelId = firstActive.preset.modelId
        if (modelId === 'default' || !firstActive.models.includes(modelId)) {
          modelId = firstActive.models[0]
        }
        setEndpoints([{
          id: crypto.randomUUID(),
          name: firstActive.preset.label,
          baseUrl: firstActive.preset.baseUrl,
          modelId: modelId
        }])
      } else {
        // 如果都没连接上，就清空，让用户自己加或者配置
        setEndpoints([])
      }
      setIsDiscovering(false)
    }
    discover()
  }, [])

  const startBenchmark = useCallback(async () => {
    if (endpoints.length === 0) return

    const orch = new BenchmarkOrchestrator((p) => setProgress({ ...p }))
    setOrchestrator(orch)
    setSession(null)
    setProgress({ status: 'running', completedTasks: 0, totalTasks: 0 })

    try {
      const actualPrompt = typeof config.prompt === 'string' ? config.prompt : config.prompt[lang]
      const actualConfig = { ...config, prompt: actualPrompt }
      const result = await orch.run(endpoints, actualConfig)
      setSession(result)
      await saveSession(result)
      setHistoryRefresh(n => n + 1)
    } catch (err) {
      console.error('Benchmark failed:', err)
      setProgress(p => ({ ...p, status: 'error' }))
    }
  }, [endpoints, config, lang])

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
            {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <button
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'new'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => {
                  setActiveTab('new')
                  setSession(null)
                }}
              >
                {t('newTest')}
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
                {t('history')}
              </button>
            </div>
            <LangToggle />
            <ThemeToggle />
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
                  {isDiscovering ? (
                    <div className="rounded-lg border border-border bg-card p-12 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">{t('discovering')}</p>
                    </div>
                  ) : (
                    <EndpointConfig endpoints={endpoints} onChange={setEndpoints} />
                  )}
                </section>

                {/* Step 2: 测试参数 */}
                <section className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold mb-4">{t('testParameters')}</h2>
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
                  {t('runBenchmark')}
                </Button>
              </div>
            )}

            {session && (
              <div className="space-y-6 animate-fade-in">
                <ResultDashboard session={session} />
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setSession(null)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('newTest')}
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in space-y-6">
            {compareSessions && (
              <div className="space-y-4">
                <CompareView sessions={compareSessions} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareSessions(null)}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> {t('closeComparison')}
                </Button>
              </div>
            )}
            <HistoryList
              onView={(s) => { setSession(s); setActiveTab('new') }}
              onCompare={(sessions) => setCompareSessions(sessions)}
              refreshTrigger={historyRefresh}
            />
          </div>
        )}
      </div>

      <RunProgress progress={progress} onCancel={cancelBenchmark} />
    </main>
  )
}
