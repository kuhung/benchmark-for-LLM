"""Internationalization support for the CLI.

Detects locale automatically and falls back to English.
Use ``get_locale()`` to resolve once, then pass the result
to ``t(key, locale)`` for every user-visible string.
"""

from __future__ import annotations

import locale
import os

_TRANSLATIONS: dict[str, dict[str, str]] = {
    # --- CLI header ---
    "header.title": {
        "en": "LLM Inference Benchmark",
        "zh": "LLM 推理性能测评",
    },
    "header.endpoint": {
        "en": "Endpoint",
        "zh": "端点",
    },
    "header.model": {
        "en": "Model",
        "zh": "模型",
    },
    "header.repeat": {
        "en": "Repeat",
        "zh": "重复次数",
    },
    "header.concurrency": {
        "en": "Concurrency",
        "zh": "并发数",
    },
    "header.max_tokens": {
        "en": "Max Tokens",
        "zh": "最大 Token 数",
    },

    # --- progress ---
    "progress.benchmarking": {
        "en": "Benchmarking {name}",
        "zh": "正在测评 {name}",
    },

    # --- results table ---
    "results.title": {
        "en": "Results Summary",
        "zh": "测评结果摘要",
    },
    "results.metric": {
        "en": "Metric",
        "zh": "指标",
    },
    "results.value": {
        "en": "Value",
        "zh": "数值",
    },
    "results.score_overall": {
        "en": "Score - Overall",
        "zh": "综合评分",
    },

    # --- output ---
    "output.saved": {
        "en": "Results saved to: {path}",
        "zh": "结果已保存至: {path}",
    },
    "output.import_hint": {
        "en": "Import this file into the web dashboard to view charts.",
        "zh": "将此文件导入网页端即可查看可视化图表。",
    },

    # --- warnings ---
    "warn.no_content": {
        "en": "Warning: No content chunks extracted. Raw response: {raw}",
        "zh": "警告: 未提取到内容块。原始响应: {raw}",
    },

    # --- argparse ---
    "arg.description": {
        "en": "LLM Inference Benchmark CLI - measure TTFT, TPS, ITL, E2E latency",
        "zh": "LLM 推理性能测评 CLI - 测量 TTFT、TPS、ITL、E2E 延迟",
    },
    "arg.url": {
        "en": "Base URL (e.g. http://localhost:11434)",
        "zh": "基础 URL（如 http://localhost:11434）",
    },
    "arg.model": {
        "en": "Model ID",
        "zh": "模型 ID",
    },
    "arg.name": {
        "en": "Display name for the endpoint",
        "zh": "端点显示名称",
    },
    "arg.api_key": {
        "en": "API key (optional)",
        "zh": "API Key（可选）",
    },
    "arg.prompt": {
        "en": "Test prompt",
        "zh": "测试 Prompt",
    },
    "arg.max_tokens": {
        "en": "Max output tokens",
        "zh": "最大输出 token 数",
    },
    "arg.repeat": {
        "en": "Repeat count per concurrency level",
        "zh": "每个并发级别重复次数",
    },
    "arg.concurrency": {
        "en": "Comma-separated concurrency levels",
        "zh": "逗号分隔的并发级别",
    },
    "arg.output": {
        "en": "Output JSON file path",
        "zh": "输出 JSON 文件路径",
    },
    "arg.lang": {
        "en": "Output language (en/zh, default: auto-detect)",
        "zh": "输出语言（en/zh，默认自动检测）",
    },
}


def get_locale(override: str | None = None) -> str:
    """Resolve the display locale.

    Priority: explicit ``--lang`` flag > ``LANG`` / ``LC_ALL`` env > ``locale.getdefaultlocale()``.
    Returns ``"zh"`` for any Chinese locale, ``"en"`` for everything else.
    """
    if override and override in ("en", "zh"):
        return override

    env_lang = os.environ.get("LANG", "") or os.environ.get("LC_ALL", "")
    if env_lang:
        if env_lang.lower().startswith("zh"):
            return "zh"
        return "en"

    try:
        sys_locale = locale.getdefaultlocale()[0] or ""
    except Exception:
        sys_locale = ""
    if sys_locale.lower().startswith("zh"):
        return "zh"
    return "en"


def t(key: str, loc: str = "en", **kwargs: str) -> str:
    """Look up a translated string.  Falls back to English if key or locale is missing."""
    entry = _TRANSLATIONS.get(key)
    if entry is None:
        return key
    text = entry.get(loc, entry.get("en", key))
    if kwargs:
        text = text.format(**kwargs)
    return text
