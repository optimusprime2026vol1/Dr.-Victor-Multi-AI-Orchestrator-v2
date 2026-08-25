# SOUL Plug-and-Play Runtime Standard

**Status:** FOUNDER LOCKED
**Locked by:** Founder Vicky
**Locked on:** 25 Aug 2026
**Applies to:** Dr. Victor and every department/repository onboarded under Victor governance

## 1. Purpose

The organization should not require repeated manual AI-provider wiring for every new department.

The target operating pattern is:

`REPOSITORY + SOUL + SUPPORTED REPO-SCOPED API CREDENTIAL -> SAFE SELF-BOOTSTRAP -> VERIFIED AI RUNTIME`

Once this standard is installed in a repository, the presence of a valid Soul contract and at least one supported repository-scoped provider credential should allow that department to detect, test, select and bind an AI runtime automatically within its existing objective, authority and security boundaries.

SOUL is the governance/identity contract. It does not contain secret values and does not itself become an API key store.

## 2. Required bootstrap components

A production implementation of this standard consists of:

1. `SOUL.md` or the department's canonical Soul path — identity/governance/authority contract.
2. `AI_RUNTIME_MANIFEST.json` — repo-specific runtime/provider declaration and priority.
3. `scripts/soul_bootstrap.py` — deterministic bootstrap and provider-discovery controller.
4. Provider adapters, for example `providers/openai.py`, `providers/bedrock.py`, `providers/deepseek.py`, `providers/gemini.py`.
5. A GitHub Actions/repository bootstrap workflow that runs on the relevant Soul/runtime configuration change and can also be manually dispatched.
6. A non-secret runtime status/evidence file recording which provider was selected and whether the health test passed.

The implementation may use equivalent paths where a department already has a mature runtime, but the same contract and evidence requirements apply.

## 3. Activation sequence

The standard bootstrap sequence is:

`SOUL DETECTED -> LOAD OBJECTIVE/GOVERNANCE -> DISCOVER SUPPORTED CREDENTIAL NAMES -> TEST AVAILABLE PROVIDERS -> SELECT PRIMARY -> CONFIGURE FALLBACKS -> BIND RUNTIME -> RUN HEALTH CHECK -> RECORD EVIDENCE -> READY`

If no supported credential is available:

`SOUL DETECTED -> NO VALID PROVIDER -> WAITING_CREDENTIAL`

The department must not claim `READY` merely because a secret name, workflow, manifest or Soul file exists.

## 4. Provider discovery and selection

Provider selection must be deterministic and repo-safe.

Priority order:

1. An explicit Founder-locked provider/model order for that department.
2. The department's existing canonical runtime/provider configuration.
3. The provider order declared in `AI_RUNTIME_MANIFEST.json`.
4. If no prior order exists, select from supported credentials that are actually present and pass a minimal health test, using a deterministic bootstrap order documented by the implementation.

A repository with only `OPENAI_API_KEY` available may therefore bind OpenAI automatically once the bootstrap standard is installed and the health test succeeds. A repository with an already locked Qwen/Bedrock hierarchy must preserve that hierarchy rather than silently switching to OpenAI because another key exists.

Provider fallback must never change the department's identity, objective, authority, approval gates or evidence standards.

## 5. Secret handling — non-negotiable

- Secret values stay in the current repository/runtime secret store.
- Bootstrap code may test whether a supported credential environment variable is present, but must never print, persist, return, copy or expose its value.
- Logs may report only safe states such as `SET`, `EMPTY`, `HEALTHY`, `FAILED`, provider name, model name and non-sensitive error class/message.
- No cross-department secret copying.
- Victor is not a shared master-secret vault.
- The same provider may be used by multiple departments only through separately scoped credentials in each authorized repository/runtime.
- A common Telegram room must never receive secret values.

## 6. Authority preservation

Self-bootstrap grants technical AI-runtime readiness only. It grants no new business authority.

Automatic provider integration must not:

- rewrite the canonical objective;
- weaken Soul or rule-book constraints;
- bypass Founder approvals;
- authorize spending or paid-tier activation;
- authorize live-money trading;
- authorize external publication;
- change credential ownership;
- modify protected canonical files merely to make a provider work;
- infer permissions from the existence of an API key.

A provider health check is infrastructure evidence, not business-outcome evidence.

## 7. Safe bootstrap mutation boundary

The bootstrapper may automatically create or update only the minimum runtime plumbing that has been pre-authorized by this standard, such as:

- generated non-secret runtime status/config;
- provider selection metadata;
- adapter/runtime binding state;
- health evidence;
- bootstrap logs.

Changes to protected governance, objective, payment, publishing, legal/KYC, credentials or irreversible external state remain behind their normal authority gates.

If required runtime code/adapters are missing, bootstrap must report `BOOTSTRAP_COMPONENT_MISSING` rather than fabricate readiness or weaken controls.

## 8. Runtime manifest contract

`AI_RUNTIME_MANIFEST.json` should be machine-readable and may contain fields such as:

```json
{
  "schema_version": 1,
  "department": "Victor",
  "auto_bootstrap": true,
  "provider_priority": ["openai", "bedrock", "deepseek", "gemini"],
  "supported_secret_names": {
    "openai": "OPENAI_API_KEY",
    "bedrock": "AWS_BEDROCK_API_KEY",
    "deepseek": "DEEPSEEK_API_KEY",
    "gemini": "GEMINI_API_KEY"
  }
}
```

This is an example schema, not a command to force the same provider order on every existing department. Existing Founder-locked provider hierarchies take precedence.

No secret values belong in the manifest.

## 9. Readiness evidence

A successful bootstrap should persist non-secret evidence including at minimum:

- department/repository identity;
- Soul path/hash or version reference;
- objective/config reference;
- selected provider;
- selected model where known;
- fallback providers where configured;
- provider credential presence as boolean/status only;
- health-check result;
- bootstrap timestamp;
- final state: `READY`, `WAITING_CREDENTIAL`, `PROVIDER_FAILED`, `BOOTSTRAP_COMPONENT_MISSING`, or another explicit failure state.

`READY` means the runtime provider was actually health-tested and bound. It does not mean the department's business objective has been achieved.

## 10. Onboarding integration

Victor must treat runtime bootstrap as part of department onboarding.

Recommended state chain:

`DISCOVERED -> OBJECTIVE_VERIFIED -> SOUL_VERIFIED -> RUNTIME_BOOTSTRAPPED -> PROVIDER_HEALTH_VERIFIED -> REPORTING_CONNECTED -> TELEGRAM_CONNECTED -> MANAGED`

A department may remain managed for diagnostics while a provider is unavailable, but it must be reported as runtime-blocked rather than AI-ready.

## 11. Existing mature departments

This standard must not destabilize a mature runtime.

For an existing department:

1. inspect current objective, Soul, provider hierarchy, workflows and validators;
2. preserve any Founder-locked model/provider ordering;
3. install the bootstrap standard as a compatibility layer;
4. health-test before switching any active provider path;
5. do not replace a working mature integration simply because another credential is detected.

## 12. Founder-locked principle

The organization-wide rule is:

> **When a department repository has a valid Soul and an authorized supported API credential, the standard runtime should be capable of discovering and safely integrating that provider automatically, with no secret exposure, no authority expansion, and no false readiness claim.**

Canonical chain:

`SOUL -> PROVIDER DISCOVERY -> HEALTH TEST -> SAFE BINDING -> EVIDENCE -> VERIFIED RUNTIME`

This standard is portable governance plus runtime architecture. A repository must contain or inherit the actual bootstrap implementation/workflow before the behavior can execute; documentation alone must never be represented as a working integration.
