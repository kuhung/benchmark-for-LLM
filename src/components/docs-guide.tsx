'use client'

import { useState, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { ChevronDown, Zap, BarChart3, Globe, Cpu, HelpCircle } from 'lucide-react'

function Section({ id, title, icon, defaultOpen, children }: {
  id: string
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div id={id} ref={ref} className="rounded-lg border border-border bg-card overflow-hidden scroll-mt-4">
      <button
        className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-border px-5 py-4">{children}</div>}
    </div>
  )
}

function QuickStartZh() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const button = el.querySelector('button')
      if (button) button.click()
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-base font-semibold mt-0">三步开始测试</h4>
        <p className="text-muted-foreground text-sm mt-1">
          LLM Bench 在浏览器中直接测量本地推理服务的性能 -- 无需安装额外软件。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/15 text-blue-500 text-xs font-bold">1</span>
            <span className="font-semibold text-sm">配置端点</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            在"新建测试"页面添加推理服务地址。支持自动发现模型列表，也可手动输入。
            确保推理框架已启动并开启 CORS。
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold">2</span>
            <span className="font-semibold text-sm">运行测试</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            选择测试提示词、输出长度、重复次数和并发级别，然后点击"开始测试"。
            测试过程中可以实时查看 TTFT 和 TPS 指标。
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-500 text-xs font-bold">3</span>
            <span className="font-semibold text-sm">对比分析</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            结果自动保存。在"历史记录"中选择 2-4 条记录进行横向对比，
            通过雷达图和柱状图直观对比不同框架/模型的性能差异。
          </p>
        </div>
      </div>

      <div className="rounded-md bg-muted/50 p-4">
        <h5 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">深入了解</h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => scrollTo('section-metrics')}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-left hover:bg-muted/80 transition-colors group"
          >
            <BarChart3 className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold group-hover:text-blue-500 transition-colors">指标说明</p>
              <p className="text-[11px] text-muted-foreground">TTFT / TPS / ITL 各指标含义</p>
            </div>
          </button>
          <button
            onClick={() => scrollTo('section-cors')}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-left hover:bg-muted/80 transition-colors group"
          >
            <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold group-hover:text-emerald-500 transition-colors">跨域解决</p>
              <p className="text-[11px] text-muted-foreground">CORS 配置与本地部署方案</p>
            </div>
          </button>
          <button
            onClick={() => scrollTo('section-framework')}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-left hover:bg-muted/80 transition-colors group"
          >
            <Cpu className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold group-hover:text-amber-500 transition-colors">推理框架</p>
              <p className="text-[11px] text-muted-foreground">Ollama / llama.cpp / vLLM 等</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function QuickStartEn() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const button = el.querySelector('button')
      if (button) button.click()
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-base font-semibold mt-0">Get started in 3 steps</h4>
        <p className="text-muted-foreground text-sm mt-1">
          LLM Bench measures local inference performance directly in the browser -- no extra software required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/15 text-blue-500 text-xs font-bold">1</span>
            <span className="font-semibold text-sm">Configure Endpoints</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Add your inference server URL in the &quot;New Test&quot; tab. Auto-discover models or enter manually.
            Make sure CORS is enabled on the server.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold">2</span>
            <span className="font-semibold text-sm">Run Benchmark</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Choose a prompt, token limit, repeat count, and concurrency levels.
            Click &quot;Run Benchmark&quot; and watch live TTFT/TPS metrics.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-500 text-xs font-bold">3</span>
            <span className="font-semibold text-sm">Compare & Analyze</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Results auto-save. In &quot;History&quot;, select 2-4 sessions to compare
            frameworks/models side by side with radar charts and bar charts.
          </p>
        </div>
      </div>

      <div className="rounded-md bg-muted/50 p-4">
        <h5 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">Learn more</h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => scrollTo('section-metrics')}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-left hover:bg-muted/80 transition-colors group"
          >
            <BarChart3 className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold group-hover:text-blue-500 transition-colors">Metrics Guide</p>
              <p className="text-[11px] text-muted-foreground">TTFT / TPS / ITL explained</p>
            </div>
          </button>
          <button
            onClick={() => scrollTo('section-cors')}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-left hover:bg-muted/80 transition-colors group"
          >
            <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold group-hover:text-emerald-500 transition-colors">CORS Guide</p>
              <p className="text-[11px] text-muted-foreground">Fix cross-origin & local deploy</p>
            </div>
          </button>
          <button
            onClick={() => scrollTo('section-framework')}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-left hover:bg-muted/80 transition-colors group"
          >
            <Cpu className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold group-hover:text-amber-500 transition-colors">Frameworks</p>
              <p className="text-[11px] text-muted-foreground">Ollama / llama.cpp / vLLM etc.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function MetricsGuideZh() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-5">
      <p className="text-muted-foreground">
        本工具不评价模型"答得对不对"，只回答"跑得快不快、稳不稳"。
        以下按照从用户感知到深层分析的顺序，逐一说明每个指标。
      </p>

      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
            Cold Start TTFT -- 冷启动延迟
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            首次请求的首字延迟。对本地推理框架（Ollama / llama.cpp / MLX 等）尤为重要 --
            首次请求往往包含模型加载、GPU 权重搬运的时间，可达数秒甚至数十秒。
            <strong> 如果你关注"打开聊天窗口后第一条消息要等多久"，这就是关键指标。</strong>
          </p>
          <table className="text-xs mt-2 w-full">
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground w-24">数据来源</td>
                <td className="py-1.5">第一次请求的 TTFT（requestStart 到 firstToken）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">适合对比</td>
                <td className="py-1.5">同模型不同框架、同框架不同量化精度、冷热状态差异</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
            TTFT -- 首字延迟 (Time to First Token)
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            从发送请求到收到第一个输出 token 的时间（ms）。
            反映 Prompt 处理（prefill）阶段的速度。
            P50（中位数）代表"典型体验"，P95 代表"大多数时候的最差体验"。
          </p>
          <table className="text-xs mt-2 w-full">
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground w-24">公式</td>
                <td className="py-1.5 font-mono">tokenTimestamps[0] - requestStart</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">雷达分数</td>
                <td className="py-1.5">P50 &le; 100ms = 100 分, &ge; 2000ms = 0 分（反向线性映射）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">用户感知</td>
                <td className="py-1.5">&lt;200ms 感觉即时; 200-500ms 可接受; &gt;1s 明显等待</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            TPS -- 输出速度 (Tokens Per Second)
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            首个 token 到最后一个 token 之间的 decode 速率。
            分母不包含 TTFT，确保 prefill 和 decode 正交衡量。
          </p>
          <table className="text-xs mt-2 w-full">
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground w-24">公式</td>
                <td className="py-1.5 font-mono">outputTokenCount / (requestEnd - firstToken)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">雷达分数</td>
                <td className="py-1.5">P50 &ge; 100 t/s = 100 分, &le; 5 t/s = 0 分（线性映射）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">参考</td>
                <td className="py-1.5">人类阅读速度 ~4 t/s; 流畅对话体验 &ge;30 t/s; M4 Max 本地 ~60-80 t/s</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ITL P95 -- 输出平滑度 (Inter-Token Latency)
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            相邻两个 token 之间的时间间隔。P95 意味着"95% 的 token 间隔在此值以内"。
            高 ITL P95 = 输出时有明显卡顿/跳跃，用户感知为"一顿一顿的"。
          </p>
          <table className="text-xs mt-2 w-full">
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground w-24">雷达分数</td>
                <td className="py-1.5">P95 &le; 20ms = 100 分, &ge; 200ms = 0 分（反向线性映射）</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">注意</td>
                <td className="py-1.5">SSE chunk 粒度影响 ITL 精度 -- chunk 合并越大，ITL 越不均匀</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            并发扩展性 (Scalability)
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            衡量模型在并发请求下的性能保持。计算方式为
            <code className="text-xs bg-muted px-1 rounded">TPS@concurrency=8 / TPS@concurrency=1</code>。
            比值 1.0 表示完美扩展（并发不影响单请求速度），0.15 以下表示严重退化。
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            响应稳定性 (Stability)
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            主要基于 TTFT 变异系数（CV = StdDev / Mean，越小越稳定）。
            高稳定性 = 每次请求的延迟一致，不会"时好时坏"。
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500" />
            综合评分 (Overall Score)
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            五个维度的算术平均值（0-100）。雷达图中越靠外表现越好。
            评分阈值参考 Apple Silicon M1-M4 系列芯片实测范围，作为经验基线。
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-muted p-3">
        <h5 className="font-semibold text-xs mb-2">雷达图评分阈值一览</h5>
        <table className="text-xs w-full font-mono">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1.5 text-left font-medium">维度</th>
              <th className="py-1.5 text-right font-medium">100 分 (Best)</th>
              <th className="py-1.5 text-right font-medium">0 分 (Worst)</th>
              <th className="py-1.5 text-right font-medium">映射方向</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50"><td className="py-1">输出速度</td><td className="py-1 text-right">&ge;100 t/s</td><td className="py-1 text-right">&le;5 t/s</td><td className="py-1 text-right">越高越好</td></tr>
            <tr className="border-b border-border/50"><td className="py-1">首字响应</td><td className="py-1 text-right">&le;100 ms</td><td className="py-1 text-right">&ge;2000 ms</td><td className="py-1 text-right">越低越好</td></tr>
            <tr className="border-b border-border/50"><td className="py-1">输出平滑</td><td className="py-1 text-right">&le;20 ms</td><td className="py-1 text-right">&ge;200 ms</td><td className="py-1 text-right">越低越好</td></tr>
            <tr className="border-b border-border/50"><td className="py-1">并发能力</td><td className="py-1 text-right">比值 &ge;1.0</td><td className="py-1 text-right">比值 &le;0.15</td><td className="py-1 text-right">越高越好</td></tr>
            <tr><td className="py-1">响应稳定</td><td className="py-1 text-right">CV &le;0.05</td><td className="py-1 text-right">CV &ge;1.0</td><td className="py-1 text-right">越低越好</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MetricsGuideEn() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-5">
      <p className="text-muted-foreground">
        This tool does not evaluate answer quality -- it only measures &quot;how fast and how stable&quot;.
        Metrics are organized from user-perceived experience to deeper analysis.
      </p>

      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
            Cold Start TTFT
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            TTFT of the very first request. Critical for local inference (Ollama / llama.cpp / MLX) --
            the first request often includes model loading and GPU weight transfer, adding seconds of latency.
            <strong> If you care about &quot;how long until the first character after opening a chat&quot;, this is the key metric.</strong>
          </p>
          <table className="text-xs mt-2 w-full">
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground w-24">Data Source</td>
                <td className="py-1.5">TTFT of the first request (requestStart to firstToken)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">Best For</td>
                <td className="py-1.5">Comparing same model across frameworks, quantization levels, or cold/hot states</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
            TTFT -- Time to First Token
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            Time from request sent to first output token received (ms).
            Reflects prompt processing (prefill) speed.
            P50 (median) = typical experience, P95 = worst case for most requests.
          </p>
          <table className="text-xs mt-2 w-full">
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground w-24">Formula</td>
                <td className="py-1.5 font-mono">tokenTimestamps[0] - requestStart</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">Radar Score</td>
                <td className="py-1.5">P50 &le; 100ms = 100, &ge; 2000ms = 0 (inverse linear mapping)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">Perception</td>
                <td className="py-1.5">&lt;200ms feels instant; 200-500ms acceptable; &gt;1s noticeable wait</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            TPS -- Tokens Per Second
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            Decode rate from first token to last. Denominator excludes TTFT so prefill and decode are orthogonal.
          </p>
          <table className="text-xs mt-2 w-full">
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground w-24">Formula</td>
                <td className="py-1.5 font-mono">outputTokenCount / (requestEnd - firstToken)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">Radar Score</td>
                <td className="py-1.5">P50 &ge; 100 t/s = 100, &le; 5 t/s = 0 (linear mapping)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">Reference</td>
                <td className="py-1.5">Human reading ~4 t/s; fluent chat &ge;30 t/s; M4 Max local ~60-80 t/s</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ITL P95 -- Inter-Token Latency
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            Time between consecutive tokens. P95 means 95% of token gaps are within this value.
            High ITL P95 = visible stuttering during output.
          </p>
          <table className="text-xs mt-2 w-full">
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground w-24">Radar Score</td>
                <td className="py-1.5">P95 &le; 20ms = 100, &ge; 200ms = 0 (inverse linear mapping)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 font-medium text-muted-foreground">Note</td>
                <td className="py-1.5">SSE chunk size affects ITL precision -- larger chunks = less uniform ITL</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            Scalability
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            TPS ratio at concurrency 8 vs 1. Calculated as
            <code className="text-xs bg-muted px-1 rounded mx-1">TPS@concurrency=8 / TPS@concurrency=1</code>.
            A ratio of 1.0 = perfect scaling; &le;0.15 = severe degradation.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            Stability
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            Primarily based on TTFT coefficient of variation (CV = StdDev / Mean, lower is better).
            High stability = predictable response times.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500" />
            Overall Score
          </h5>
          <p className="text-muted-foreground text-xs mt-1">
            Arithmetic mean of five dimensions (0-100). Radar chart: farther out = better.
            Thresholds are calibrated against Apple Silicon M1-M4 empirical ranges.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-muted p-3">
        <h5 className="font-semibold text-xs mb-2">Radar Score Thresholds</h5>
        <table className="text-xs w-full font-mono">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1.5 text-left font-medium">Dimension</th>
              <th className="py-1.5 text-right font-medium">100 (Best)</th>
              <th className="py-1.5 text-right font-medium">0 (Worst)</th>
              <th className="py-1.5 text-right font-medium">Direction</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50"><td className="py-1">Speed</td><td className="py-1 text-right">&ge;100 t/s</td><td className="py-1 text-right">&le;5 t/s</td><td className="py-1 text-right">Higher better</td></tr>
            <tr className="border-b border-border/50"><td className="py-1">Responsiveness</td><td className="py-1 text-right">&le;100 ms</td><td className="py-1 text-right">&ge;2000 ms</td><td className="py-1 text-right">Lower better</td></tr>
            <tr className="border-b border-border/50"><td className="py-1">Smoothness</td><td className="py-1 text-right">&le;20 ms</td><td className="py-1 text-right">&ge;200 ms</td><td className="py-1 text-right">Lower better</td></tr>
            <tr className="border-b border-border/50"><td className="py-1">Scalability</td><td className="py-1 text-right">Ratio &ge;1.0</td><td className="py-1 text-right">Ratio &le;0.15</td><td className="py-1 text-right">Higher better</td></tr>
            <tr><td className="py-1">Stability</td><td className="py-1 text-right">CV &le;0.05</td><td className="py-1 text-right">CV &ge;1.0</td><td className="py-1 text-right">Lower better</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CorsGuideZh() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
      <p className="text-muted-foreground">
        LLM Bench 在浏览器中直接请求本地推理服务。由于浏览器安全策略（同源策略），
        当网页域名（如 <code className="text-xs">benchmark-for-llm.kuhung.me</code>）与推理服务域名（如 <code className="text-xs">localhost:11434</code>）不同时，
        请求会被 CORS 策略阻止。以下是三种解决方案。
      </p>

      <div>
        <h5 className="font-semibold text-sm">方案一：在推理框架中开启 CORS（推荐）</h5>
        <p className="text-muted-foreground text-xs mt-1">大多数框架只需一个参数即可允许跨域：</p>
        <table className="text-xs w-full mt-2">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1.5 text-left font-medium">框架</th>
              <th className="py-1.5 text-left font-medium">启动命令 / 配置</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">Ollama</td>
              <td className="py-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded block">OLLAMA_ORIGINS=&quot;*&quot; ollama serve</code>
                <span className="text-muted-foreground text-[11px] block mt-1">v0.1.29+ 默认已允许本地来源。跨域网页需显式设置。</span>
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">LM Studio</td>
              <td className="py-2">
                <span className="text-muted-foreground text-[11px]">
                  Settings &rarr; Server &rarr; Enable CORS（勾选即可）。
                  或使用命令行 <code className="text-xs bg-muted px-1 rounded">lms server start --cors=true</code>
                </span>
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">llama.cpp</td>
              <td className="py-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded block">./llama-server --cors-allow-origin &quot;*&quot;</code>
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">vLLM</td>
              <td className="py-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded block">vllm serve model-name --cors-allow-origins &quot;*&quot;</code>
              </td>
            </tr>
            <tr>
              <td className="py-2 font-mono font-medium">MLX LM</td>
              <td className="py-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded block">mlx_lm.server --cors</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h5 className="font-semibold text-sm">方案二：本地部署 LLM Bench</h5>
        <p className="text-muted-foreground text-xs mt-1">
          将本项目克隆到本地，让网页和推理服务在同一网络下运行，天然绕过 CORS：
        </p>
        <div className="bg-muted rounded-md p-3 mt-2 font-mono text-xs space-y-1">
          <p>git clone https://github.com/kuhung/benchmark-for-LLM.git</p>
          <p>cd benchmark-for-LLM</p>
          <p>npm install && npm run dev</p>
          <p className="text-muted-foreground"># 访问 http://localhost:3000</p>
        </div>
        <p className="text-muted-foreground text-[11px] mt-2">
          适合内网环境或不方便修改推理框架配置的场景。
        </p>
      </div>

      <div>
        <h5 className="font-semibold text-sm">方案三：使用 Python CLI Runner</h5>
        <p className="text-muted-foreground text-xs mt-1">
          完全绕过浏览器，在命令行直接运行测试。输出的 JSON 可以导入网页查看图表：
        </p>
        <div className="bg-muted rounded-md p-3 mt-2 font-mono text-xs space-y-1">
          <p>cd runner</p>
          <p>pip install -r requirements.txt</p>
          <p>python benchmark_runner.py --base-url http://localhost:11434 --model llama3.2</p>
          <p className="text-muted-foreground"># 输出 JSON 后，在网页端 Import 即可</p>
        </div>
        <p className="text-muted-foreground text-[11px] mt-2">
          适合无头服务器 (SSH)、CI/CD 环境、或任何无法使用浏览器的场景。
        </p>
      </div>
    </div>
  )
}

function CorsGuideEn() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
      <p className="text-muted-foreground">
        LLM Bench runs in the browser and directly requests your local inference server.
        Due to browser security (same-origin policy), requests from
        <code className="text-xs"> benchmark-for-llm.kuhung.me</code> to <code className="text-xs">localhost:11434</code>
        are blocked unless CORS is configured. Three solutions:
      </p>

      <div>
        <h5 className="font-semibold text-sm">Option 1: Enable CORS on the inference server (recommended)</h5>
        <table className="text-xs w-full mt-2">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1.5 text-left font-medium">Framework</th>
              <th className="py-1.5 text-left font-medium">Command / Config</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">Ollama</td>
              <td className="py-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded block">OLLAMA_ORIGINS=&quot;*&quot; ollama serve</code>
                <span className="text-muted-foreground text-[11px] block mt-1">v0.1.29+ defaults to allowing local origins. Cross-origin web requests require explicit setting.</span>
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">LM Studio</td>
              <td className="py-2">
                <span className="text-muted-foreground text-[11px]">
                  Settings &rarr; Server &rarr; Enable CORS (check the box).
                  Or use CLI: <code className="text-xs bg-muted px-1 rounded">lms server start --cors=true</code>
                </span>
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">llama.cpp</td>
              <td className="py-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded block">./llama-server --cors-allow-origin &quot;*&quot;</code>
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">vLLM</td>
              <td className="py-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded block">vllm serve model-name --cors-allow-origins &quot;*&quot;</code>
              </td>
            </tr>
            <tr>
              <td className="py-2 font-mono font-medium">MLX LM</td>
              <td className="py-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded block">mlx_lm.server --cors</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h5 className="font-semibold text-sm">Option 2: Run LLM Bench locally</h5>
        <p className="text-muted-foreground text-xs mt-1">
          Clone and run locally -- same origin, no CORS issues:
        </p>
        <div className="bg-muted rounded-md p-3 mt-2 font-mono text-xs space-y-1">
          <p>git clone https://github.com/kuhung/benchmark-for-LLM.git</p>
          <p>cd benchmark-for-LLM && npm install && npm run dev</p>
        </div>
      </div>

      <div>
        <h5 className="font-semibold text-sm">Option 3: Use Python CLI Runner</h5>
        <p className="text-muted-foreground text-xs mt-1">
          Bypass the browser entirely. Output JSON can be imported into the web UI:
        </p>
        <div className="bg-muted rounded-md p-3 mt-2 font-mono text-xs space-y-1">
          <p>cd runner && pip install -r requirements.txt</p>
          <p>python benchmark_runner.py --base-url http://localhost:11434 --model llama3.2</p>
        </div>
      </div>
    </div>
  )
}

function FrameworkGuideZh() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
      <p className="text-muted-foreground">
        任何兼容 OpenAI <code className="text-xs">/v1/chat/completions</code> 流式接口的服务均可使用。
        以下是主流框架的特性对比，帮助你选择合适的推理方案。
      </p>

      <table className="text-xs w-full mt-2">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 text-left font-medium">框架</th>
            <th className="py-2 text-left font-medium">平台</th>
            <th className="py-2 text-left font-medium">量化支持</th>
            <th className="py-2 text-left font-medium">特点</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/50">
            <td className="py-2 font-mono font-medium">Ollama</td>
            <td className="py-2">macOS / Linux / Windows</td>
            <td className="py-2">GGUF (Q4/Q5/Q8 等)</td>
            <td className="py-2 text-muted-foreground">
              一键安装，自动模型管理。默认端口 11434。
              适合快速上手，开箱即用。支持多模型热切换。
            </td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-2 font-mono font-medium">LM Studio</td>
            <td className="py-2">macOS / Linux / Windows</td>
            <td className="py-2">GGUF</td>
            <td className="py-2 text-muted-foreground">
              桌面 GUI 应用，内置模型市场。默认端口 1234。
              配置直观，适合非技术用户。支持 Apple Metal / CUDA。
            </td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-2 font-mono font-medium">llama.cpp</td>
            <td className="py-2">全平台</td>
            <td className="py-2">GGUF (最全面)</td>
            <td className="py-2 text-muted-foreground">
              底层推理引擎，性能基线。Ollama 和 LM Studio 底层均基于此。
              适合需要极致调优的场景，支持 Metal / CUDA / Vulkan。
            </td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-2 font-mono font-medium">vLLM</td>
            <td className="py-2">Linux (CUDA)</td>
            <td className="py-2">FP16 / AWQ / GPTQ</td>
            <td className="py-2 text-muted-foreground">
              面向生产的高吞吐推理引擎。PagedAttention 优化显存利用。
              适合 GPU 服务器多并发场景，并发扩展性最强。
            </td>
          </tr>
          <tr>
            <td className="py-2 font-mono font-medium">MLX LM</td>
            <td className="py-2">macOS (Apple Silicon)</td>
            <td className="py-2">MLX 4-bit / 8-bit</td>
            <td className="py-2 text-muted-foreground">
              Apple 官方机器学习框架，针对 M 系列芯片深度优化。
              统一内存架构下无需 CPU-GPU 数据拷贝。
              适合 Mac 用户追求极致本地推理性能。
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 rounded-md bg-muted p-3">
        <h5 className="font-semibold text-xs mb-1">冷启动差异</h5>
        <p className="text-muted-foreground text-[11px]">
          本地框架首次请求需要加载模型权重到内存/显存，冷启动耗时可达数秒 --
          Ollama 和 LM Studio 会缓存已加载模型（热加载），
          但切换模型或长时间未使用后仍需重新加载。
          相比之下，线上 API（OpenAI / Claude / Gemini）的冷启动通常不可感知。
          LLM Bench 的"冷启动延迟"指标正是用于量化这一差异。
        </p>
      </div>
    </div>
  )
}

function FrameworkGuideEn() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
      <p className="text-muted-foreground">
        Any service compatible with the OpenAI <code className="text-xs">/v1/chat/completions</code> streaming API works.
      </p>

      <table className="text-xs w-full mt-2">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 text-left font-medium">Framework</th>
            <th className="py-2 text-left font-medium">Platform</th>
            <th className="py-2 text-left font-medium">Quantization</th>
            <th className="py-2 text-left font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/50">
            <td className="py-2 font-mono font-medium">Ollama</td>
            <td className="py-2">macOS / Linux / Win</td>
            <td className="py-2">GGUF</td>
            <td className="py-2 text-muted-foreground">One-click install, auto model management. Port 11434.</td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-2 font-mono font-medium">LM Studio</td>
            <td className="py-2">macOS / Linux / Win</td>
            <td className="py-2">GGUF</td>
            <td className="py-2 text-muted-foreground">Desktop GUI with model marketplace. Port 1234. Metal / CUDA.</td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-2 font-mono font-medium">llama.cpp</td>
            <td className="py-2">All platforms</td>
            <td className="py-2">GGUF (most complete)</td>
            <td className="py-2 text-muted-foreground">Low-level engine. Ollama & LM Studio are built on it. Metal / CUDA / Vulkan.</td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-2 font-mono font-medium">vLLM</td>
            <td className="py-2">Linux (CUDA)</td>
            <td className="py-2">FP16 / AWQ / GPTQ</td>
            <td className="py-2 text-muted-foreground">Production-grade, high-throughput. PagedAttention. Best concurrency scaling.</td>
          </tr>
          <tr>
            <td className="py-2 font-mono font-medium">MLX LM</td>
            <td className="py-2">macOS (Apple Silicon)</td>
            <td className="py-2">MLX 4/8-bit</td>
            <td className="py-2 text-muted-foreground">Apple ML framework, optimized for M-series unified memory.</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 rounded-md bg-muted p-3">
        <h5 className="font-semibold text-xs mb-1">Cold Start Differences</h5>
        <p className="text-muted-foreground text-[11px]">
          Local frameworks load model weights on first request (seconds of delay).
          Ollama and LM Studio cache loaded models, but switching models or idle timeouts trigger reloads.
          Cloud APIs (OpenAI / Claude / Gemini) have negligible cold start.
          The &quot;Cold Start TTFT&quot; metric quantifies this difference.
        </p>
      </div>
    </div>
  )
}

function FaqZh() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-sm">什么是 TTFT (Time to First Token)？</h5>
          <p className="text-muted-foreground text-xs mt-1">
            TTFT 即"首字延迟"，衡量从发送请求到收到第一个输出 token 的耗时（毫秒）。
            它反映了 Prompt 处理（prefill）阶段的速度。低于 200ms 感觉即时，200-500ms 可接受，超过 1 秒会有明显等待感。
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-sm">什么是 TPS (Tokens Per Second)？</h5>
          <p className="text-muted-foreground text-xs mt-1">
            TPS 即"输出速度"，衡量从首 token 到末 token 的解码速率。人类阅读速度约 4 t/s，
            流畅对话体验需要 30+ t/s，Apple M4 Max 本地推理可达 60-80 t/s。
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-sm">支持哪些推理框架？</h5>
          <p className="text-muted-foreground text-xs mt-1">
            任何兼容 OpenAI <code className="text-xs">/v1/chat/completions</code> 流式接口的服务均可使用，
            包括 <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ollama</a>、
            <a href="https://lmstudio.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LM Studio</a>、
            llama.cpp、vLLM 和 MLX LM。
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-sm">遇到 CORS 跨域问题怎么办？</h5>
          <p className="text-muted-foreground text-xs mt-1">
            三种解决方案：(1) 在推理框架中开启 CORS，如 <code className="text-xs">OLLAMA_ORIGINS="*" ollama serve</code>；
            (2) 克隆本项目到本地运行 <code className="text-xs">npm run dev</code>；
            (3) 使用 Python CLI Runner 完全绕过浏览器。详见上方"跨域解决指南"。
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-sm">数据保存在哪里？</h5>
          <p className="text-muted-foreground text-xs mt-1">
            所有测试数据保存在浏览器本地的 IndexedDB 中，不会上传到任何服务器。
            你可以通过"历史记录"导出/导入 JSON 文件进行跨设备迁移。
          </p>
        </div>
      </div>
    </div>
  )
}

function FaqEn() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-sm">What is TTFT (Time to First Token)?</h5>
          <p className="text-muted-foreground text-xs mt-1">
            TTFT measures the time from sending a request to receiving the first output token (in milliseconds).
            It reflects prompt processing (prefill) speed. Under 200ms feels instant, 200-500ms is acceptable, over 1 second causes noticeable delay.
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-sm">What is TPS (Tokens Per Second)?</h5>
          <p className="text-muted-foreground text-xs mt-1">
            TPS is the decode rate from the first token to the last. Human reading speed is about 4 t/s,
            a fluent chat experience needs 30+ t/s, and Apple M4 Max local inference can reach 60-80 t/s.
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-sm">Which LLM inference frameworks are supported?</h5>
          <p className="text-muted-foreground text-xs mt-1">
            Any service compatible with the OpenAI <code className="text-xs">/v1/chat/completions</code> streaming API works,
            including <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ollama</a>,{' '}
            <a href="https://lmstudio.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LM Studio</a>,
            llama.cpp, vLLM, and MLX LM.
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-sm">How do I fix CORS issues?</h5>
          <p className="text-muted-foreground text-xs mt-1">
            Three solutions: (1) Enable CORS on the inference server, e.g. <code className="text-xs">OLLAMA_ORIGINS="*" ollama serve</code>;
            (2) Clone and run locally with <code className="text-xs">npm run dev</code>;
            (3) Use the Python CLI runner to bypass the browser entirely. See the CORS Guide section above for details.
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-sm">Where is my data stored?</h5>
          <p className="text-muted-foreground text-xs mt-1">
            All benchmark data is stored in your browser&apos;s IndexedDB -- nothing is uploaded to any server.
            You can export/import JSON files from the History tab for cross-device migration.
          </p>
        </div>
      </div>
    </div>
  )
}

export function DocsGuide() {
  const { lang, t } = useI18n()
  const isZh = lang === 'zh'

  return (
    <div className="space-y-4 animate-fade-in">
      <Section
        id="section-quickstart"
        title={t('guideQuickStartTitle')}
        icon={<Zap className="h-4 w-4 text-amber-500" />}
        defaultOpen
      >
        {isZh ? <QuickStartZh /> : <QuickStartEn />}
      </Section>
      <Section
        id="section-metrics"
        title={t('guideMetricsTitle')}
        icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
      >
        {isZh ? <MetricsGuideZh /> : <MetricsGuideEn />}
      </Section>
      <Section
        id="section-cors"
        title={t('guideCorsTitle')}
        icon={<Globe className="h-4 w-4 text-emerald-500" />}
      >
        {isZh ? <CorsGuideZh /> : <CorsGuideEn />}
      </Section>
      <Section
        id="section-framework"
        title={t('guideFrameworkTitle')}
        icon={<Cpu className="h-4 w-4 text-amber-500" />}
      >
        {isZh ? <FrameworkGuideZh /> : <FrameworkGuideEn />}
      </Section>
      <Section
        id="section-faq"
        title={t('guideFaqTitle')}
        icon={<HelpCircle className="h-4 w-4 text-violet-500" />}
      >
        {isZh ? <FaqZh /> : <FaqEn />}
      </Section>

      <nav className="rounded-lg border border-border bg-card p-4" aria-label="Related links">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {isZh ? '相关链接' : 'Related Links'}
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <li>
            <a
              href="https://github.com/kuhung/benchmark-for-LLM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub Repository
            </a>
          </li>
          <li>
            <a
              href="https://pypi.org/project/llm-inference-benchmark/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Python CLI (PyPI)
            </a>
          </li>
          <li>
            <a
              href="https://kuhung.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {isZh ? '作者博客' : "Author's Blog"}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
