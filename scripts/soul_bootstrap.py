#!/usr/bin/env python3
"""Deterministic SOUL -> provider bootstrap for Dr. Victor.

This script validates Victor's Soul, discovers only declared repo-scoped
credentials, health-checks providers through safe adapters, and records
non-secret runtime evidence. It never prints or persists secret values.
"""
from __future__ import annotations

import hashlib
import importlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "AI_RUNTIME_MANIFEST.json"


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_status(path: Path, status: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(status, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def fail_status(state: str, manifest: dict[str, Any] | None, detail: str, code: int) -> int:
    status_rel = (manifest or {}).get("status_path", "data/ai_runtime_status.json")
    status_path = ROOT / status_rel
    status = {
        "schema_version": 1,
        "department": (manifest or {}).get("department", "Dr. Victor"),
        "checked_at_utc": utc_now(),
        "state": state,
        "detail": detail,
        "selected_provider": None,
        "selected_model": None,
        "secret_values_exposed": False,
        "paid_inference_call": False,
    }
    write_status(status_path, status)
    print(json.dumps(status, ensure_ascii=False))
    return code


def main() -> int:
    if not MANIFEST_PATH.exists():
        return fail_status("BOOTSTRAP_COMPONENT_MISSING", None, "AI_RUNTIME_MANIFEST.json missing", 4)

    try:
        manifest = load_json(MANIFEST_PATH)
    except Exception as exc:
        return fail_status("BOOTSTRAP_CONFIG_INVALID", None, type(exc).__name__, 4)

    status_path = ROOT / manifest.get("status_path", "data/ai_runtime_status.json")
    soul_path = ROOT / manifest.get("soul_path", "VICTOR_SOUL.md")

    if not manifest.get("auto_bootstrap", False):
        return fail_status("BOOTSTRAP_DISABLED", manifest, "auto_bootstrap=false", 4)

    if not soul_path.exists() or soul_path.stat().st_size < 100:
        return fail_status("SOUL_INVALID", manifest, "Soul missing or too small", 4)

    soul_text = soul_path.read_text(encoding="utf-8", errors="replace")
    required_markers = ["Authority:", "Role:"]
    if any(marker not in soul_text for marker in required_markers):
        return fail_status("SOUL_INVALID", manifest, "Required Soul identity markers missing", 4)

    providers = manifest.get("providers", {})
    priority = manifest.get("provider_priority", [])
    credential_presence: dict[str, str] = {}
    health_results: list[dict[str, Any]] = []
    saw_credential = False

    for provider_name in priority:
        cfg = providers.get(provider_name, {})
        if not cfg.get("enabled", False):
            continue

        credential_env = cfg.get("credential_env")
        if not credential_env:
            health_results.append({
                "provider": provider_name,
                "health": "CONFIG_INVALID",
                "error_class": "MissingCredentialEnv",
            })
            continue

        api_key = (os.environ.get(credential_env) or "").strip()
        credential_presence[provider_name] = "SET" if api_key else "EMPTY"
        if not api_key:
            continue

        saw_credential = True
        adapter_name = cfg.get("adapter")
        if not adapter_name:
            health_results.append({
                "provider": provider_name,
                "health": "CONFIG_INVALID",
                "error_class": "MissingAdapter",
            })
            continue

        try:
            adapter = importlib.import_module(adapter_name)
            result = adapter.health_check(api_key, cfg.get("model_candidates", []))
        except Exception as exc:
            result = {
                "provider": provider_name,
                "health": "FAILED",
                "error_class": type(exc).__name__,
                "credential_status": "SET",
                "paid_inference_call": False,
            }

        health_results.append(result)
        if result.get("health") == "HEALTHY" and result.get("selected_model"):
            status = {
                "schema_version": 1,
                "department": manifest.get("department", "Dr. Victor"),
                "checked_at_utc": utc_now(),
                "state": "READY",
                "soul": {
                    "path": manifest.get("soul_path", "VICTOR_SOUL.md"),
                    "sha256": sha256_file(soul_path),
                    "valid": True,
                },
                "manifest": {
                    "path": "AI_RUNTIME_MANIFEST.json",
                    "sha256": sha256_file(MANIFEST_PATH),
                },
                "selected_provider": provider_name,
                "selected_model": result.get("selected_model"),
                "credential_presence": credential_presence,
                "provider_health": result,
                "secret_values_exposed": False,
                "paid_inference_call": False,
                "authority_effect": "TECHNICAL_RUNTIME_ONLY_NO_BUSINESS_AUTHORITY_EXPANSION",
            }
            write_status(status_path, status)
            print(json.dumps(status, ensure_ascii=False))
            return 0

    state = "PROVIDER_HEALTH_FAILED" if saw_credential else "WAITING_CREDENTIAL"
    status = {
        "schema_version": 1,
        "department": manifest.get("department", "Dr. Victor"),
        "checked_at_utc": utc_now(),
        "state": state,
        "soul": {
            "path": manifest.get("soul_path", "VICTOR_SOUL.md"),
            "sha256": sha256_file(soul_path),
            "valid": True,
        },
        "manifest": {
            "path": "AI_RUNTIME_MANIFEST.json",
            "sha256": sha256_file(MANIFEST_PATH),
        },
        "selected_provider": None,
        "selected_model": None,
        "credential_presence": credential_presence,
        "provider_health_attempts": health_results,
        "secret_values_exposed": False,
        "paid_inference_call": False,
        "authority_effect": "NONE",
    }
    write_status(status_path, status)
    print(json.dumps(status, ensure_ascii=False))
    return 3 if saw_credential else 2


if __name__ == "__main__":
    sys.exit(main())
