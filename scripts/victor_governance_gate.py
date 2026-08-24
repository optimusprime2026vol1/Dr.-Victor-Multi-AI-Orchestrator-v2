#!/usr/bin/env python3
"""Dr. Victor deterministic fail-closed governance gate.

Any consequential orchestration entry point must call require_ready() before
issuing department instructions or mutating consequential organization state.
Diagnostics/reporting may continue while the gate is invalid.
"""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOUL = ROOT / "VICTOR_SOUL.md"
CHARTER = ROOT / "VICTOR_EXECUTIVE_CHARTER.md"
RULES = ROOT / "VICTOR_MASTER_RULE_BOOK.md"
REGISTRY = ROOT / "data" / "department_registry.json"
PROTOCOL = ROOT / "data" / "management_protocol.json"
OUT = ROOT / "data" / "victor_governance_status.json"

REQUIRED_SOUL = ("# DR. VICTOR — SOUL CONTRACT", "## 1. Existence / readiness gate", "## 7. Completion truth gate")
REQUIRED_RULES = ("# DR. VICTOR — MASTER RULE BOOK", "# 1. SUPREME AUTHORITY & HIERARCHY", "# 19. CONFLICT RESOLUTION / PRECEDENCE")
REQUIRED_CHARTER = ("Founder", "Victor")


class VictorGovernanceError(RuntimeError):
    pass


def _read(path):
    try:return path.read_text(encoding="utf-8")
    except Exception:return ""


def _json(path):
    try:return json.loads(_read(path))
    except Exception:return None


def evaluate(action="readiness", write_status=True):
    soul=_read(SOUL);rules=_read(RULES);charter=_read(CHARTER);registry=_json(REGISTRY);protocol=_json(PROTOCOL)
    checks={
        "soul_present": bool(soul.strip()),
        "soul_contract_valid": bool(soul.strip()) and all(x in soul for x in REQUIRED_SOUL),
        "master_rule_book_present": bool(rules.strip()),
        "master_rule_book_valid": bool(rules.strip()) and all(x in rules for x in REQUIRED_RULES),
        "executive_charter_present": bool(charter.strip()),
        "executive_charter_valid": bool(charter.strip()) and all(x in charter for x in REQUIRED_CHARTER),
        "department_registry_present": isinstance(registry,dict),
        "credential_isolation_locked": isinstance(registry,dict) and registry.get("credential_policy")=="department_scoped_only" and registry.get("shared_secret_pool") is False,
        "management_protocol_present": isinstance(protocol,dict),
    }
    valid=all(checks.values());failed=[k for k,v in checks.items() if v is not True]
    result={
        "mode":"hard_fail_closed",
        "hard_fail_closed":True,
        "action":action,
        "valid":valid,
        "state":"READY" if valid else "SAFE_STOP",
        "checks":checks,
        "failed_checks":failed,
        "soul_sha256":hashlib.sha256(soul.encode()).hexdigest() if soul else None,
        "master_rule_book_sha256":hashlib.sha256(rules.encode()).hexdigest() if rules else None,
        "executive_charter_sha256":hashlib.sha256(charter.encode()).hexdigest() if charter else None,
        "execution_effect":"CONSEQUENTIAL_ORCHESTRATION_ALLOWED" if valid else "CONSEQUENTIAL_ORCHESTRATION_BLOCKED",
        "diagnostics_allowed":True,
        "checked_at_utc":datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    if write_status:
        OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    return result


def require_ready(action="consequential_orchestration"):
    result=evaluate(action=action,write_status=True)
    if not result["valid"]:
        raise VictorGovernanceError("VICTOR_SAFE_STOP: governance gate failed: "+(", ".join(result["failed_checks"]) or "unknown"))
    return result


if __name__=="__main__":
    r=evaluate(action="cli_preflight",write_status=True)
    print(json.dumps(r,ensure_ascii=False))
    raise SystemExit(0 if r["valid"] else 3)
