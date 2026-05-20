#!/usr/bin/env python3
"""Backward-compatible entry point.

Prefer using the installed CLI: `llm-benchmark --url ... --model ...`
Or: `python -m llm_benchmark_runner --url ... --model ...`
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_benchmark_runner.cli import main  # noqa: E402

if __name__ == "__main__":
    main()
