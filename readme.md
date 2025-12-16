# TechSupport AI™ (L1) + TechSupport AI-2™ (L2) — VisionScreen™ Support Agent  
**Invention Date:** 12/15/2025 (America/New_York)

TechSupport AI™ is a voice-first, multi-language, multi-call help desk agent for your AI Factory or any SaaS company. Customers call a **Twilio number** and the “magic” starts: **Level 1** triage resolves common issues quickly and builds a full case file in **Firebase (Firestore)**. If the issue can’t be solved fast, **TechSupport AI-2™ (Level 2)** takes over and activates **VisionScreen™** to guide the caller step-by-step using **screen share (preferred)** or **camera-to-screen (fallback)** — similar to live video guidance.

This repo currently includes a **front-end demo UI (`index.html`)** that showcases the product concept, workflow, and interaction patterns.

---

## What This Product Does

### Level 1 — TechSupport AI™ (Included)
**Goal:** resolve the easy 60–80% of tickets quickly and cheaply.

- Answers calls from a Twilio phone number
- Detects or confirms the caller’s language (then locks it for the session)
- Classifies the issue (login, billing, API keys, integrations, uploads, performance, affiliate tracking, etc.)
- Asks the right intake questions (account/workspace, version, error text, last action)
- Runs **safe, scripted troubleshooting playbooks**
- Logs everything into Firestore:
  - session details
  - case details
  - timeline events
  - steps attempted + outcomes
  - sanitized artifacts (where permitted)
- Sends SMS and email recaps with next steps

### Level 2 — TechSupport AI-2™ (Escalation Mode)
**Goal:** solve harder issues using VisionScreen™ + deeper troubleshooting.

- Seamlessly takes over from Level 1 (no repeated explanation)
- Generates and sends a secure **SMS session link** to VisionScreen™
- Uses:
  - **Screen share** (preferred)
  - **Camera-to-screen** fallback for universal compatibility
- Guides step-by-step and visually confirms progress
- Runs deeper, permissioned diagnostics (optional)
- Escalates to a human only when necessary — with a complete escalation packet

### VisionScreen™ (Level 2 Only)
A live support session interface that lets the agent “see what the user sees” and guide them through the UI.

**Key design choice:** VisionScreen is **only available in Level 2**, to keep Level 1 scalable, cheaper, and simpler.

---

## Key Capabilities

### Multilingual (Voice + Follow-ups)
Launch languages:
- English
- French
- German
- Italian
- Chinese (Mandarin default)
- Farsi (Persian)

Design requirements:
- Auto-detect early, then confirm
- Lock language per session (Firestore)
- Support RTL rendering for Farsi in the web UI and message templates

### Concurrent Calls
TechSupport AI is designed as a session-based system:
- each call has its own `sessionId`
- each call has isolated context
- backend can scale horizontally to handle multiple simultaneous calls

### Channels / Integrations
- **Twilio Voice**: incoming calls + voice response
- **Twilio SMS**: VisionScreen link + updates + follow-ups
- **Email**: resolution packet and post-call recap
- **Firebase Firestore**: sessions, cases, timeline events, artifacts, analytics

---

## Repository Contents

### `index.html`
A single-file front-end UI demo that includes:
- Colorful hero section with tech support imagery
- Level 1 vs Level 2 UI switching
- Case intake form (product, category, severity, language)
- Playbook checklist builder + step completion
- Support timeline panel
- VisionScreen demo panel (screen share / camera modes)
- Export escalation packet button (JSON download)
- RTL toggle (for Farsi UI simulation)

> Note: This is a **UI demo** only. It does not include back-end Twilio webhooks, Firebase setup, or AI model calls. Those are part of the implementation blueprint below.

---

## How to Run the Demo

### Option A: Open directly
1. Save the generated `index.html` in a folder
2. Double-click the file to open in your browser

### Option B: Serve locally (recommended for camera/screen permissions)
Some browsers behave better with `localhost` for media permissions.

#### Using Python
```bash
python -m http.server 8080
