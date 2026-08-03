// /api/chat.js
// Vercel serverless function — calls Google Gemini directly via REST.
// Receives: { message: string, history: [{role, content}] }
// Returns:  { reply: string }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set. Add it in your Vercel project\'s Environment Variables.',
    });
  }

  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'No message provided.' });
  }

  const contents = (Array.isArray(history) ? history : []).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const systemInstruction = {
    parts: [
      {
        text:
          'You are a helpful, friendly AI voice assistant. Keep your answers ' +
          'clear, conversational, and reasonably concise since they will be ' +
          'read aloud to the user.',
      },
    ],
  };

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction,
        generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: data?.error?.message || 'Gemini API request failed.' });
    }

    const reply = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || '')
      .join('')
      .trim();

    if (!reply) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}
