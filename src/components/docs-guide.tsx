'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { ChevronDown } from 'lucide-react'

function Section({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-border px-5 py-4">{children}</div>}
    </div>
  )
}

function MetricsGuideZh() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed space-y-5">
      <h4 className="text-base font-semibold mt-0">看什么指标、得到什么结论</h4>
      <p className="text-muted-foreground">
        本工具不评价模型"答得对不对"，只回答"跑得快不快、稳不稳"。
        以下是每个指标的含义和使用场景。
      </p>

      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-sm">Cold Start TTFT -- 冷启动延迟</h5>
          <p className="text-muted-foreground text-xs mt-1">
            首次请求的首字延迟。对本地推理框架（Ollama / llama.cpp / MLX 等）尤为重要 --
            首次请求往往包含模型加载、GPU 权重搬运的时间，可达数秒甚至数十秒。
            线上 API（如 OpenAI、Claude）通常没有明显冷启动。
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
          <h5 className="font-semibold text-sm">TTFT -- 首字延迟 (Time to First Token)</h5>
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
          <h5 className="font-semibold text-sm">TPS -- 输出速度 (Tokens Per Second)</h5>
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
          <h5 className="font-semibold text-sm">ITL P95 -- 输出平滑度 (Inter-Token Latency)</h5>
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
          <h5 className="font-semibold text-sm">并发扩展性 (Scalability)</h5>
          <p className="text-muted-foreground text-xs mt-1">
            衡量模型在并发请求下的性能保持。计算方式为
            <code className="text-xs bg-muted px-1 rounded">TPS@concurrency=8 / TPS@concurrency=1</code>。
            比值 1.0 表示完美扩展（并发不影响单请求速度），0.15 以下表示严重退化。
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm">响应稳定性 (Stability)</h5>
          <p className="text-muted-foreground text-xs mt-1">
            由两部分组成：70% 来自 TTFT 变异系数（CV = StdDev / Mean，越小越稳定），
            30% 来自请求成功率。
            高稳定性 = 每次请求的延迟一致，不会"时好时坏"。
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm">综合评分 (Overall Score)</h5>
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
      <h4 className="text-base font-semibold mt-0">Which metrics to look at and what conclusions to draw</h4>
      <p className="text-muted-foreground">
        This tool does not evaluate answer quality -- it only measures &quot;how fast and how stable&quot;.
      </p>

      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-sm">Cold Start TTFT</h5>
          <p className="text-muted-foreground text-xs mt-1">
            TTFT of the very first request. Critical for local inference (Ollama / llama.cpp / MLX) --
            the first request often includes model loading and GPU weight transfer, adding seconds of latency.
            Cloud APIs (OpenAI, Claude) typically have no noticeable cold start.
            <strong> If you care about &quot;how long until the first character after opening a chat&quot;, this is the key metric.</strong>
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm">TTFT -- Time to First Token</h5>
          <p className="text-muted-foreground text-xs mt-1">
            Time from request sent to first output token received (ms).
            Reflects prompt processing (prefill) speed.
            P50 = typical experience, P95 = worst case for most requests.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            <strong>Radar score:</strong> P50 &le;100ms = 100, &ge;2000ms = 0 (inverse linear).
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm">TPS -- Tokens Per Second</h5>
          <p className="text-muted-foreground text-xs mt-1">
            Decode rate from first token to last. Denominator excludes TTFT so prefill and decode are orthogonal.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            <strong>Radar score:</strong> P50 &ge;100 t/s = 100, &le;5 t/s = 0 (linear).
            Human reading speed ~4 t/s; fluent chat &ge;30 t/s; M4 Max local ~60-80 t/s.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm">ITL P95 -- Inter-Token Latency</h5>
          <p className="text-muted-foreground text-xs mt-1">
            Time between consecutive tokens. P95 means 95% of token gaps are within this value.
            High ITL P95 = visible stuttering during output.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm">Scalability</h5>
          <p className="text-muted-foreground text-xs mt-1">
            TPS ratio at concurrency 8 vs 1. A ratio of 1.0 = perfect scaling; &le;0.15 = severe degradation.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm">Stability</h5>
          <p className="text-muted-foreground text-xs mt-1">
            70% from TTFT coefficient of variation (lower = more consistent),
            30% from success rate. High stability = predictable response times.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-sm">Overall Score</h5>
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
      <h4 className="text-base font-semibold mt-0">跨域 (CORS) 解决指南</h4>
      <p className="text-muted-foreground">
        LLM Bench 在浏览器中直接请求本地推理服务。由于浏览器安全策略（同源策略），
        当网页域名（如 <code className="text-xs">llm-bench.vercel.app</code>）与推理服务域名（如 <code className="text-xs">localhost:11434</code>）不同时，
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
      <h4 className="text-base font-semibold mt-0">CORS Troubleshooting Guide</h4>
      <p className="text-muted-foreground">
        LLM Bench runs in the browser and directly requests your local inference server.
        Due to browser security (same-origin policy), requests from
        <code className="text-xs"> llm-bench.vercel.app</code> to <code className="text-xs">localhost:11434</code>
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
              <td className="py-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">OLLAMA_ORIGINS=&quot;*&quot; ollama serve</code></td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">LM Studio</td>
              <td className="py-2 text-xs">Settings &rarr; Server &rarr; Enable CORS, or <code className="bg-muted px-1 rounded">lms server start --cors=true</code></td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">llama.cpp</td>
              <td className="py-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">./llama-server --cors-allow-origin &quot;*&quot;</code></td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 font-mono font-medium">vLLM</td>
              <td className="py-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">vllm serve model --cors-allow-origins &quot;*&quot;</code></td>
            </tr>
            <tr>
              <td className="py-2 font-mono font-medium">MLX LM</td>
              <td className="py-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">mlx_lm.server --cors</code></td>
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
      <h4 className="text-base font-semibold mt-0">支持的本地推理框架</h4>
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
      <h4 className="text-base font-semibold mt-0">Supported Local Inference Frameworks</h4>
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

export function DocsGuide() {
  const { lang, t } = useI18n()
  const isZh = lang === 'zh'

  return (
    <div className="space-y-4 animate-fade-in">
      <Section title={t('guideMetricsTitle')} defaultOpen>
        {isZh ? <MetricsGuideZh /> : <MetricsGuideEn />}
      </Section>
      <Section title={t('guideCorsTitle')}>
        {isZh ? <CorsGuideZh /> : <CorsGuideEn />}
      </Section>
      <Section title={t('guideFrameworkTitle')}>
        {isZh ? <FrameworkGuideZh /> : <FrameworkGuideEn />}
      </Section>
    </div>
  )
}
