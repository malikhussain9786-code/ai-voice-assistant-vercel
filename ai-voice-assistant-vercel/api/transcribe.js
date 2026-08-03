// /api/transcribe.js
// Vercel serverless function — sends recorded audio to Gemini for
// transcription via its native audio understanding.
// Receives: { audioBase64: string, mimeType: string, languageHint?: string }
// Returns:  { text: string }

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

  const { audioBase64, mimeType, languageHint } = req.body || {};
  if (!audioBase64) {
    return res.status(400).json({ error: 'No audio data provided.' });
  }

  let prompt =
    'You are a strict speech-to-text transcription engine. Transcribe ONLY ' +
    'the words that are clearly, audibly spoken in this recording. Output ' +
    'ONLY the transcribed words in plain text — no quotation marks, no ' +
    'commentary, no formatting, no stories, no invented sentences of any kind.\n\n' +
    'CRITICAL RULE: If you cannot clearly make out real spoken words (e.g. ' +
    'the audio is silent, just noise, static, or too unclear), you MUST ' +
    'output exactly: [no speech detected]\n' +
    'Do NOT guess, invent, or fabricate a plausible-sounding sentence under ' +
    'any circumstances. It is far better to output [no speech detected] than ' +
    'to make something up.';
  if (languageHint) {
    prompt += ` The speaker is likely speaking ${languageHint}.`;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType || 'audio/webm',
                  data: audioBase64,
                },
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.0 },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: data?.error?.message || 'Gemini API request failed.' });
    }

    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || '')
      .join('')
      .trim();

    const normalized = text.toLowerCase().replace(/[\[\].\s]/g, '');
    if (!text || normalized === 'nospeechdetected') {
      return res.status(422).json({
        error:
          'No clear speech was detected in that recording. Check that the ' +
          'correct microphone is selected in your browser and try again.',
      });
    }

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}
