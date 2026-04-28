/* ============================================================
   AI.JS — Módulo de Inteligencia Artificial
   HU-31 (lenguaje natural), HU-32 (propuesta editable),
   HU-33 (sugerencias inteligentes de horario)
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

const AI = (() => {

  /* ════════════════════════════════════════════════════════
     CONFIGURACIÓN
  ════════════════════════════════════════════════════════ */

  const _CFG_KEY = 'ibero_ai_config';

  let _cfg = _loadConfig();

  function _loadConfig() {
    try {
      const stored = localStorage.getItem(_CFG_KEY);
      return stored ? JSON.parse(stored) : {
        provider:  'anthropic',          // 'anthropic' | 'openai'
        apiKey:    '',
        model:     'claude-haiku-4-5-20251001',
        endpoint:  '',                   // override base URL (optional)
      };
    } catch { return { provider: 'anthropic', apiKey: '', model: 'claude-haiku-4-5-20251001', endpoint: '' }; }
  }

  /**
   * configure(opts) — persists API settings.
   * opts: { provider?, apiKey?, model?, endpoint? }
   */
  function configure(opts = {}) {
    _cfg = { ..._cfg, ...opts };
    localStorage.setItem(_CFG_KEY, JSON.stringify(_cfg));
  }

  function getConfig() { return { ..._cfg }; }

  /* ════════════════════════════════════════════════════════
     PARSE — Entrada de lenguaje natural → propuesta
  ════════════════════════════════════════════════════════ */

  /**
   * parse(text) → Promise<ParseResult>
   *
   * ParseResult: {
   *   date:         string   "YYYY-MM-DD" | null
   *   startTime:    string   "HH:MM"      | null
   *   endTime:      string   "HH:MM"      | null
   *   responsible:  string   | ""
   *   area:         string   | ""
   *   observations: string   | ""
   *   confidence:   number   0-1
   *   source:       'api' | 'local'
   *   rawText:      string
   * }
   *
   * Tries real API first if apiKey is configured; falls back to local parser.
   */
  async function parse(text) {
    if (!text?.trim()) {
      return _emptyResult(text ?? '');
    }

    if (_cfg.apiKey) {
      try {
        const result = await _parseViaAPI(text);
        if (result) return result;
      } catch (err) {
        console.warn('[AI] API parse failed, falling back to local parser:', err.message);
      }
    }

    return _parseLocal(text);
  }

  /* ── API CALL ─────────────────────────────────────────── */

  async function _parseViaAPI(text) {
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
La fecha de hoy es ${Utils.today()}.
Si se menciona "mañana", calcula la fecha correcta.
Si se menciona un día de la semana sin fecha, usa el próximo que ocurra.
Si la hora es "3 de la tarde" o "15:00", usa formato 24h.
Si solo se menciona duración (ej. "2 horas"), calcula endTime = startTime + duración.`;

    let url, headers, body;

    if (_cfg.provider === 'openai') {
      url = _cfg.endpoint || 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${_cfg.apiKey}`,
      };
      body = JSON.stringify({
        model:       _cfg.model || 'gpt-4o-mini',
        messages:    [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: text },
        ],
        temperature: 0,
        max_completion_tokens: 256,
      });
    } else {
      // Anthropic
      url = _cfg.endpoint || 'https://api.anthropic.com/v1/messages';
      headers = {
        'Content-Type':      'application/json',
        'x-api-key':         _cfg.apiKey,
        'anthropic-version': '2023-06-01',
      };
      body = JSON.stringify({
        model:       _cfg.model || 'claude-haiku-4-5-20251001',
        max_tokens:  256,
        system:      systemPrompt,
        messages:    [{ role: 'user', content: text }],
      });
    }

    const response = await fetch(url, { method: 'POST', headers, body });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HTTP ${response.status}: ${err.slice(0, 120)}`);
    }

    const data = await response.json();
    let raw;
    if (_cfg.provider === 'openai') {
      raw = data.choices?.[0]?.message?.content ?? '';
    } else {
      raw = data.content?.[0]?.text ?? '';
    }

    const parsed = _safeParseJSON(raw);
    if (!parsed) throw new Error('API returned invalid JSON');

    return {
      date:         _validateDate(parsed.date)        ?? null,
      startTime:    _validateTime(parsed.startTime)   ?? null,
      endTime:      _validateTime(parsed.endTime)     ?? null,
      responsible:  String(parsed.responsible ?? '').trim(),
      area:         String(parsed.area ?? '').trim(),
      observations: String(parsed.observations ?? '').trim(),
      confidence:   0.9,
      source:       'api',
      rawText:      text,
    };
  }

  /* ── LOCAL NLP PARSER ─────────────────────────────────── */

  function _parseLocal(text) {
    const lower = text.toLowerCase();

    const date        = _extractDate(lower);
    const times       = _extractTimes(lower);
    const responsible = _extractResponsible(text);   // case-sensitive for names
    const area        = _extractArea(text);
    const conf        = _confidence(date, times.start, responsible);

    return {
      date,
      startTime:    times.start,
      endTime:      times.end,
      responsible,
      area,
      observations: '',
      confidence:   conf,
      source:       'local',
      rawText:      text,
    };
  }

  /* ── DATE EXTRACTION ── */

  const _DAYS_ES = { lunes: 1, martes: 2, miércoles: 3, miercoles: 3, jueves: 4, viernes: 5 };
  const _MONTHS_ES = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  };

  function _extractDate(lower) {
    const todayDate = new Date();

    // "hoy"
    if (/\bhoy\b/.test(lower)) return Utils.today();

    // "mañana" / "manana"
    if (/\bma[ñn]ana\b/.test(lower)) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() + 1);
      return Utils.dateToISO(d);
    }

    // "pasado mañana"
    if (/\bpasado\s+ma[ñn]ana\b/.test(lower)) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() + 2);
      return Utils.dateToISO(d);
    }

    // "[N] de [mes] [de año?]"  ej. "15 de abril de 2026" or "15 de abril"
    const dmy = lower.match(
      /\b(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+(?:de\s+)?(\d{4}))?\b/
    );
    if (dmy) {
      const day   = parseInt(dmy[1], 10);
      const month = _MONTHS_ES[dmy[2]];
      const year  = dmy[3] ? parseInt(dmy[3], 10) : todayDate.getFullYear();
      const d     = new Date(year, month - 1, day);
      // If the date is in the past (and no explicit year), move to next year
      if (!dmy[3] && d < todayDate && d.getMonth() < todayDate.getMonth()) {
        d.setFullYear(year + 1);
      }
      return Utils.dateToISO(d);
    }

    // "el próximo [día]" or "el [día]" or just "[día]"
    const dayMatch = lower.match(
      /(?:el\s+)?(?:pr[oó]ximo\s+)?(lunes|martes|mi[eé]rcoles|jueves|viernes)/
    );
    if (dayMatch) {
      const targetDay = _DAYS_ES[dayMatch[1].replace('é', 'e').replace('ó', 'o')];
      return _nextWeekday(todayDate, targetDay);
    }

    return null;
  }

  function _nextWeekday(from, targetDow) {
    // targetDow: 1=Mon … 5=Fri
    const d   = new Date(from);
    const dow = d.getDay() || 7; // convert Sun=0 to 7
    let delta = targetDow - dow;
    if (delta <= 0) delta += 7;
    d.setDate(d.getDate() + delta);
    return Utils.dateToISO(d);
  }

  /* ── TIME EXTRACTION ── */

  function _extractTimes(lower) {
    // Patterns: "a las HH:MM", "a las H", "HH:MM", "H am/pm", "H de la mañana/tarde/noche"
    // Returns { start: "HH:MM"|null, end: "HH:MM"|null }

    const timeRe = /\b(\d{1,2})(?::(\d{2}))?\s*(?:hrs?|h\b|de\s+la\s+(ma[ñn]ana|tarde|noche)|([ap]m))?\b/g;
    const found  = [];
    let m;
    // Also match "a las H" preceded by "a las"
    const fullRe = /a\s+las?\s+(\d{1,2})(?::(\d{2}))?\s*(?:hrs?|h\b|de\s+la\s+(ma[ñn]ana|tarde|noche)|([ap]m))?/g;

    while ((m = fullRe.exec(lower)) !== null) {
      found.push(_buildTime(m[1], m[2], m[3], m[4]));
    }

    // If only one found via "a las", try standalone HH:MM patterns
    const standaloneRe = /\b(\d{1,2}):(\d{2})\b/g;
    while ((m = standaloneRe.exec(lower)) !== null) {
      const t = `${String(parseInt(m[1], 10)).padStart(2, '0')}:${m[2]}`;
      if (!found.includes(t)) found.push(t);
    }

    // Duration extraction: "N horas" or "una hora" or "media hora"
    let duration = null;
    const durRe = lower.match(/(\d+)\s*hora(?:s)?(?:\s+y\s+media)?/);
    if (durRe) {
      const halfHour = /hora.*y\s+media/.test(lower) ? 30 : 0;
      duration = parseInt(durRe[1], 10) * 60 + halfHour;
    } else if (/\buna\s+hora\s+y\s+media\b/.test(lower)) {
      duration = 90;
    } else if (/\buna\s+hora\b/.test(lower)) {
      duration = 60;
    } else if (/\bmedia\s+hora\b/.test(lower)) {
      duration = 30;
    }

    const start = found[0] ?? null;
    let   end   = found[1] ?? null;

    // Calculate end from duration if needed
    if (start && !end && duration) {
      end = _addMinutes(start, duration);
    }
    // Default 1h if we have start but no end and no duration
    if (start && !end) {
      end = _addMinutes(start, 60);
    }

    return { start, end };
  }

  function _buildTime(h, min, period, ampm) {
    let hour = parseInt(h, 10);
    const m  = min ? parseInt(min, 10) : 0;

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    if (period === 'tarde' || period === 'noche') { if (hour < 12) hour += 12; }

    // Sanity: business hours 7-21
    if (hour < 7 || hour > 21) return null;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function _addMinutes(timeStr, minutes) {
    const [h, m] = timeStr.split(':').map(Number);
    const total  = h * 60 + m + minutes;
    const nh     = Math.floor(total / 60);
    const nm     = total % 60;
    if (nh > 21) return null;
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
  }

  /* ── RESPONSIBLE EXTRACTION ── */

  const _HONORIFICS = /\b(Dr\.|Dra\.|Lic\.|Ldo\.|Mtr[ao]\.|Ing\.|Prof\.|Profa\.|M\.?D\.|Ph\.?D\.)(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*/;

  function _extractResponsible(text) {
    const m = text.match(_HONORIFICS);
    if (m) return m[0].trim();

    // Look for "con [Nombre Apellido]"
    const conMatch = text.match(/\bcon\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/);
    if (conMatch) return conMatch[1].trim();

    return '';
  }

  /* ── AREA EXTRACTION ── */

  const _AREA_KEYWORDS = [
    'academia', 'académica', 'coordinación', 'departamento', 'depto',
    'dirección', 'área', 'rectoría', 'secretaría', 'administración',
    'investigación', 'docencia', 'posgrado', 'ingeniería', 'telecomunicaciones',
    'sistemas', 'ciencias', 'humanidades', 'negocios', 'derecho', 'diseño',
  ];

  function _extractArea(text) {
    const lower = text.toLowerCase();
    for (const kw of _AREA_KEYWORDS) {
      const re = new RegExp(`\\b${kw}\\b[\\s\\w]*`, 'i');
      const m  = text.match(re);
      if (m) return m[0].trim().slice(0, 80);
    }
    return '';
  }

  /* ── CONFIDENCE SCORE ── */

  function _confidence(date, start, responsible) {
    let score = 0;
    if (date)        score += 0.4;
    if (start)       score += 0.35;
    if (responsible) score += 0.25;
    return parseFloat(score.toFixed(2));
  }

  /* ════════════════════════════════════════════════════════
     SUGGEST — 3 mejores horarios disponibles (HU-33)
  ════════════════════════════════════════════════════════ */

  /**
   * suggest(date, durationMin?) → [{ startTime, endTime, label, isPreferred }]
   * Returns up to 3 best available slots, prioritizing common meeting times.
   * durationMin defaults to 60.
   */
  function suggest(date, durationMin = 60) {
    if (!date) return [];

    const activeOnDate = Store.getReservations({ date, status: 'active' });
    const slots        = [];

    // Preferred windows (business hours, common meeting times first)
    const PREFERRED_STARTS = [
      '09:00','10:00','11:00','14:00','15:00','16:00',
      '08:00','08:30','09:30','10:30','11:30','12:00',
      '13:00','13:30','14:30','15:30','16:30','17:00','17:30',
    ];

    for (const startStr of PREFERRED_STARTS) {
      if (slots.length >= 3) break;

      const endStr = _addMinutes(startStr, durationMin);
      if (!endStr) continue;

      // Check against existing reservations
      const conflict = activeOnDate.some(r =>
        Utils.timesOverlap(startStr, endStr, r.startTime, r.endTime)
      );

      if (!conflict) {
        slots.push({
          startTime:   startStr,
          endTime:     endStr,
          label:       `${startStr} – ${endStr}`,
          isPreferred: ['09:00','10:00','11:00','14:00','15:00'].includes(startStr),
        });
      }
    }

    return slots;
  }

  /* ════════════════════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════════════════════ */

  function _emptyResult(rawText) {
    return {
      date: null, startTime: null, endTime: null,
      responsible: '', area: '', observations: '',
      confidence: 0, source: 'local', rawText,
    };
  }

  function _validateDate(str) {
    if (!str || typeof str !== 'string') return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(str.trim()) ? str.trim() : null;
  }

  function _validateTime(str) {
    if (!str || typeof str !== 'string') return null;
    return /^\d{2}:\d{2}$/.test(str.trim()) ? str.trim() : null;
  }

  function _safeParseJSON(str) {
    try {
      // Strip markdown code fences if present
      const clean = str.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean);
    } catch { return null; }
  }

  return { configure, getConfig, parse, suggest };
})();
