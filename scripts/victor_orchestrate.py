#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from orchestrator.engine import OrchestrationEngine


def main() -> int:
    parser = argparse.ArgumentParser(description="Plan a safe Dr. Victor orchestration task")
    parser.add_argument("objective")
    parser.add_argument("--department")
    parser.add_argument("--capability", action="append", default=[])
    parser.add_argument("--execute", action="store_true", help="Run executor gate (currently fail-closed; no external side effects)")
    args = parser.parse_args()

    engine = OrchestrationEngine()
    if args.execute:
        result = engine.execute(args.objective, args.department, args.capability)
    else:
        result = engine.plan(args.objective, args.department, args.capability)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["task"]["status"] == "ASSIGNED" else 2


if __name__ == "__main__":
    raise SystemExit(main())
