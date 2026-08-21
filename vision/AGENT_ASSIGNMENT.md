# VISION — Agent Assignment (Production)

**Date:** 21 August 2026  
**Episode in production:** EP001 — Last Delivery  
**Platform:** YouTube only (not AURA2 / not Instagram)

## Principle
OmniRoute is the **router / pipe** (not the only brain).  
**All capable agents** are assigned on Vision for production.

## Hierarchy

```text
Vicky (Owner)
  → Dr. Victor / Grok (CEO · performance)
      → VISION Department Lead (coordination)
          → OmniRoute (router only — localhost:20128/v1)
              ├── Gemini     → script polish, image prompts, multimodal
              ├── DeepSeek   → continuity QC, dialogue logic, gate
              ├── NVIDIA     → optional GPU / NIM models
              └── Free pools → fallback via OmniRoute
```

## Role map

| Role | Agent | Responsibility |
|------|--------|----------------|
| CEO | Victor (Grok) | Go/no-go, swap agents if fail |
| Router | **OmniRoute** | Single endpoint, fallback, keys aggregation |
| Story / script | **Gemini** | Script polish, scene text, prompt writing |
| QC / continuity | **DeepSeek** | Character bible check, plot holes, score |
| Heavy compute | **NVIDIA** | When connected — alternate gen path |
| Fallback | Free tiers via OmniRoute | Rate-limit survival |
| Publish | Founder | YouTube upload approval |

## Production unit: EP001 Last Delivery

| Stage | Owner agent | Status |
|-------|-------------|--------|
| Topic C approved | Founder | Done |
| Characters | Gemini + locked bible | Done |
| Script | Gemini (Founder OK) | Done |
| Shot list | Gemini | Done |
| Continuity QC | DeepSeek | **Run on script before stills** |
| Keyframe stills | Gemini image path / OmniRoute | **PRODUCTION START** |
| Video clips | TBD tool via router | Next after stills OK |
| Edit + subtitles | Pipeline | After clips |
| YouTube | Founder | Final |

## Rules
1. AURA2 agents do not post Vision content to Instagram  
2. All model calls prefer OmniRoute base URL when local server is up  
3. DeepSeek QC before Founder visual approval on stills  
4. Secrets: GEMINI_API_KEY, DEEPSEEK_API_KEY, NVIDIA_API_KEY, SUPER_HERO (router key)  

**Production = STARTED** for EP001 stills phase.
