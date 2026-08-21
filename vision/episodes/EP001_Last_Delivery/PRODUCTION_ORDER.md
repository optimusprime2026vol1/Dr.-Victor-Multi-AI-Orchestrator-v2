# EP001 — Last Delivery · PRODUCTION ORDER

**Mode:** PRODUCTION STARTED  
**Router:** OmniRoute `http://localhost:20128/v1`  
**Agents:** Gemini (gen) · DeepSeek (QC) · NVIDIA (optional) · Victor (CEO)

---

## Phase 1 — Keyframes (NOW)

Generate in order. Same character lock every time.

### Character sheets (Gemini / image path)
1. **A1** Rahul — blue delivery jacket, black bag, age 24  
2. **A2** Mrs Sharma — saree, 58, worried kind  
3. **A3** Vikram — smart casual, calm threat  

### Story stills
4. **B1** Rahul bike night  
5. **B2** Parcel box FRAGILE  
6. **B3** Gate — Vikram money offer  
7. **B4** Mrs Sharma door  
8. **B5** Box on table + photo wall  
9. **B6** Back lane decision  
10. **B7** Morning ride resolution  

Prompts: `PROMPTS_GEMINI.md` (same folder)

**Via OmniRoute (when image model connected):**  
Base URL `http://localhost:20128/v1` + provider that supports image  
Or Gemini app/API if OmniRoute image route not ready — still tag outputs as Vision EP001.

## Phase 2 — DeepSeek QC (after stills batch)
- Same jacket/bag/box across frames?  
- Faces drift?  
- Any non-story frame?  
→ `QC_STILLS.md` note pass/fail  

## Phase 3 — Founder visual OK
Only then video clips.

## Phase 4 — Video + edit + YouTube
Separate channel only.

---

## Founder actions tonight
1. OmniRoute running  
2. Connect **Gemini + DeepSeek** (+ NVIDIA if ready) in Providers  
3. Reply: `Providers connected` OR start generating A1–A3 in Gemini and save stills  
4. Share / confirm stills → QC → next  
