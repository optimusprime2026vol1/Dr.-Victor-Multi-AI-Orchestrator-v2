# Unity Hub Track — Restored 22 Aug 2026

**Status:** OPTIONAL track (not blocking AURA2 / Vision Actions)  
**Goal:** Desktop / laptop pe **Jarvis-style live animated** Command Center (3D orb, departments, chat).  
**Web hub remains:** https://vickykenin-lang.github.io/dr-victor-orchestrator/ (HTML AI Command Center).

Unity **nahi** GitHub Pages pe chalta. Local Unity Editor + build = desktop app.

---

## 1. Unity Hub vapas (Founder machine)

1. Download: https://unity.com/download  
2. Install **Unity Hub** (Windows / Mac / Linux).  
3. Unity account se login.  
4. Hub → **Installs** → **Install Editor** → **Unity 6** LTS (ya latest stable).  
5. Modules (recommended):  
   - Microsoft Visual Studio / VS Code support  
   - Windows Build Support (IL2CPP) *if Windows target*  
6. Hub → **Projects** → **New project** → template **3D (URP)**  
   - Name: `VictorCommandCenter`  
   - Location: e.g. `Documents/VictorUnity`

**System:** Windows 10/11 64-bit, or macOS 11+, or Ubuntu 24.04 · GPU DX10+.

---

## 2. Kya banega (scope)

| Layer | Unity me |
|-------|----------|
| Look | Dark space, neon cyan/purple, floating holographic orb “V” |
| Live feel | Particles, rotating rings, department “floors” as 3D panels |
| Chat | UI Toolkit / TextMeshPro panel → same Cloudflare Worker as web |
| Data | HTTP to Worker + optional read of public status JSON |

**Not in Unity (keep web/Actions):** IG publish, Gemini stills pipeline, AURA2 queue.

---

## 3. Code direction (when you open Editor)

1. Scene: `CommandCenter`  
2. Camera + URP volume (bloom, vignette).  
3. Empty GameObject `VictorOrb` + simple sphere / custom mesh + emissive material.  
4. Canvas → Chat input + scroll view.  
5. C# `VictorApiClient.cs` → `POST` same worker URL as `index.html`.  
6. Build: File → Build Settings → PC / Mac → Build.

Worker (already used by web):  
`https://blue-block-8effvictor-command.vickykenin.workers.dev`

---

## 4. Repo policy

- **Do not** commit full Unity Library / Temp (huge).  
- Optional later: empty repo `victor-unity-command` with `.gitignore` for Unity.  
- Secrets: **no** GEMINI/IG keys inside Unity builds. Chat only via public Worker.

---

## 5. Priority vs web

| Track | Use when |
|-------|----------|
| **Web Command Center** | Daily ops, phone, zero install |
| **Unity Hub app** | Demo / “impress” 3D desk presence |

AURA2 + Vision Actions **pehle**. Unity = parallel polish.

---

*Restored on Founder request: “unity hub ko vapas lekar aaye”.*
