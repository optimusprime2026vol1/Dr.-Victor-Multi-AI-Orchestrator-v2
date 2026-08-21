#!/usr/bin/env python3
"""VISION EP001 — automated keyframe generation (no Founder paste).

Uses Gemini image model via API. Founder only checks results in
vision/episodes/EP001_Last_Delivery/stills/

Env: GEMINI_API_KEY
Optional: ONLY_IDS=A1,A2  (comma) to limit batch
"""
from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone, timedelta

ROOT = os.path.join(os.path.dirname(__file__), "..")
EP = os.path.join(ROOT, "episodes", "EP001_Last_Delivery")
OUT = os.path.join(EP, "stills")
IST = timezone(timedelta(hours=5, minutes=30))

# Prefer native image models (Nano Banana family)
MODELS = [
    "gemini-3.1-flash-image",
    "gemini-2.5-flash-image",
    "gemini-3-pro-image",
]

PROMPTS = {
    "A1": (
        "Photorealistic character reference sheet of an Indian man age 24, thin build, "
        "tired gentle eyes, short black hair, light stubble, wearing a simple blue delivery "
        "jacket and black shoulder delivery bag, plain t-shirt underneath, standing in neutral "
        "studio light, front view, waist-up, cinematic still, Indian urban drama, natural skin, "
        "35mm look, no text, no watermark"
    ),
    "A2": (
        "Photorealistic character reference of an Indian woman age 58, kind but worried face, "
        "simple cotton saree in muted colour, grey-black hair in a bun, ground-floor middle-class "
        "home feeling, waist-up portrait, soft indoor light, cinematic still, natural skin, "
        "35mm look, no text, no watermark"
    ),
    "A3": (
        "Photorealistic character reference of an Indian man age 32, calm polite face that feels "
        "slightly threatening, smart casual shirt, neat hair, upper-middle class look, waist-up "
        "portrait, neutral light, cinematic still, natural skin, 35mm look, no text, no watermark"
    ),
    "B1": (
        "Cinematic night shot, same Indian delivery man age 24 in blue delivery jacket with black "
        "shoulder bag riding a motorcycle on an Indian city road at night, neon signs soft bokeh, "
        "tired focused expression, photorealistic, 35mm film look, shallow depth of field, no text, no watermark"
    ),
    "B2": (
        "Close-up of a brown cardboard delivery box sealed with red tape, FRAGILE stamp look, "
        "resting on a motorcycle delivery bag, night ambient light, photorealistic cinematic still, "
        "no brand logo, no watermark"
    ),
    "B3": (
        "Night at a middle-class Indian apartment society gate, young delivery man in blue jacket "
        "holding a brown box, a 32-year-old man in smart casual leaning from a car window offering "
        "money with a calm smile, tension under politeness, cinematic lighting, photorealistic, "
        "35mm look, no text overlay, no watermark"
    ),
    "B4": (
        "Dim corridor of an Indian apartment, 58-year-old woman in simple saree opening the door "
        "cautiously, young delivery man with blue jacket and brown box standing outside, warm indoor "
        "light vs cool corridor, cinematic still, photorealistic, no text, no watermark"
    ),
    "B5": (
        "Interior of a simple Indian middle-class living room at night, brown delivery box with red "
        "tape on a small table, blurred family photo of a young man on the wall behind, emotional "
        "quiet mood, cinematic still, photorealistic, soft practical lights, no text, no watermark"
    ),
    "B6": (
        "Narrow back lane of an Indian residential area at night, young delivery man in blue jacket "
        "holding a brown box, stopped under a single street light, phone in other hand, conflicted "
        "expression, cinematic tension, photorealistic, 35mm look, no text, no watermark"
    ),
    "B7": (
        "Early morning soft light, same young Indian delivery man in blue jacket riding motorcycle "
        "on a quieter city road, calmer face, black delivery bag on shoulder, hopeful quiet mood, "
        "cinematic still, photorealistic, 35mm look, no text, no watermark"
    ),
}


def generate(api_key: str, model: str, prompt: str) -> bytes:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        f"?key={api_key}"
    )
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
        },
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.load(resp)
    for cand in data.get("candidates") or []:
        for part in (cand.get("content") or {}).get("parts") or []:
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"])
    raise RuntimeError(f"No image in response: {json.dumps(data)[:500]}")


def main() -> int:
    key = (os.environ.get("GEMINI_API_KEY") or "").strip()
    if not key:
        print("GEMINI_API_KEY missing")
        return 1

    only = os.environ.get("ONLY_IDS", "").strip()
    ids = [x.strip() for x in only.split(",") if x.strip()] if only else list(PROMPTS.keys())

    os.makedirs(OUT, exist_ok=True)
    log = {
        "updated": datetime.now(IST).isoformat(),
        "mode": "automated",
        "founder_action": "review_only",
        "results": {},
    }

    for pid in ids:
        prompt = PROMPTS.get(pid)
        if not prompt:
            print("skip unknown", pid)
            continue
        ok = False
        last_err = ""
        for model in MODELS:
            try:
                print(f"{pid}: trying {model}...")
                img = generate(key, model, prompt)
                path = os.path.join(OUT, f"{pid}.png")
                with open(path, "wb") as f:
                    f.write(img)
                log["results"][pid] = {"status": "ok", "model": model, "file": f"stills/{pid}.png", "bytes": len(img)}
                print(f"{pid}: OK {len(img)} bytes -> {path}")
                ok = True
                break
            except urllib.error.HTTPError as e:
                last_err = e.read().decode("utf-8", errors="replace")[:400]
                print(f"{pid}: HTTP {e.code} {model}: {last_err[:120]}")
            except Exception as e:
                last_err = str(e)
                print(f"{pid}: fail {model}: {e}")
        if not ok:
            log["results"][pid] = {"status": "failed", "error": last_err}

    with open(os.path.join(OUT, "_run_log.json"), "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)

    failed = [k for k, v in log["results"].items() if v.get("status") != "ok"]
    print("DONE failed=", failed)
    # Exit 0 even if some fail so partial stills commit; CI can show log
    return 0


if __name__ == "__main__":
    sys.exit(main())
