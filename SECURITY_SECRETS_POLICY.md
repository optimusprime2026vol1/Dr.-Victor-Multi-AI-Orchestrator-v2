# Secrets Policy (Founder lock — 22 Aug 2026)

**Rule:** Har department ki secret keys **usi department ke repo / scope me hi** rahengi.  
**No cross connections. No shared secret pool. No copy-paste between departments for runtime.**

## Map

| Department | Repo | Secrets live only here |
|------------|------|------------------------|
| AURA2 (Design Infra / Instagram) | `design-infra-aura2` | `GEMINI_API_KEY`, `DEEPSEEK_KEY`, `IG_USER_ID`, `IG_ACCESS_TOKEN`, … |
| Vision (YouTube drama) | `dr-victor-orchestrator` (`vision/`) | `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `NVIDIA_API_KEY`, … **only this repo** |
| Other departments | Their own repo when created | Own secrets only |

## Forbidden
- AURA2 workflow reading Vision secrets (impossible across repos; do not attempt workarounds)
- Vision workflow depending on AURA2 secrets
- One “master” key file used by all departments
- Mixing Instagram publish credentials into Vision
- Mixing Vision image keys into AURA2 publish path

## Allowed
- Same *provider* (e.g. Google) with **separate keys per repo** if Founder creates two keys
- Victor (CEO) coordinates process — **not** a shared secrets vault across departments

## Enforcement
- GitHub Actions: `{% raw %}${{ secrets.* }}{% endraw %}` only from **current** repository
- Documented in AURA2 and Vision charters
- Founder note: **no cross connections**

**Locked by Founder instruction.**
