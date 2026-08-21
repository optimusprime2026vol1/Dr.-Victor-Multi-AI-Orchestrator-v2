#!/usr/bin/env python3
"""VISION EP001 — automated keyframes. Founder only reviews stills/.

Env: GEMINI_API_KEY (required)
     ONLY_IDS=A1   optional
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


def extract_image(data: dict) -> bytes | None:
    for cand in data.get("candidates") or []:
        content = cand.get("content") or {}
        for part in content.get("parts") or []:
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"])
    return None


def post_json(url: str, headers: dict, body: dict) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        return json.load(resp)


def generate(api_key: str, model: str, prompt: str) -> bytes:
    bodies = [
        {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
                "responseFormat": {"image": {"aspectRatio": "3:4", "imageSize": "1K"}},
            },
        },
        {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"]},
        },
        {
            "contents": [{"parts": [{"text": prompt}]}],
        },
    ]
    endpoints = [
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent",
    ]
    last_err = ""
    for base in endpoints:
        for body in bodies:
            # Prefer header auth (official curl style)
            try:
                data = post_json(
                    base,
                    {
                        "Content-Type": "application/json",
                        "x-goog-api-key": api_key,
                    },
                    body,
                )
                img = extract_image(data)
                if img:
                    return img
                last_err = f"no_image: {json.dumps(data)[:300]}"
            except urllib.error.HTTPError as e:
                last_err = f"HTTP {e.code} {e.read().decode('utf-8', errors='replace')[:300]}"
            except Exception as e:
                last_err = str(e)
            # Fallback query key
            try:
                data = post_json(
                    f"{base}?key={urllib.parse.quote(api_key)}",
                    {"Content-Type": "application/json"},
                    body,
                )
                img = extract_image(data)
                if img:
                    return img
                last_err = f"no_image: {json.dumps(data)[:300]}"
            except urllib.error.HTTPError as e:
                last_err = f"HTTP {e.code} {e.read().decode('utf-8', errors='replace')[:300]}"
            except Exception as e:
                last_err = str(e)
    raise RuntimeError(last_err)


import urllib.parse  # after generate uses it — keep import top ideally


def main() -> int:
    key = (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or "").strip()
    if not key:
        print("ERROR: GEMINI_API_KEY missing in this job environment")
        print("Add repository secret GEMINI_API_KEY on dr-victor-orchestrator only")
        return 1

    print("Key length:", len(key), "(value not printed)")

    only = os.environ.get("ONLY_IDS", "").strip()
    ids = [x.strip() for x in only.split(",") if x.strip()] if only else list(PROMPTS.keys())

    os.makedirs(OUT, exist_ok=True)
    log = {
        "updated": datetime.now(IST).isoformat(),
        "mode": "automated",
        "founder_action": "review_only",
        "results": {},
    }

    any_ok = False
    for pid in ids:
        prompt = PROMPTS.get(pid)
        if not prompt:
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
                log["results"][pid] = {
                    "status": "ok",
                    "model": model,
                    "file": f"stills/{pid}.png",
                    "bytes": len(img),
                }
                print(f"{pid}: OK {len(img)} bytes")
                ok = True
                any_ok = True
                break
            except Exception as e:
                last_err = str(e)[:500]
                print(f"{pid}: fail {model}: {last_err[:200]}")
        if not ok:
            log["results"][pid] = {"status": "failed", "error": last_err}

    with open(os.path.join(OUT, "_run_log.json"), "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)

    failed = [k for k, v in log["results"].items() if v.get("status") != "ok"]
    print("DONE failed=", failed, "any_ok=", any_ok)
    # Fail job if nothing generated so Founder sees red + log
    return 0 if any_ok else 1


if __name__ == "__main__":
    sys.exit(main())
