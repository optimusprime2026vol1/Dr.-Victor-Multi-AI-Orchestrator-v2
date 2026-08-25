"""Safe OpenAI provider adapter for SOUL bootstrap.

The health check performs an authenticated model-list request only. It does not
make a text-generation/inference request and never logs or persists the key.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any, Iterable

MODELS_ENDPOINT = "https://api.openai.com/v1/models"


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


def health_check(api_key: str, model_candidates: Iterable[str]) -> dict[str, Any]:
    """Authenticate safely and resolve the first visible candidate model."""
    key = (api_key or "").strip()
    if not key:
        return {
            "provider": "openai",
            "health": "CREDENTIAL_MISSING",
            "credential_status": "EMPTY",
            "paid_inference_call": False,
        }

    request = urllib.request.Request(
        MODELS_ENDPOINT,
        method="GET",
        headers={
            "Authorization": f"Bearer {key}",
            "Accept": "application/json",
            "User-Agent": "Dr-Victor-SOUL-Bootstrap/1.0",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:  # sanitized below; never include response bodies/headers
        result = _safe_error(exc)
        result.update(
            {
                "provider": "openai",
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
    selected_model = next((m for m in model_candidates if m in model_ids), None)

    return {
        "provider": "openai",
        "health": "HEALTHY" if selected_model else "HEALTHY_MODEL_UNRESOLVED",
        "credential_status": "SET",
        "endpoint": MODELS_ENDPOINT,
        "models_visible_count": len(model_ids),
        "selected_model": selected_model,
        "candidate_match": selected_model is not None,
        "paid_inference_call": False,
    }
