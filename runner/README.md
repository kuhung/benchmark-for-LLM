# llm-benchmark-runner

[![PyPI version](https://img.shields.io/pypi/v/llm-benchmark-runner.svg)](https://pypi.org/project/llm-benchmark-runner/)
[![Python](https://img.shields.io/pypi/pyversions/llm-benchmark-runner.svg)](https://pypi.org/project/llm-benchmark-runner/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

CLI tool for LLM inference performance benchmarking — measures TTFT / TPS / ITL / E2E latency. Outputs standard JSON importable into the [web dashboard](https://benchmark-for-llm.vercel.app) for interactive charts and radar scores.

Designed for scenarios where the browser can't reach the API (CORS not configured, headless SSH servers, CI/CD pipelines).

## Installation

**pip:**

```bash
pip install llm-benchmark-runner
```

**uv:**

```bash
uv pip install llm-benchmark-runner
```

**From source (dev mode):**

```bash
cd runner
pip install -e .
```

## Usage

```bash
# Basic — benchmark a local Ollama model
llm-benchmark --url http://localhost:11434 --model llama3.2

# Full options
llm-benchmark \
  --url http://localhost:11434 \
  --model llama3.2 \
  --name "My Ollama" \
  --prompt "Write a short essay about AI." \
  --max-tokens 512 \
  --repeat 10 \
  --concurrency 1,2,4,8 \
  --output results.json

# Force Chinese output
llm-benchmark --url http://localhost:11434 --model llama3.2 --lang zh

# Also works as a Python module
python -m llm_benchmark_runner --url http://localhost:11434 --model llama3.2
```

## Options

| Flag | Default | Description |
|---|---|---|
| `--url` | (required) | Base URL of the model API |
| `--model` | (required) | Model ID |
| `--name` | auto-generated | Display name for the endpoint |
| `--api-key` | (none) | API Key |
| `--prompt` | built-in | Test prompt |
| `--max-tokens` | 256 | Max output tokens |
| `--repeat` | 5 | Repeat count per concurrency level |
| `--concurrency` | 1,2,4,8 | Comma-separated concurrency levels |
| `--output` | auto-named | Output JSON file path |
| `--lang` | auto-detect | Output language (`en` / `zh`) |
| `--version` | - | Show version |

## Output Format

The JSON output follows the `BenchmarkSession` schema, containing:

- Test config (prompt, maxTokens, repeatCount, concurrencyLevels)
- Aggregated metrics per endpoint (TTFT / TPS / ITL / E2E with mean/median/p95/p99/min/max/stdDev)
- Concurrency stress results (throughput and latency per level)
- Five-dimension radar score (Speed / Responsiveness / Smoothness / Scalability / Stability)
- Raw request data (per-request token timestamps)

## Import into Web Dashboard

The JSON output is directly compatible with the web dashboard:

1. Open [benchmark-for-llm.vercel.app](https://benchmark-for-llm.vercel.app)
2. Switch to the **History** tab
3. Click **Import**
4. Select the CLI output JSON file

## Supported APIs

- OpenAI Chat Completions API (`/v1/chat/completions`)
- Ollama (OpenAI-compatible + native format)
- LM Studio
- vLLM
- llama.cpp
- Any SSE streaming OpenAI-compatible API

## Development

```bash
cd runner
uv build          # Build distribution
uv publish        # Publish to PyPI (requires token)
```

## License

MIT

---

# llm-benchmark-runner (中文)

LLM 推理性能测评 CLI 工具 -- 测量 TTFT / TPS / ITL / E2E 延迟，输出标准 JSON 可直接导入 [Web 端](https://benchmark-for-llm.vercel.app) 查看可视化图表。

适用于浏览器无法触达的场景（CORS 未配置、无头服务器 SSH 环境、CI/CD 集成等）。

## 安装

```bash
pip install llm-benchmark-runner
# 或
uv pip install llm-benchmark-runner
```

## 使用

```bash
# 测试本地 Ollama
llm-benchmark --url http://localhost:11434 --model llama3.2

# 强制中文输出
llm-benchmark --url http://localhost:11434 --model llama3.2 --lang zh

# 完整参数
llm-benchmark \
  --url http://localhost:11434 \
  --model llama3.2 \
  --repeat 10 \
  --concurrency 1,2,4,8 \
  --output results.json
```

## 参数说明

| 参数 | 默认值 | 说明 |
|---|---|---|
| `--url` | (必填) | 模型 API 的 Base URL |
| `--model` | (必填) | Model ID |
| `--name` | 自动生成 | 端点显示名称 |
| `--api-key` | 空 | API Key |
| `--prompt` | 内置 | 测试 Prompt |
| `--max-tokens` | 256 | 最大输出 token 数 |
| `--repeat` | 5 | 每个并发级别重复次数 |
| `--concurrency` | 1,2,4,8 | 并发级别（逗号分隔） |
| `--output` | 自动命名 | 输出 JSON 文件路径 |
| `--lang` | 自动检测 | 输出语言（`en` / `zh`） |
| `--version` | - | 显示版本号 |

## 导入 Web 端

CLI 输出的 JSON 文件可直接导入 Web 端的"历史记录 -> 导入"查看可视化图表。

## 开源协议

MIT
