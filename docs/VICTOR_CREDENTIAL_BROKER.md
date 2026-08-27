# Victor Credential Broker v1

Tony Stark and HULK never receive Victor's raw credentials. They submit a purpose-scoped, HMAC-signed request to Victor. Victor validates department identity, timestamp, action, repository scope and consequential-action flags, uses the credential inside the Worker, then returns only a sanitized result and audit receipt.

## Pilot actions

- `ai.reason`: bounded reasoning through Victor's configured AI runtime; no external execution claim.
- `github.repository.read`: allowlisted repository metadata.
- `github.workflow_runs.read`: ten latest workflow-run summaries for an allowlisted repository.

No write, arbitrary URL, paid, production, destructive, credential-management or raw-secret operation exists in v1.

## Required Worker secrets

- `BROKER_AUTH_TONY_STARK`: independent high-entropy signing key for Tony.
- `BROKER_AUTH_HULK`: independent high-entropy signing key for HULK.
- Existing `API_VICTOR` and `GITHUB_ORCHESTRATION_TOKEN` remain inside Victor runtime.

The two department signing keys authenticate requests only. They are not Victor service credentials and cannot directly access GitHub or the AI provider.

## Request

`POST /credential-broker` with headers:

- `X-Victor-Timestamp`: Unix epoch milliseconds.
- `X-Victor-Signature`: lowercase hex HMAC-SHA256 of `<timestamp>.<exact raw JSON body>`.

Required JSON fields: `request_id`, `department`, `action`, `purpose`, plus action-specific `resource` or `parameters`. Requests older than five minutes are rejected.

## Result and audit

Successful responses use `EXECUTED_VERIFIED`, include a SHA-256 receipt and state `raw_secret_returned: false`. Cloudflare structured logs record request ID, department, action, status and receipt only—never the secret or raw provider token.
