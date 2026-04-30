const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(auth);

router.get('/status', (req, res) => {
  res.json({ enabled: Boolean(process.env.AI_API_KEY) });
});

router.post('/parse', requireRole('secretaria'), async (req, res) => {
  const { text, today } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI not configured' });
  }

  const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
  const model = process.env.AI_MODEL
    || (provider === 'openai' ? 'gpt-4o-mini' : 'claude-haiku-4-5-20251001');

  const todayStr = /^\d{4}-\d{2}-\d{2}$/.test(today || '')
    ? today
    : new Date().toISOString().slice(0, 10);

  const systemPrompt = `Eres un asistente que extrae datos de reservaciones de sala de juntas para la Universidad Iberoamericana.
Dado un texto en español, extrae los siguientes campos y devuelve SOLO un objeto JSON válido, sin markdown ni texto adicional:
{
  "date": "YYYY-MM-DD o null",
  "startTime": "HH:MM o null",
  "endTime": "HH:MM o null",
  "responsible": "nombre completo o cadena vacía",
  "area": "área o departamento o cadena vacía",
  "observations": "notas adicionales o cadena vacía"
}
La fecha de hoy es ${todayStr}.
Si se menciona "mañana", calcula la fecha correcta.
Si se menciona un día de la semana sin fecha, usa el próximo que ocurra.
Si la hora es "3 de la tarde" o "15:00", usa formato 24h.
Si solo se menciona duración (ej. "2 horas"), calcula endTime = startTime + duración.`;

  try {
    let url, headers, body;

    if (provider === 'openai') {
      url = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };
      body = JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0,
        max_completion_tokens: 256,
      });
    } else {
      url = 'https://api.anthropic.com/v1/messages';
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      };
      body = JSON.stringify({
        model,
        max_tokens: 256,
        system: systemPrompt,
        messages: [{ role: 'user', content: text }],
      });
    }

    const response = await fetch(url, { method: 'POST', headers, body });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[AI] ${provider} HTTP ${response.status}:`, errBody.slice(0, 300));
      return res.status(502).json({ error: 'AI provider error' });
    }

    const data = await response.json();
    const raw = provider === 'openai'
      ? (data.choices?.[0]?.message?.content ?? '')
      : (data.content?.[0]?.text ?? '');

    const clean = String(raw).replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return res.status(502).json({ error: 'AI returned invalid JSON' });
    }

    res.json({
      date: parsed.date ?? null,
      startTime: parsed.startTime ?? null,
      endTime: parsed.endTime ?? null,
      responsible: String(parsed.responsible ?? '').trim(),
      area: String(parsed.area ?? '').trim(),
      observations: String(parsed.observations ?? '').trim(),
    });
  } catch (err) {
    console.error('[AI] parse error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

module.exports = router;
