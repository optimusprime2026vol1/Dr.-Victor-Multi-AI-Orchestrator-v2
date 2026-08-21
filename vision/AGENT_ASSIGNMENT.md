# VISION — Agent Assignment (No OmniRoute)

**Updated:** 21 August 2026  
**OmniRoute:** OFF / deferred — do not depend on localhost:20128  
**Stack:** Gemini + DeepSeek only (multiple roles each)

## Hierarchy

```text
Vicky
  → Victor (Grok) CEO
      → VISION
          ├── Gemini  (multiple jobs)
          └── DeepSeek (multiple jobs)
```

## Gemini — multiple places

| Slot | Job |
|------|-----|
| G1 | Topic research / alternatives |
| G2 | Characters + script + dialogue |
| G3 | Shot list + image prompts |
| G4 | Keyframe / image generation (API or app when quota allows) |
| G5 | Title, description, YouTube packaging copy |

## DeepSeek — multiple places

| Slot | Job |
|------|-----|
| D1 | Script QC (plot holes, tone, length) |
| D2 | Continuity gate (character bible vs scenes) |
| D3 | Stills QC checklist (same jacket/box/face drift) |
| D4 | Pre-publish review notes for Founder |
| D5 | Cost/risk notes (what to regenerate) |

## Cross-check rule
- Gemini **creates**  
- DeepSeek **checks**  
- Same model should not be sole creator and sole final approver on the same asset when both keys work  

## EP001 production (current)
1. Stills via Gemini prompts (`PROMPTS_GEMINI.md`)  
2. DeepSeek stills QC  
3. Founder OK  
4. Video phase (tool TBD — not OmniRoute)  

## Secrets
- `GEMINI_API_KEY`
- `DEEPSEEK_API_KEY` / `DEEPSEEK_KEY`  
- OmniRoute / SUPER_HERO: **not required** while router is off  

## AURA2 (separate)
Also uses Gemini (runner) + DeepSeek (SENTINEL gate) — same two models, different department. No OmniRoute.
