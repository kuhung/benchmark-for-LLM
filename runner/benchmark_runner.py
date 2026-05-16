#!/usr/bin/env python3
"""LLM Inference Benchmark - Python CLI Runner

输出标准 JSON 格式，兼容 Web 端导入查看图表。
适用场景：CORS 无法配置、无头服务器 SSH 环境、CI/CD 集成。
"""

import argparse
import asyncio
import json
import math
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path

import httpx
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
from rich.table import Table

console = Console()


@dataclass
class Endpoint:
    id: str
    name: str
    base_url: str
    model_id: str
    api_key: str = ""


@dataclass
class RawResult:
    endpoint_id: str
    request_start: float
    request_end: float = 0.0
    token_timestamps: list[float] = field(default_factory=list)
    output_token_count: int = 0
    status: str = "success"
    error: str = ""


@dataclass
class StatsSummary:
    mean: float = 0.0
    median: float = 0.0
    p95: float = 0.0
    p99: float = 0.0
    min: float = 0.0
    max: float = 0.0
    std_dev: float = 0.0


def stats_to_web_dict(stats: StatsSummary) -> dict:
    return {
        "mean": stats.mean,
        "median": stats.median,
        "p95": stats.p95,
        "p99": stats.p99,
        "min": stats.min,
        "max": stats.max,
        "stdDev": stats.std_dev,
    }


def percentile(sorted_values: list[float], p: float) -> float:
    if not sorted_values:
        return 0.0
    if len(sorted_values) == 1:
        return sorted_values[0]
    idx = (p / 100) * (len(sorted_values) - 1)
    lower = int(idx)
    upper = min(lower + 1, len(sorted_values) - 1)
    frac = idx - lower
    return sorted_values[lower] + (sorted_values[upper] - sorted_values[lower]) * frac


def compute_stats(values: list[float]) -> StatsSummary:
    if not values:
        return StatsSummary()
    sorted_v = sorted(values)
    n = len(sorted_v)
    mean = sum(sorted_v) / n
    variance = sum((v - mean) ** 2 for v in sorted_v) / n
    return StatsSummary(
        mean=mean,
        median=percentile(sorted_v, 50),
        p95=percentile(sorted_v, 95),
        p99=percentile(sorted_v, 99),
        min=sorted_v[0],
        max=sorted_v[-1],
        std_dev=math.sqrt(variance),
    )


def _extract_content(chunk: dict) -> str | None:
    # OpenAI standard: choices[0].delta.content / choices[0].message.content
    choices = chunk.get("choices", [])
    if choices and isinstance(choices[0], dict):
        first = choices[0]
        delta = first.get("delta", {}) or {}
        message = first.get("message", {}) or {}
        content = (
            delta.get("content")
            or message.get("content")
            or delta.get("text")
            or message.get("text")
            or first.get("text")
        )
        if content:
            return content

    # Ollama native: top-level message.content
    top_msg = chunk.get("message")
    if isinstance(top_msg, dict) and top_msg.get("content"):
        return top_msg["content"]

    # Ollama /api/generate: top-level response
    if chunk.get("response") and isinstance(chunk["response"], str):
        return chunk["response"]

    # LM Studio event data: top-level content / delta.content
    if chunk.get("content") and isinstance(chunk["content"], str):
        return chunk["content"]
    top_delta = chunk.get("delta")
    if isinstance(top_delta, dict) and top_delta.get("content"):
        return top_delta["content"]

    return None


async def run_single_benchmark(
    client: httpx.AsyncClient,
    endpoint: Endpoint,
    prompt: str,
    max_tokens: int,
) -> RawResult:
    token_timestamps: list[float] = []
    request_start = time.perf_counter()

    headers = {"Content-Type": "application/json"}
    if endpoint.api_key:
        headers["Authorization"] = f"Bearer {endpoint.api_key}"

    try:
        async with client.stream(
            "POST",
            f"{endpoint.base_url}/v1/chat/completions",
            json={
                "model": endpoint.model_id,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "stream": True,
            },
            headers=headers,
            timeout=60.0,
        ) as response:
            if response.status_code != 200:
                error_body = ""
                try:
                    error_body = await response.aread()
                    error_body = error_body.decode("utf-8")[:200]
                except Exception:
                    pass
                return RawResult(
                    endpoint_id=endpoint.id,
                    request_start=request_start,
                    request_end=time.perf_counter(),
                    status="error",
                    error=f"HTTP {response.status_code}: {error_body}",
                )
            
            raw_output = ""
            async for line in response.aiter_lines():
                if len(raw_output) < 2000:
                    raw_output += line + "\n"
                stripped = line.strip()
                if not stripped or stripped.startswith("event:") or stripped.startswith(":"):
                    continue
                if stripped.startswith("data:"):
                    data = stripped[6:] if stripped.startswith("data: ") else stripped[5:]
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                elif stripped.startswith("{"):
                    try:
                        chunk = json.loads(stripped)
                    except json.JSONDecodeError:
                        continue
                    if chunk.get("done") is True:
                        break
                else:
                    continue
                content = _extract_content(chunk)
                if content:
                    token_timestamps.append(time.perf_counter())
            
            if not token_timestamps:
                try:
                    parsed = json.loads(raw_output)
                    content = _extract_content(parsed)
                    if content:
                        token_timestamps.append(time.perf_counter())
                except json.JSONDecodeError:
                    pass
                if not token_timestamps:
                    error_msg = f"No content chunks extracted. Raw response: {raw_output[:500] or '<empty>'}"
                    console.print(f"[yellow]Warning: {error_msg}[/yellow]")
                    return RawResult(
                        endpoint_id=endpoint.id,
                        request_start=request_start,
                        request_end=time.perf_counter(),
                        status="error",
                        error=error_msg,
                    )

    except Exception as e:
        return RawResult(
            endpoint_id=endpoint.id,
            request_start=request_start,
            request_end=time.perf_counter(),
            token_timestamps=token_timestamps,
            output_token_count=len(token_timestamps),
            status="error",
            error=str(e),
        )

    return RawResult(
        endpoint_id=endpoint.id,
        request_start=request_start,
        request_end=time.perf_counter(),
        token_timestamps=token_timestamps,
        output_token_count=len(token_timestamps),
        status="success",
    )


def compute_single_metrics(raw: RawResult) -> dict | None:
    if raw.status != "success" or len(raw.token_timestamps) == 0:
        return None
    ttft = (raw.token_timestamps[0] - raw.request_start) * 1000
    first_token = raw.token_timestamps[0]
    request_end = raw.request_end or raw.token_timestamps[-1]
    duration = request_end - first_token
    tps = raw.output_token_count / duration if duration > 0 else 0

    itl = [
        (raw.token_timestamps[i + 1] - raw.token_timestamps[i]) * 1000
        for i in range(len(raw.token_timestamps) - 1)
    ]
    e2e = (request_end - raw.request_start) * 1000
    return {"ttft": ttft, "tps": tps, "itl": itl, "e2eLatency": e2e}


def aggregate_results(raw_results: list[RawResult]) -> dict:
    successful = [r for r in raw_results if r.status == "success"]
    metrics_list = [m for r in successful if (m := compute_single_metrics(r)) is not None]

    if not metrics_list:
        empty = stats_to_web_dict(StatsSummary())
        return {
            "ttft": empty, "tps": empty, "itl": empty, "e2eLatency": empty,
            "successRate": (len(successful) / len(raw_results)) * 100 if raw_results else 0,
            "totalRequests": len(raw_results),
        }

    all_itl = [v for m in metrics_list for v in m["itl"]]
    return {
        "ttft": stats_to_web_dict(compute_stats([m["ttft"] for m in metrics_list])),
        "tps": stats_to_web_dict(compute_stats([m["tps"] for m in metrics_list])),
        "itl": stats_to_web_dict(compute_stats(all_itl)),
        "e2eLatency": stats_to_web_dict(compute_stats([m["e2eLatency"] for m in metrics_list])),
        "successRate": (len(successful) / len(raw_results)) * 100,
        "totalRequests": len(raw_results),
    }


def compute_score(single_metrics: dict, concurrency_results: list[dict]) -> dict:
    def linear(value, vmin, vmax):
        return max(0, min(100, ((value - vmin) / (vmax - vmin)) * 100))

    def inverse_linear(value, best, worst):
        return max(0, min(100, ((worst - value) / (worst - best)) * 100))

    speed = linear(single_metrics["tps"]["median"], 5, 100)
    responsiveness = inverse_linear(single_metrics["ttft"]["median"], 100, 2000)
    smoothness = inverse_linear(single_metrics["itl"]["p95"], 20, 200)

    scalability = 50.0
    if len(concurrency_results) >= 2:
        c1 = next((r for r in concurrency_results if r["concurrency"] == 1), None)
        c_last = concurrency_results[-1]
        if c1 and c1["metrics"]["tps"]["median"] > 0:
            ratio = c_last["metrics"]["tps"]["median"] / c1["metrics"]["tps"]["median"]
            scalability = linear(ratio, 0.3, 1.0)

    cv = (single_metrics["ttft"]["stdDev"] / single_metrics["ttft"]["mean"]
          if single_metrics["ttft"]["mean"] > 0 else 0)
    stability = inverse_linear(cv, 0.05, 0.8)

    overall = round((speed + responsiveness + smoothness + scalability + stability) / 5)
    return {
        "speed": round(speed),
        "responsiveness": round(responsiveness),
        "smoothness": round(smoothness),
        "scalability": round(scalability),
        "stability": round(stability),
        "overall": overall,
    }


async def benchmark_endpoint(
    endpoint: Endpoint,
    prompt: str,
    max_tokens: int,
    repeat: int,
    concurrency_levels: list[int],
    progress: Progress,
    task_id,
) -> dict:
    all_raw: list[RawResult] = []
    concurrency_results = []

    async with httpx.AsyncClient() as client:
        for concurrency in concurrency_levels:
            round_results: list[RawResult] = []
            batches = math.ceil(repeat / concurrency)

            for batch in range(batches):
                batch_size = min(concurrency, repeat - batch * concurrency)
                tasks = [
                    run_single_benchmark(client, endpoint, prompt, max_tokens)
                    for _ in range(batch_size)
                ]
                results = await asyncio.gather(*tasks)
                round_results.extend(results)
                progress.advance(task_id, batch_size)

            all_raw.extend(round_results)
            metrics = aggregate_results(round_results)

            successful = [r for r in round_results if r.status == "success" and r.token_timestamps]
            wall_start = min(r.request_start for r in round_results)
            wall_end = max(r.token_timestamps[-1] for r in successful) if successful else wall_start
            wall_time = wall_end - wall_start

            total_tokens = sum(r.output_token_count for r in round_results)
            completed = len([r for r in round_results if r.status == "success"])

            concurrency_results.append({
                "concurrency": concurrency,
                "requestThroughput": completed / wall_time if wall_time > 0 else 0,
                "tokenThroughput": total_tokens / wall_time if wall_time > 0 else 0,
                "metrics": metrics,
            })

    single_concurrency = next(
        (r["metrics"] for r in concurrency_results if r["concurrency"] == 1),
        aggregate_results(all_raw[:repeat]),
    )

    score = compute_score(single_concurrency, concurrency_results)

    raw_dicts = []
    for r in all_raw:
        raw_dicts.append({
            "endpointId": r.endpoint_id,
            "requestStart": r.request_start,
            "requestEnd": r.request_end or (r.token_timestamps[-1] if r.token_timestamps else r.request_start),
            "tokenTimestamps": r.token_timestamps,
            "outputTokenCount": r.output_token_count,
            "status": r.status,
            "error": r.error or None,
        })

    return {
        "endpoint": {
            "id": endpoint.id,
            "name": endpoint.name,
            "baseUrl": endpoint.base_url,
            "modelId": endpoint.model_id,
        },
        "singleConcurrency": single_concurrency,
        "concurrencyResults": concurrency_results,
        "rawResults": raw_dicts,
        "score": score,
    }


async def main():
    parser = argparse.ArgumentParser(description="LLM Inference Benchmark CLI Runner")
    parser.add_argument("--url", required=True, help="Base URL (e.g. http://localhost:11434)")
    parser.add_argument("--model", required=True, help="Model ID")
    parser.add_argument("--name", default=None, help="Display name for the endpoint")
    parser.add_argument("--api-key", default="", help="API key (optional)")
    parser.add_argument("--prompt", default="Explain the difference between TCP and UDP protocols.", help="Test prompt")
    parser.add_argument("--max-tokens", type=int, default=256, help="Max output tokens")
    parser.add_argument("--repeat", type=int, default=5, help="Repeat count per concurrency level")
    parser.add_argument("--concurrency", default="1,2,4,8", help="Comma-separated concurrency levels")
    parser.add_argument("--output", default=None, help="Output JSON file path")
    args = parser.parse_args()

    concurrency_levels = [int(x) for x in args.concurrency.split(",")]
    total_tasks = len(concurrency_levels) * args.repeat

    endpoint = Endpoint(
        id=str(uuid.uuid4()),
        name=args.name or f"{args.model}@{args.url}",
        base_url=args.url.rstrip("/"),
        model_id=args.model,
        api_key=args.api_key,
    )

    console.print(f"\n[bold]LLM Inference Benchmark[/bold]")
    console.print(f"  Endpoint: {endpoint.name}")
    console.print(f"  Model: {endpoint.model_id}")
    console.print(f"  Repeat: {args.repeat} | Concurrency: {args.concurrency}")
    console.print(f"  Max Tokens: {args.max_tokens}\n")

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task(f"Benchmarking {endpoint.name}", total=total_tasks)
        result = await benchmark_endpoint(
            endpoint, args.prompt, args.max_tokens, args.repeat, concurrency_levels, progress, task
        )

    table = Table(title="Results Summary")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", justify="right")

    sm = result["singleConcurrency"]
    table.add_row("TTFT P50", f"{sm['ttft']['median']:.0f} ms")
    table.add_row("TTFT P95", f"{sm['ttft']['p95']:.0f} ms")
    table.add_row("TPS P50", f"{sm['tps']['median']:.1f} tokens/s")
    table.add_row("ITL P95", f"{sm['itl']['p95']:.1f} ms")
    table.add_row("E2E Latency P50", f"{sm['e2eLatency']['median']:.0f} ms")
    table.add_row("Success Rate", f"{sm['successRate']:.0f}%")
    table.add_row("", "")
    table.add_row("Score - Speed", f"{result['score']['speed']}")
    table.add_row("Score - Responsiveness", f"{result['score']['responsiveness']}")
    table.add_row("Score - Smoothness", f"{result['score']['smoothness']}")
    table.add_row("Score - Scalability", f"{result['score']['scalability']}")
    table.add_row("Score - Stability", f"{result['score']['stability']}")
    table.add_row("[bold]Score - Overall[/bold]", f"[bold]{result['score']['overall']}[/bold]")
    console.print(table)

    session = {
        "id": str(uuid.uuid4()),
        "timestamp": int(time.time() * 1000),
        "config": {
            "prompt": args.prompt,
            "maxTokens": args.max_tokens,
            "repeatCount": args.repeat,
            "concurrencyLevels": concurrency_levels,
        },
        "results": [result],
    }

    output_path = args.output or f"benchmark-{time.strftime('%Y%m%d-%H%M%S')}.json"
    Path(output_path).write_text(json.dumps(session, indent=2, default=str))
    console.print(f"\n[green]Results saved to: {output_path}[/green]")
    console.print("[dim]Import this file into the web dashboard to view charts.[/dim]\n")


if __name__ == "__main__":
    asyncio.run(main())
