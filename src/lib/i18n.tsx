'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'zh'

export const translations = {
  // Common
  cancel: { en: 'Cancel', zh: '取消' },
  add: { en: 'Add', zh: '添加' },
  delete: { en: 'Delete', zh: '删除' },
  save: { en: 'Save', zh: '保存' },
  export: { en: 'Export', zh: '导出' },
  import: { en: 'Import', zh: '导入' },
  view: { en: 'View', zh: '查看' },
  close: { en: 'Close', zh: '关闭' },
  autoSaved: { en: 'Auto-saved', zh: '已自动保存' },
  toggleTheme: { en: 'Toggle theme', zh: '切换主题' },
  
  // Header
  newTest: { en: 'New Test', zh: '新建测试' },
  history: { en: 'History', zh: '历史记录' },
  
  // Endpoint Config
  discovering: { en: 'Discovering available API endpoints and models...', zh: '正在自动发现可用的 API 端点与模型...' },
  endpoints: { en: 'Endpoints', zh: '端点配置' },
  endpointCount: { en: 'endpoints', zh: '个端点' },
  noEndpoints: { en: 'No endpoints configured', zh: '未配置端点' },
  clickAdd: { en: 'Click "Add" to configure your first endpoint', zh: '点击"添加"配置你的第一个端点' },
  name: { en: 'Name', zh: '名称' },
  baseUrl: { en: 'Base URL', zh: '基础 URL' },
  modelId: { en: 'Model ID', zh: '模型 ID' },
  apiKeyOptional: { en: 'API Key (Optional)', zh: 'API Key (可选)' },
  testConnection: { en: 'Test Connection', zh: '测试连接' },
  discoverModels: { en: 'Discover Models', zh: '发现可用模型' },
  discoveringModels: { en: 'Discovering...', zh: '正在发现模型...' },
  noModelsFound: { en: 'No models found', zh: '未发现可用模型' },
  requestFailed: { en: 'Request failed', zh: '请求失败' },
  searchModel: { en: 'Search model...', zh: '搜索模型...' },
  noMatch: { en: 'No match', zh: '无匹配结果' },
  defaultEndpointName: { en: 'Endpoint', zh: '端点' },
  
  // Benchmark Settings
  testParameters: { en: 'Test Parameters', zh: '测试参数' },
  testPrompt: { en: 'Test Prompt', zh: '测试提示词 (Prompt)' },
  enterPrompt: { en: 'Enter custom prompt...', zh: '输入自定义提示词...' },
  maxTokens: { en: 'Max Tokens', zh: '最大 Token 数 (Max Tokens)' },
  repeatCount: { en: 'Repeat Count', zh: '重复次数 (Repeat)' },
  concurrency: { en: 'Concurrency', zh: '并发数 (Concurrency)' },
  thinkingMode: { en: 'Thinking Mode', zh: '推理模式 (Thinking)' },
  thinkingOn: { en: 'On', zh: '开启' },
  thinkingOff: { en: 'Off', zh: '关闭' },
  thinkingDesc: { en: 'When off, requests include think=false to skip model reasoning. Some providers may ignore this.', zh: '关闭时请求携带 think=false 跳过模型推理过程，部分服务商可能不支持此参数。' },
  runBenchmark: { en: 'Run Benchmark', zh: '开始测试' },
  
  // Progress
  runningBenchmark: { en: 'Running Benchmark', zh: '测试运行中' },
  tasks: { en: 'tasks', zh: '任务' },
  endpoint: { en: 'Endpoint', zh: '端点' },
  round: { en: 'Round', zh: '轮次' },
  
  // Dashboard
  results: { en: 'Results', zh: '测试结果' },
  bestTtft: { en: 'Best TTFT', zh: '最佳首字延迟 (TTFT)' },
  bestTps: { en: 'Best TPS', zh: '最佳输出速度 (TPS)' },
  avgSuccess: { en: 'Avg Success Rate', zh: '平均成功率 (Success Rate)' },
  report: { en: 'Report', zh: '报告' },
  repeats: { en: 'repeats', zh: '次重复' },
  
  // History
  noHistory: { en: 'No history yet', zh: '暂无历史记录' },
  runOrImport: { en: 'Run a benchmark or import results', zh: '运行测试或导入结果' },
  compare: { en: 'Compare', zh: '对比' },
  selectCompare: { en: 'Select 2-4 sessions to compare', zh: '选择 2-4 个记录进行对比' },
  importFailed: { en: 'Import failed', zh: '导入失败' },
  select: { en: 'Select', zh: '选择' },
  deselect: { en: 'Deselect', zh: '取消选择' },
  
  // Compare View
  sessionComparison: { en: 'Session Comparison', zh: '记录对比' },
  closeComparison: { en: 'Close Comparison', zh: '关闭对比' },
  detailedComparison: { en: 'Detailed Comparison', zh: '详细对比' },
  session: { en: 'Session', zh: '记录' },
  comparing: { en: 'Comparing', zh: '正在对比' },
  sessions: { en: 'sessions', zh: '条记录' },
  
  // Raw Data Table
  rawData: { en: 'Raw Data', zh: '原始数据' },
  charsPerChunk: { en: 'Chars/Chunk', zh: '块字符数 (Chars/Chunk)' },
  chunkInterval: { en: 'Chunk Interval', zh: '块间隔 (Chunk Interval)' },
  success: { en: 'Success', zh: '成功率 (Success)' },
  ttftMs: { en: 'TTFT (ms)', zh: '首字延迟 / TTFT (ms)' },
  tps: { en: 'TPS', zh: '吞吐量 / TPS' },
  itlP95: { en: 'ITL P95 (ms)', zh: '字间延迟 / ITL P95 (ms)' },
  e2eMs: { en: 'E2E (ms)', zh: '端到端延迟 / E2E (ms)' },

  // Compare View
  ttftP50: { en: 'TTFT P50', zh: '首字延迟 / TTFT P50' },
  tpsP50: { en: 'TPS P50', zh: '吞吐量 / TPS P50' },
  e2eP50: { en: 'E2E P50', zh: '端到端 / E2E P50' },
  
  // Charts
  ttftComparison: { en: 'TTFT Comparison (ms)', zh: '首字延迟对比 / TTFT (ms)' },
  tpsComparison: { en: 'TPS Comparison (t/s)', zh: '吞吐量对比 / TPS (t/s)' },
  successRate: { en: 'Success Rate (%)', zh: '成功率 / Success Rate (%)' },
  ttftChartTitle: { en: 'TTFT (ms)', zh: '首字延迟 / TTFT (ms)' },
  tpsChartTitle: { en: 'TPS (tokens/s)', zh: '吞吐量 / TPS (tokens/s)' },
  itlChartTitle: { en: 'ITL Distribution (ms)', zh: '字间延迟分布 / ITL (ms)' },
  percentileChartTitle: { en: 'TTFT Latency Percentiles (ms)', zh: '首字延迟分位数 / TTFT Percentiles (ms)' },
  throughputChartTitle: { en: 'Concurrency Scaling', zh: '并发扩展性 (Concurrency Scaling)' },
  throughputTpsVsConcurrency: { en: 'TPS vs Concurrency', zh: '吞吐量随并发变化 (TPS vs Concurrency)' },
  throughputTtftVsConcurrency: { en: 'TTFT vs Concurrency (ms)', zh: '首字延迟随并发变化 (TTFT vs Concurrency)' },
  overallScore: { en: 'Overall Score', zh: '综合评分 (Overall Score)' },
  
  // Chart legends
  legendP50: { en: 'P50', zh: 'P50' },
  legendP95: { en: 'P95', zh: 'P95' },
  legendP99: { en: 'P99', zh: 'P99' },
  legendMaxColdStart: { en: 'Max (Cold Start)', zh: '最大值 (冷启动)' },
  legendTpsP50: { en: 'TPS (P50)', zh: 'TPS (P50)' },
  
  // Radar dimensions — label is concise, desc explains "higher = better"
  radarSpeed: { en: 'Output Speed', zh: '输出速度' },
  radarSpeedDesc: { en: 'Token generation rate (TPS). Higher = faster output', zh: '生成速率 (TPS)，越高=输出越快' },
  radarResponse: { en: 'First Token', zh: '首字响应' },
  radarResponseDesc: { en: 'Time to first token (TTFT). Higher = responds faster', zh: '首字延迟 (TTFT)，越高=响应越快' },
  radarSmooth: { en: 'Smoothness', zh: '输出平滑' },
  radarSmoothDesc: { en: 'Token output smoothness (ITL). Higher = more even streaming', zh: '字间延迟稳定度 (ITL)，越高=流式输出越均匀' },
  radarScale: { en: 'Scalability', zh: '并发能力' },
  radarScaleDesc: { en: 'Performance under concurrency. Higher = scales better', zh: '并发下性能保持，越高=扩展性越强' },
  radarStable: { en: 'Stability', zh: '响应稳定' },
  radarStableDesc: { en: 'Response latency consistency. Higher = more predictable', zh: '延迟一致性和成功率，越高=表现越稳定' },
  radarHigherIsBetter: { en: 'All dimensions: higher (outward) = better', zh: '所有维度：越靠外=表现越好' },

  // History / session info
  promptLabel: { en: 'Prompt', zh: '提示词' },
  customPrompt: { en: 'Custom', zh: '自定义' },
  model: { en: 'Model', zh: '模型' },
  framework: { en: 'Framework', zh: '框架' },
  testConfig: { en: 'Test Configuration', zh: '测试配置' },
  promptScene: { en: 'Scenario', zh: '测试场景' },
  testedModels: { en: 'Tested Models', zh: '测试模型' },
  score: { en: 'Score', zh: '得分' },
}

export type TranslationKey = keyof typeof translations

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('benchmark-lang') as Language
    if (saved && (saved === 'en' || saved === 'zh')) {
      setLangState(saved)
    } else {
      const isZh = navigator.language.startsWith('zh')
      setLangState(isZh ? 'zh' : 'en')
    }
    setMounted(true)
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('benchmark-lang', newLang)
  }

  const t = (key: TranslationKey) => {
    return translations[key]?.[lang] || key
  }

  // To prevent hydration mismatch, we don't render children until mounted
  if (!mounted) {
    return <div className="min-h-screen bg-background" /> // Fallback empty view or just children with default lang
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
