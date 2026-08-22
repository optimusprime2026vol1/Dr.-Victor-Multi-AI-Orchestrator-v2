# Unity — after Hub install (Founder steps)

## A. Editor install (if not done)
1. Open **Unity Hub**
2. **Installs** → **Install Editor**
3. Pick **Unity 6** (LTS / recommended)
4. Modules: **Visual Studio** or **Visual Studio Code** support
5. Install → wait until green

## B. New project
1. Hub → **Projects** → **New project**
2. Template: **3D (URP)**
3. Name: `VictorCommandCenter`
4. Location: anywhere easy (e.g. Documents)
5. **Create project** → Editor opens

## C. First scene (5 minutes)
1. Hierarchy: right-click empty area → rename scene feel → save as `Assets/Scenes/CommandCenter.unity`
2. **GameObject → 3D Object → Sphere** → name `VictorOrb`
3. Inspector → Scale `1.2, 1.2, 1.2`
4. Material: create `Assets/Materials/OrbCyan.mat`
   - Surface: Transparent or Opaque
   - Base color: dark blue
   - Emission: ON, color cyan `#00F0FF`, intensity ~2
5. Assign material to Sphere
6. **GameObject → UI → Canvas** (Screen Space Overlay)
7. Under Canvas: **UI → Text - TextMeshPro** → “DR. VICTOR” (import TMP essentials if asked)
8. **UI → Input Field - TextMeshPro** + **Button** for chat later

## D. Chat script (copy into Unity)
Create `Assets/Scripts/VictorApiClient.cs` — full code in repo note below after first open.

Worker URL (same as web hub):
```
https://blue-block-8effvictor-command.vickykenin.workers.dev
```

## E. Play
Press **Play** (top center). Sphere + text should show. Chat wire next message.

---
Do **not** put GEMINI / IG secrets in Unity. Only public Worker for chat.
