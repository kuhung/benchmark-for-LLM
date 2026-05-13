# Python CLI Runner

适用于浏览器无法触达的场景（CORS 未配置、无头服务器等）。

## 安装

```bash
cd runner
pip install -r requirements.txt
```

## 使用

```bash
# 基本用法
python benchmark_runner.py --url http://localhost:11434 --model llama3.2

# 完整参数
python benchmark_runner.py \
  --url http://localhost:11434 \
  --model llama3.2 \
  --name "My Ollama" \
  --prompt "Write a short essay about AI." \
  --max-tokens 512 \
  --repeat 10 \
  --concurrency 1,2,4,8 \
  --output results.json
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

## 导入 Web 端

输出的 JSON 文件可直接拖入 Web 端的"历史记录 -> 导入 JSON"查看可视化图表。
