"""Safe Anthropic provider adapter for Victor SOUL bootstrap.

The health check performs an authenticated model-list request only. It does not
make a Messages/inference request and never logs or persists the API key.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any, Iterable

MODELS_ENDPOINT = "https://api.anthropic.com/v1/models"
ANTHROPIC_VERSION = "2023-06-01"


def _safe_error(exc: Exception) -> dict[str, Any]:
    if isinstance(exc, urllib.error.HTTPError):
        return {
            "health": "FAILED",
            "error_class": "HTTPError",
            "http_status": exc.code,
        }
    if isinstance(exc, urllib.error.URLError):
        return {
            "health": "FAILED",
            "error_class": "URLError",
            "reason_type": type(exc.reason).__name__,
        }
    return {
        "health": "FAILED",
        "error_class": type(exc).__name__,
    }


def _choose_model(visible: set[str], candidates: Iterable[str]) -> str | None:
    for candidate in candidates:
        if candidate in visible:
            return candidate

    # Deterministic fallback for valid keys whose accessible model set differs
    # from the manifest's hints. Prefer balanced Sonnet, then low-cost Haiku,
    # then Opus, and finally lexical order.
    for family in ("sonnet", "haiku", "opus"):
        matches = sorted(model for model in visible if family in model.lower())
        if matches:
            return matches[-1]
    return sorted(visible)[-1] if visible else None


def health_check(api_key: str, model_candidates: Iterable[str]) -> dict[str, Any]:
    """Authenticate safely and resolve one accessible Claude model."""
    key = (api_key or "").strip()
    if not key:
        return {
            "provider": "anthropic",
            "health": "CREDENTIAL_MISSING",
            "credential_status": "EMPTY",
            "paid_inference_call": False,
        }

    request = urllib.request.Request(
        MODELS_ENDPOINT,
        method="GET",
        headers={
            "x-api-key": key,
            "anthropic-version": ANTHROPIC_VERSION,
            "accept": "application/json",
            "user-agent": "Dr-Victor-SOUL-Bootstrap/1.0",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:  # sanitized: no response body/header/key persistence
        result = _safe_error(exc)
        result.update(
            {
                "provider": "anthropic",
                "credential_status": "SET",
                "endpoint": MODELS_ENDPOINT,
                "paid_inference_call": False,
            }
        )
        return result

    model_ids = {
        item.get("id")
        for item in payload.get("data", [])
        if isinstance(item, dict) and isinstance(item.get("id"), str)
    }
    selected_model = _choose_model(model_ids, model_candidates)

    return {
        "provider": "anthropic",
        "health": "HEALTHY" if selected_model else "HEALTHY_MODEL_UNRESOLVED",
        "credential_status": "SET",
        "endpoint": MODELS_ENDPOINT,
        "models_visible_count": len(model_ids),
        "selected_model": selected_model,
        "candidate_match": selected_model in set(model_candidates) if selected_model else False,
        "paid_inference_call": False,
    }
