# Victor Telegram Webhook Runtime

This directory contains the dedicated Founder↔Victor Telegram webhook runtime.
It is intentionally isolated from department runtimes and department secrets.

## Runtime paths

- `GET /health` — safe readiness metadata only.
- `POST /telegram` — Telegram Bot API webhook target.

## Required Cloudflare Worker secrets / variables

- `TELEGRAM_BOT_TOKEN_VICTOR` — Victor bot token.
- `TELEGRAM_WEBHOOK_SECRET` — a new random webhook secret used with Telegram `setWebhook.secret_token`.
- `VICTOR_FOUNDER_CHAT_ID` — Founder private Telegram chat ID. Strongly recommended; handler fails closed to other chats when set.

Optional:

- `API_VICTOR` — Victor's own Bedrock Mantle credential.
- `VICTOR_MODEL` — defaults to `qwen.qwen3-coder-next`.
- `ENABLE_AI_INFERENCE` — must be exactly `true` before the Worker makes AI inference calls. Keep unset/false unless Founder explicitly authorizes inference/cost.

Do not copy AURA2, RIO, Vision, or any other department credential into this Worker.

## Deployment

Create a dedicated Cloudflare Worker, for example `victor-telegram`, using `victor-telegram-worker/worker.js`.
Do not reuse the existing mixed AURA2/Vision Worker for this binding.

After deployment, suppose the Worker origin is:

`https://<your-worker>.workers.dev`

The Telegram webhook URL is:

`https://<your-worker>.workers.dev/telegram`

## Register webhook with Telegram

Register using the Victor bot token and the same secret value stored as `TELEGRAM_WEBHOOK_SECRET`:

```bash
curl -sS -X POST \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN_VICTOR}/setWebhook" \
  -H 'Content-Type: application/json' \
  -d "{\"url\":\"https://<your-worker>.workers.dev/telegram\",\"secret_token\":\"${TELEGRAM_WEBHOOK_SECRET}\",\"allowed_updates\":[\"message\"],\"drop_pending_updates\":true}"
```

Then verify:

```bash
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN_VICTOR}/getWebhookInfo"
```

Expected indicators:

- webhook URL exactly matches the dedicated Victor Worker `/telegram` path;
- `pending_update_count` settles to 0 after processing;
- no recent webhook delivery error;
- Worker `/health` reports Telegram token and webhook secret configured.

## Founder smoke test

With AI inference still disabled, send `Hi` to the Victor bot.
The Worker has a deterministic zero-inference greeting path and should reply immediately.
This test proves Telegram inbound → Worker → Telegram outbound without consuming AI inference.

Only after explicit Founder approval for inference should `ENABLE_AI_INFERENCE=true` be set and non-greeting conversational messages tested against `API_VICTOR`.

## Certification boundary

A successful `Hi` reply proves only the Telegram conversational transport path. It does not certify department connectivity, orchestration, external-action authority, or overall Victor LIVE compliance.
