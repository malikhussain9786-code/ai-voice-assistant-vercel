// server.js
// -----------------------------------------------------------------------
// Runs this entire project locally with plain Node.js — no Vercel CLI,
// no login, no "vercel dev". Just: npm install && node server.js
//
// It reuses the EXACT SAME handler functions from api/chat.js and
// api/transcribe.js (they're already written in the (req, res) style
// that both Vercel and Express understand), so there's no duplicated
// logic and no risk of the local and deployed versions behaving
// differently.
// -----------------------------------------------------------------------

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import chatHandler from './api/chat.js';
import transcribeHandler from './api/transcribe.js';

dotenv.config(); // reads GEMINI_API_KEY etc. from your local .env file

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Audio recordings arrive as base64 JSON, which can be a few MB —
// raise the default body size limit so recordings aren't rejected.
app.use(express.json({ limit: '15mb' }));

// Serve everything in /public (index.html, etc.) at the site root.
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', (req, res) => chatHandler(req, res));
app.post('/api/transcribe', (req, res) => transcribeHandler(req, res));

app.listen(PORT, () => {
  if (!process.env.GEMINI_API_KEY) {
    console.log(
      '\n⚠️  GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.\n'
    );
  }
  console.log(`\n✅ AI Voice Assistant running at http://localhost:${PORT}\n`);
});
