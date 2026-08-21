# EP001 — Last Delivery · PRODUCTION (AUTOMATED)

**Founder role:** **ONLY review results** — no prompt paste.  
**Generator:** GitHub Action + Gemini image API  
**QC:** DeepSeek (after stills land)  
**OmniRoute:** OFF

---

## How you get 1st face (zero manual gen)

1. Open: https://github.com/vickykenin-lang/dr-victor-orchestrator/actions/workflows/vision_stills.yml  
2. **Run workflow**  
3. Input `only_ids`: `A1` (first face only)  
4. Wait 2–5 min  
5. Check:
   - Actions → Artifacts → `ep001-stills`  
   - Or folder: `vision/episodes/EP001_Last_Delivery/stills/A1.png`  
6. Reply: **A1 OK** / **A1 redo**

Then run `A2`, `A3`, or `A1,A2,A3,B1,B2,B3,B4,B5,B6,B7`.

## If Action fails (quota)

Log will show 429 / billing. Then:
- Enable Gemini API image billing / paid tier on the key in Secrets  
- Re-run same workflow — still **no** manual paste required  

## Order
A1 → A2 → A3 → B1…B7 → DeepSeek QC → Founder OK → video

## Secrets
`GEMINI_API_KEY` must exist on **dr-victor-orchestrator** repo (Actions secrets).
