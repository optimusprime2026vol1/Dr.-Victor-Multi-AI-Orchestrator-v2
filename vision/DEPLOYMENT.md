# VISION — Deployment

**Status:** ACTIVE (2026-08-21)  
**Isolation:** 100% separate from AURA2 / Design Infra Instagram  
**Super Hero router:** OmniRoute (`http://localhost:20128/v1`)

---

## Architecture

```text
Founder approve
    → Vision pipeline (script / shots / gen)
        → OmniRoute SUPER HERO
            → Gemini / DeepSeek / NVIDIA / free pools
    → YouTube (separate channel only)
```

## Runtime config

| Key | Value |
|-----|--------|
| OmniRoute base | `http://localhost:20128/v1` |
| Dashboard | `http://localhost:20128` |
| Model default | `auto` (after providers connected) |
| Secrets (repo) | `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `NVIDIA_API_KEY`, `SUPER_HERO` |

`SUPER_HERO` = OmniRoute API key or ops token (Founder-set).  
Never commit real values — GitHub Secrets only.

## Local OmniRoute (required for AI calls)

```powershell
omniroute --log
```

1. Login password (first time): `CHANGEME` → change immediately  
2. Providers → connect at least one (Gemini / DeepSeek / free)  
3. Endpoints → copy API key → store as `SUPER_HERO` if used as bearer  

## EP001 — Last Delivery (first production unit)

| Stage | File | Status |
|-------|------|--------|
| Topic | C approved | Done |
| Characters | `episodes/EP001_Last_Delivery/CHARACTERS.md` | Done |
| Script | `episodes/EP001_Last_Delivery/SCRIPT.md` | Done (Founder OK) |
| Shot list | `episodes/EP001_Last_Delivery/SHOT_LIST.md` | Done |
| Image gen | OmniRoute → image-capable model | **Next** |
| Video / edit | TBD tool | Pending |
| YouTube | Separate channel | Founder |

## Deploy checklist (Founder)

- [ ] OmniRoute running on PC
- [ ] Password changed from CHANGEME
- [ ] ≥1 provider connected in OmniRoute
- [ ] `SUPER_HERO` / API key saved in secrets
- [ ] Gemini + DeepSeek keys in OmniRoute **or** env for Vision scripts
- [ ] YouTube channel ready (Vision only)

## AURA2

Do not route Design Infra / Instagram traffic through Vision OmniRoute path.  
AURA2 keeps its own GitHub Actions + IG secrets.
