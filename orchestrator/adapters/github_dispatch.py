from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from typing import Any

API = "https://api.github.com"
TIMEOUT = 30
RAW = "https://raw.githubusercontent.com"


def _token() -> str:
    return (
        os.environ.get("VICTOR_DISPATCH_TOKEN", "").strip()
        or os.environ.get("GITHUB_TOKEN", "").strip()
    )


def _request(method: str, url: str, token: str, body: dict | None = None) -> tuple[int, Any]:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    request = urllib.request.Request(url, data=data, method=method)
    request.add_header("Accept", "application/vnd.github+json")
    request.add_header("Authorization", f"Bearer {token}")
    request.add_header("X-GitHub-Api-Version", "2022-11-28")
    if data is not None:
        request.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            raw = response.read().decode("utf-8")
            return response.status, (json.loads(raw) if raw.strip() else {})
    except urllib.error.HTTPError as exc:
        try:
            payload = json.loads(exc.read().decode("utf-8"))
        except Exception:
            payload = {}
        return exc.code, payload
    except urllib.error.URLError:
        return 0, {}


def _read_contract(repository: str, path: str) -> dict[str, Any] | None:
    """Fetch a department's published contract without authentication."""
    url = f"{RAW}/{repository}/main/{path.lstrip('/')}"
    try:
        with urllib.request.urlopen(url, timeout=TIMEOUT) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def _blocked(reason: str, **extra: Any) -> dict[str, Any]:
    result = {
        "ok": False,
        "retryable": False,
        "reason": reason,
        "adapter": "github_dispatch",
        "evidence_level": "PROCESSED",
    }
    result.update(extra)
    return result


def execute(task: dict[str, Any], contract: dict[str, Any]) -> dict[str, Any]:
    """Dispatch a governed task to a department's own GitHub Actions runtime.

    This adapter performs a real external action, so every precondition is
    checked fail-closed before the dispatch call is made.
    """
    department = contract.get("id")
    repository = str(contract.get("repository", "")).strip()
    workflow = str(contract.get("transport_workflow", "")).strip()

    if not repository or "/" not in repository:
        return _blocked("DEPARTMENT_REPOSITORY_NOT_CONFIGURED", department=department)
    if not workflow:
        return _blocked("DEPARTMENT_TRANSPORT_WORKFLOW_NOT_CONFIGURED", department=department)

    token = _token()
    if not token:
        return _blocked("VICTOR_DISPATCH_TOKEN_MISSING", department=department)

    contract_ref = str(contract.get("contract_ref", "integration/victor_contract.json"))
    published = _read_contract(repository, contract_ref)
    if published is None:
        return _blocked("DEPARTMENT_CONTRACT_UNREACHABLE", department=department, repository=repository)
    if published.get("department_id") != department:
        return _blocked("DEPARTMENT_CONTRACT_ID_MISMATCH", department=department)
    if str(published.get("manager", "")).lower() != "victor":
        return _blocked("DEPARTMENT_DOES_NOT_REPORT_TO_VICTOR", department=department)

    task_id = str(task.get("id") or task.get("task_id") or "").strip()
    if not task_id:
        return _blocked("TASK_ID_MISSING", department=department)

    payload = {
        "ref": "main",
        "inputs": {
            "task_id": task_id,
            "task_type": str(task.get("task_type") or "GOVERNED_STATUS_REVERT"),
            "payload": json.dumps(
                {
                    "objective": task.get("objective", ""),
                    "capabilities": task.get("capabilities") or ["plan"],
                    "authority_context": "victor_orchestration",
                    "dispatched_at": datetime.now(timezone.utc).isoformat(),
                },
                ensure_ascii=False,
            ),
        },
    }

    url = f"{API}/repos/{repository}/actions/workflows/{urllib.parse.quote(workflow)}/dispatches"
    status, body = _request("POST", url, token, payload)

    if status == 204:
        return {
            "ok": True,
            "retryable": False,
            "adapter": "github_dispatch",
            "result": {
                "kind": "DEPARTMENT_WORKFLOW_DISPATCHED",
                "department": department,
                "repository": repository,
                "workflow": workflow,
                "task_id": task_id,
                "external_side_effect": True,
                "credential_access": False,
                "evidence_path": f"integration/results/victor_tasks/{task_id}.json",
            },
            "evidence_level": "API_CONFIRMED",
        }

    retryable = status in {0, 429, 500, 502, 503, 504}
    message = str(body.get("message", "dispatch rejected"))[:200] if isinstance(body, dict) else ""
    return {
        "ok": False,
        "retryable": retryable,
        "reason": f"DISPATCH_FAILED_HTTP_{status}: {message}",
        "adapter": "github_dispatch",
        "department": department,
        "evidence_level": "PROCESSED",
    }
