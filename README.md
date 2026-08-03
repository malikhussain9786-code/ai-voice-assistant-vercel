🎙️ AI Voice Assistant (Vercel Edition)
A voice assistant that runs natively on Vercel — plain HTML/JS frontend +
Vercel serverless functions calling Google Gemini directly. No Python, no
Streamlit, no server to manage.
Pipeline: Browser Microphone → `/api/transcribe` (Gemini STT) → `/api/chat` (Gemini reply) → Browser's built-in Text-to-Speech
Why this version exists
Streamlit needs a persistent running process with WebSocket support, which
Vercel's serverless model doesn't provide. This is a ground-up rebuild using
an architecture Vercel actually supports: static frontend + short-lived API
functions.
📁 Project Structure
```
ai-voice-assistant-vercel/
├── api/
│   ├── chat.js          # Serverless function: Gemini chat response
│   └── transcribe.js    # Serverless function: Gemini audio transcription
├── public/
│   └── index.html       # Entire frontend (HTML/CSS/JS, Call Mode UI)
├── package.json
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```
✨ Features
📞 Call Mode — Start Call / End Call, tap-to-record mic button
🎤 Speech-to-Text — recorded in-browser (`MediaRecorder`), transcribed via Gemini's native audio understanding, with a strict anti-hallucination prompt (won't invent sentences from silence/noise)
🤖 Gemini chat replies — full conversation memory sent with each request
🔊 Text-to-Speech — uses the browser's built-in `speechSynthesis` API — instant, free, zero extra API calls
🚦 Session message limit (20 by default) to protect your API quota
🐛 Debug line showing recording size/type under each attempt, for easy troubleshooting
🚀 Deploy to Vercel
Push this folder to a GitHub repo.
Go to https://vercel.com → Add New → Project → import the repo.
Before deploying, add your environment variable:
Settings → Environment Variables → add `GEMINI_API_KEY` = your key from https://aistudio.google.com/app/apikey
(Optional) add `GEMINI_MODEL` = `gemini-3-flash-preview`
Click Deploy. You'll get a live URL like `https://ai-voice-assistant.vercel.app`.
That URL is what you give your supervisor — it works for anyone, no setup needed on their end.
💻 Run Locally in cmd (no Vercel CLI needed)
```bash
npm install
copy .env.example .env
notepad .env
```
Paste your real Gemini key into `.env`, save, close. Then:
```bash
node server.js
```
Opens at `http://localhost:3000`. This runs a small local Express server
(`server.js`) that reuses the exact same `/api/chat` and `/api/transcribe`
logic as the deployed Vercel version — so local behavior always matches
production.
Alternative: via Vercel CLI
```bash
npm install -g vercel
vercel dev
```
This also works and is closer to Vercel's exact runtime, but requires
logging into a Vercel account first.
🧯 Troubleshooting
Issue	Fix
"GEMINI_API_KEY is not set"	Add it under your Vercel project's Environment Variables, then redeploy
Mic permission blocked	Check your browser's site settings and allow microphone access
"Recording seems empty"	Wrong microphone selected in the browser (common with Bluetooth headsets) — check the mic icon in your address bar
No spoken reply	Some browsers restrict `speechSynthesis` until you've interacted with the page — click anywhere first
Transcription still seems off	Speak clearly right after tapping record; very short (<1s) clips may not carry enough signal
🔒 Security Notes
Never commit a real `.env` file — it's excluded via `.gitignore`.
Your Gemini key lives only in Vercel's encrypted environment variables, never in the client-side code.
🛠️ Tech Stack
Vercel Serverless Functions (Node.js) — backend logic
Vanilla HTML/CSS/JS — frontend, no framework/build step needed
Gemini REST API — chat + native audio transcription
Web Speech API (`speechSynthesis`) — client-side text-to-speech
---
Built as an internship/portfolio project demonstrating a full voice-assistant pipeline deployable on Vercel.
