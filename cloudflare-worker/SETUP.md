# Real AI Chat — Cloudflare Worker Setup (5–7 minutes)

Goal: AURA2 tab pe **real Gemini** replies aayein (drafted/simulated nahi).

## Step 1 — Cloudflare account
1. https://dash.cloudflare.com pe jao
2. Login / free account banao

## Step 2 — Create Worker
1. Left side **Workers & Pages** → **Create** → **Create Worker**
2. Name rakh do: `victor-command` (ya kuch bhi)
3. **Deploy** dabao (pehle default code se)

## Step 3 — Paste real code
1. Worker open karke **Edit code**
2. Saara default code delete karo
3. Repo se yeh file ka code paste karo:  
   `cloudflare-worker/worker.js`
4. **Save and Deploy**

## Step 4 — Add Gemini secret
1. Worker page pe **Settings** → **Variables and Secrets**
2. **Add** → Secret
3. Name: `GEMINI_API_KEY`
4. Value: wahi key jo aapne GitHub secrets me daali thi
5. Save

## Step 5 — Worker URL copy karo
Deploy ke baad URL milega, jaise:  
`https://victor-command.xxxxx.workers.dev`

Is URL ko mujhe (Victor) de do, main dashboard me laga dunga.

## Step 6 — Test
Command Center pe AURA2 tab kholo aur message bhejo.  
Ab real Gemini reply aana chahiye.

---

### Later (Victor real Grok ke liye)
Jab Grok API key mil jaye:
1. Worker me `GROK_API_KEY` secret add karo
2. Main worker.js update kar dunga
3. Victor tab bhi real ho jayega

### Security
API key sirf Worker secret me rahegi.  
Frontend / GitHub Pages pe key kabhi nahi jayegi.
