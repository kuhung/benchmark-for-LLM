# llm-benchmark-runner

[![PyPI version](https://img.shields.io/pypi/v/llm-benchmark-runner.svg)](https://pypi.org/project/llm-benchmark-runner/)
[![Python](https://img.shields.io/pypi/pyversions/llm-benchmark-runner.svg)](https://pypi.org/project/llm-benchmark-runner/)

LLM 推理性能测评 CLI 工具 -- 测量 TTFT / TPS / ITL / E2E 延迟，输出标准 JSON 可直接导入 [Web 端](https://github.com/kuhung/benchmark-for-LLM) 查看可视化图表。

适用于浏览器无法触达的场景（CORS 未配置、无头服务器 SSH 环境、CI/CD 集成等）。

## 安装

**pip：**

```bash
pip install llm-benchmark-runner
```

**uv：**

```bash
uv pip install llm-benchmark-runner
```

**从源码（开发模式）：**

```bash
cd runner
pip install -e .
```

## 使用

```bash
# 基本用法
llm-benchmark --url http://localhost:11434 --model llama3.2

# 完整参数
llm-benchmark \
  --url http://localhost:11434 \
  --model llama3.2 \
  --name "My Ollama" \
  --prompt "Write a short essay about AI." \
  --max-tokens 512 \
  --repeat 10 \
  --concurrency 1,2,4,8 \
  --output results.json

# 也可以用 python -m 方式运行
python -m llm_benchmark_runner --url http://localhost:11434 --model llama3.2
```

## 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--url` | (必填) | 模型 API 的 Base URL |
| `--model` | (必填) | Model ID |
| `--name` | 自动生成 | 端点显示名称 |
| `--api-key` | 空 | API Key |
| `--prompt` | 内置 | 测试 Prompt |
| `--max-tokens` | 256 | 最大输出 token 数 |
| `--repeat` | 5 | 每个并发级别重复次数 |
| `--concurrency` | 1,2,4,8 | 并发级别（逗号分隔） |
| `--output` | 自动命名 | 输出 JSON 文件路径 |
| `--version` | - | 显示版本号 |

## 输出格式

输出的 JSON 文件遵循 `BenchmarkSession` 标准格式，包含：

- 测评配置（prompt、maxTokens、repeatCount、concurrencyLevels）
- 每个端点的聚合指标（TTFT / TPS / ITL / E2E 的 mean/median/p95/p99/min/max/stdDev）
- 并发压测结果（各并发级别的吞吐量和延迟）
- 五维雷达评分（Speed / Responsiveness / Smoothness / Scalability / Stability）
- 原始请求数据（逐请求的 token 时间戳）

## 导入 Web 端

输出的 JSON 文件可直接导入 Web 端的 "历史记录 -> 导入 JSON" 查看可视化图表：

1. 打开 Web 端（https://benchmark-for-llm.vercel.app）
2. 切换到 "历史记录" Tab
3. 点击 "导入" 按钮
4. 选择 CLI 输出的 JSON 文件

## 支持的 API 格式

- OpenAI Chat Completions API（`/v1/chat/completions`）
- Ollama（兼容 OpenAI 格式 + 原生格式）
- LM Studio
- vLLM
- llama.cpp
- 任何支持 SSE streaming 的 OpenAI 兼容 API

## 开发

```bash
cd runner
uv build          # 构建分发包
uv publish        # 发布到 PyPI（需要配置 token）
```

## License

MIT
