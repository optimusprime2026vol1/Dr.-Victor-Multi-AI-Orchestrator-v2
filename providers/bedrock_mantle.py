#!/usr/bin/env python3
"""AWS Bedrock Mantle adapter for Victor's SOUL bootstrap.

Uses the OpenAI-compatible Mantle model-list endpoint for a non-inference
credential/model health check. Secret values are never printed or persisted.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any

REGION = "us-east-1"
BASE_URL = f"https://bedrock-mantle.{REGION}.api.aws/v1"
MODELS_URL = f"{BASE_URL}/models"


def health_check(api_key: str, model_candidates: list[str]) -> dict[str, Any]:
    req = urllib.request.Request(
        MODELS_URL,
        method="GET",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "User-Agent": "victor-soul-bootstrap/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as exc:
        return {
            "provider": "bedrock_mantle",
            "health": "FAILED",
            "error_class": "HTTPError",
            "http_status": exc.code,
            "credential_status": "SET",
            "endpoint": MODELS_URL,
            "region": REGION,
            "paid_inference_call": False,
        }
    except Exception as exc:
        return {
            "provider": "bedrock_mantle",
            "health": "FAILED",
            "error_class": type(exc).__name__,
            "credential_status": "SET",
            "endpoint": MODELS_URL,
            "region": REGION,
            "paid_inference_call": False,
        }

    raw_models = payload.get("data", []) if isinstance(payload, dict) else []
    available: list[str] = []
    for item in raw_models:
        if isinstance(item, dict) and isinstance(item.get("id"), str):
            available.append(item["id"])
        elif isinstance(item, str):
            available.append(item)

    selected = next((model for model in model_candidates if model in available), None)
    if not selected:
        return {
            "provider": "bedrock_mantle",
            "health": "FAILED",
            "error_class": "DeclaredModelsUnavailable",
            "credential_status": "SET",
            "endpoint": MODELS_URL,
            "region": REGION,
            "available_model_count": len(available),
            "paid_inference_call": False,
        }

    return {
        "provider": "bedrock_mantle",
        "health": "HEALTHY",
        "credential_status": "SET",
        "endpoint": MODELS_URL,
        "region": REGION,
        "selected_model": selected,
        "available_declared_models": [m for m in model_candidates if m in available],
        "paid_inference_call": False,
    }
