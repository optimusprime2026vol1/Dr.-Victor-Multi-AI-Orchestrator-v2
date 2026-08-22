# Victor Org Backcheck — 22 Aug 2026

**Auditor:** Dr. Victor (Grok)  
**Scope:** All `vickykenin-lang` repos **except** `design-infra-aura2` (Founder: skip AURA2 this pass)  
**Secrets policy:** each department keys stay in that repo only. No cross connections.

---

## Org snapshot (13 repos)

| Repo | Role | Health | Notes |
|------|------|--------|-------|
| **dr-victor-orchestrator** | Central hub + Vision production files | Amber | Docs + Vision scripts live here. Pages on. |
| **vision-ai-video** | Vision *named* department repo | Red / stub | Only README. Real EP001 work is in orchestrator `/vision`. **Duplicate.** |
| **rio-affiliate-engine** | RIO affiliate | Amber / standby | Code + dashboard + briefs exist. Not primary revenue. |
| **trading-oracle** | ORACLE paper trade | Amber / dormant | Scaffold + spec + tests; no live trading. |
| **bubblebee-kids** | Kids channel | Red / stub | README only. |
| **pa-victor** | PA agent | Red / stub | README only. |
| **designinfra-site** | Public legal / OAuth pages | Amber | HTML only, **no README**. |
| **design-infra-marketing** | Legacy AURA marketing | Amber | Large (images). Overlaps AURA2 conceptually — do not merge secrets. |
| **youtube-shorts-automation** | Old shorts pipeline | Amber / messy | Workflows + py exist. File `Recreate client_secret.json` is sloppy name. |
| **Instagram-content** | Unclear / mixed | Amber | Full Python project + `tradingagents/` folder — **name vs content mismatch**. |
| **legion-x** | Unassigned experiment | Red / stub | README only. 1 open issue. |
| **skills-for-architects** | Empty | Red | **Git repo empty** (409). |
| design-infra-aura2 | AURA2 | *Skipped this pass* | Active P1, separate secrets. |

---

## Errors / thinking

### 1. Vision split across two places
- **Canonical production code:** `dr-victor-orchestrator/vision/` (EP001 script, shots, NVIDIA/Gemini stills Actions).
- **Named repo:** `vision-ai-video` is empty except README.
- **Error:** Founder/Actions can look at the wrong repo for secrets.
- **Fix (locked):** Vision secrets + stills workflow = **orchestrator only**. `vision-ai-video` = charter stub until merge or archive.
- **Blocker:** last Gemini stills run: `GEMINI_API_KEY` empty *inside the Action*. NVIDIA path added; needs **new** workflow run (not old RE-RUN).

### 2. Empty / stub departments
Bubblebee, PA Victor, vision-ai-video, legion-x, skills-for-architects — chart exists, product does not. Not a code crash; **org debt**.

### 3. Overlap risk (not secret merge)
- AURA2 vs `design-infra-marketing` vs `Instagram-content` vs `youtube-shorts-automation` all touch content/social.
- Policy: **no shared runtime secrets**. Same provider type allowed with **separate keys**.

### 4. Instagram-content naming
Contains `tradingagents/` — looks like a trading-agent template reused. Do not treat as official AURA2 or ORACLE.

### 5. Private clone from this sandbox
HTTPS clone of private repos failed without credentials. Audit used GitHub API. Founder laptop: `git clone` each private repo for local backcheck.

### 6. OmniRoute
Deferred / off. Not a department repo.

---

## Department status (non-AURA2)

| Dept | Status | Next |
|------|--------|------|
| Vision | Production *intent*; stills Action failing / pending NVIDIA | New Run `vision_stills.yml` `only_ids=A1` |
| RIO | Standby | No lead-gen priority |
| ORACLE | Dormant | Paper only |
| Bubblebee | New / empty | Need first Bibi clip plan |
| PA Victor | New / empty | Optional later |
| Hulk / Batman | No repo | TBD |

---

## Founder backcheck checklist (today)

1. Open this file + `STRUCTURE.md` + `SECURITY_SECRETS_POLICY.md`.
2. Confirm secrets only in the matching repo.
3. Vision: **new** Action run on **orchestrator**, not `vision-ai-video`.
4. Optional local clones (private):
   - rio-affiliate-engine
   - trading-oracle
   - designinfra-site
   - design-infra-marketing
   - youtube-shorts-automation
   - Instagram-content
5. Decide later: archive or fill stubs (bubblebee, pa-victor, vision-ai-video, skills-for-architects, legion-x).

---

*AURA2 not modified in this pass.*
