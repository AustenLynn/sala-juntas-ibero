/* ============================================================
   AI-PAGE.JS — Lógica del panel de Asistente IA
   HU-31 (lenguaje natural), HU-32 (propuesta editable),
   HU-33 (sugerencias de horario)
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  Store.init();
  const user = Auth.requireAuth();
  if (!user) return;

  // Only secretaria accesses this page
  if (user.role !== 'secretaria') {
    window.location.href = 'calendar.html';
    return;
  }

  // Load reservations from API so overlap validation works
  try {
    const reservations = await API.getReservations();
    Store.setState({ reservations });
  } catch (err) {
    console.warn('[AI Page] Could not load reservations:', err.message);
  }

  Sidebar.init('ai-panel');
  Auth.startInactivityWatcher();

  /* ── DOM refs ──────────────────────────────────────────── */
  const inputEl        = document.getElementById('ai-input');
  const btnProcess     = document.getElementById('btn-process');
  const btnClearInput  = document.getElementById('btn-clear-input');
  const loadingEl      = document.getElementById('ai-loading');
  const loadingText    = document.getElementById('ai-loading-text');
  const proposalEl     = document.getElementById('ai-proposal');
  const sourceBadge    = document.getElementById('ai-source-badge');
  const confidenceText = document.getElementById('ai-confidence-text');

  // Proposal fields
  const propDate    = document.getElementById('prop-date');
  const propStart   = document.getElementById('prop-start');
  const propEnd     = document.getElementById('prop-end');
  const propRespon  = document.getElementById('prop-responsible');
  const propArea    = document.getElementById('prop-area');
  const propObs     = document.getElementById('prop-observations');
  const overlapEl   = document.getElementById('prop-overlap');
  const overlapIcon = document.getElementById('prop-overlap-icon');
  const overlapText = document.getElementById('prop-overlap-text');

  const btnDiscard  = document.getElementById('btn-proposal-discard');
  const btnSave     = document.getElementById('btn-proposal-save');

  // Suggestions
  const suggestDate = document.getElementById('suggest-date');
  const suggestList = document.getElementById('suggestions-list');

  // Config
  const btnToggleCfg = document.getElementById('btn-toggle-config');
  const cfgPanel     = document.getElementById('ai-config-panel');
  const cfgProvider  = document.getElementById('cfg-provider');
  const cfgKey       = document.getElementById('cfg-key');
  const cfgModel     = document.getElementById('cfg-model');
  const btnSaveCfg   = document.getElementById('btn-save-config');
  const btnClearCfg  = document.getElementById('btn-clear-config');

  /* ── Populate time selects ─────────────────────────────── */
  _populateTimeSelects();

  /* ── Load saved API config ─────────────────────────────── */
  _loadConfigUI();

  /* ════════════════════════════════════════════════════════
     EXAMPLE CHIPS
  ════════════════════════════════════════════════════════ */

  document.querySelectorAll('.ai-example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (inputEl) inputEl.value = chip.dataset.example ?? '';
      inputEl?.focus();
    });
  });

  /* ── Clear input ── */
  btnClearInput?.addEventListener('click', () => {
    if (inputEl) inputEl.value = '';
    _hideProposal();
    inputEl?.focus();
  });

  /* ════════════════════════════════════════════════════════
     PROCESS BUTTON — main entry point
  ════════════════════════════════════════════════════════ */

  btnProcess?.addEventListener('click', _onProcess);

  inputEl?.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter triggers process
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) _onProcess();
  });

  async function _onProcess() {
    const text = inputEl?.value?.trim();
    if (!text) {
      Toast.show('Escribe una descripción primero.', 'warning');
      inputEl?.focus();
      return;
    }

    _setLoading(true, 'Analizando descripción…');
    _hideProposal();

    try {
      const result = await AI.parse(text);
      _showProposal(result);

      // Auto-populate suggestions date
      if (result.date && suggestDate) {
        suggestDate.value = result.date;
        _renderSuggestions(result.date);
      }
    } catch (err) {
      console.error('[AI Page] parse error:', err);
      Toast.show('Error al procesar el texto. Intenta de nuevo.', 'error');
    } finally {
      _setLoading(false);
    }
  }

  /* ════════════════════════════════════════════════════════
     PROPOSAL DISPLAY & EDITING
  ════════════════════════════════════════════════════════ */

  function _showProposal(result) {
    // Populate fields
    if (propDate)   propDate.value   = result.date        ?? '';
    if (propRespon) propRespon.value = result.responsible ?? '';
    if (propArea)   propArea.value   = result.area        ?? '';
    if (propObs)    propObs.value    = result.observations ?? '';

    // Populate time selects
    _setSelectValue(propStart, result.startTime ?? '');
    _setSelectValue(propEnd,   result.endTime   ?? '');

    // Source badge
    if (sourceBadge) {
      sourceBadge.textContent = result.source === 'api' ? '🤖 API' : '📝 local';
      sourceBadge.classList.toggle('is-api', result.source === 'api');
    }
    if (confidenceText) {
      const pct = Math.round((result.confidence ?? 0) * 100);
      confidenceText.textContent = `${pct}% confianza`;
    }

    proposalEl?.classList.add('is-visible');

    // Check overlap immediately
    _checkOverlap();

    // Autocomplete on responsible field
    Autocomplete.init(propRespon, () => Store.getState().responsibleHistory, {
      minChars: 2,
      onSelect: () => _validateProposal(),
    });

    // Focus first incomplete field
    if (!result.date)        propDate?.focus();
    else if (!result.startTime) propStart?.focus();
    else if (!result.responsible) propRespon?.focus();
    else                     btnSave?.focus();
  }

  function _hideProposal() {
    proposalEl?.classList.remove('is-visible');
    _setOverlapStatus('hidden');
    _validateProposal();
  }

  /* ── Field change listeners ── */
  propDate?.addEventListener('change', () => {
    _checkOverlap();
    // Re-render suggestions for new date
    if (suggestDate) suggestDate.value = propDate.value;
    _renderSuggestions(propDate.value);
  });
  propStart?.addEventListener('change', _checkOverlap);
  propEnd?.addEventListener('change',   _checkOverlap);
  [propRespon, propArea].forEach(el => el?.addEventListener('input', _validateProposal));

  /* ── Overlap check ── */
  function _checkOverlap() {
    const date  = propDate?.value;
    const start = propStart?.value;
    const end   = propEnd?.value;

    if (!date || !start || !end) {
      _setOverlapStatus('hidden');
      _validateProposal();
      return;
    }

    if (!Utils.isValidTimeRange(start, end)) {
      _setOverlapStatus('invalid');
      _validateProposal();
      return;
    }

    const conflict = Reservations.checkOverlap(date, start, end);
    if (conflict) {
      _setOverlapStatus('conflict', conflict);
    } else {
      _setOverlapStatus('available');
    }

    _validateProposal();
  }

  let _currentOverlapState = 'hidden';

  function _setOverlapStatus(state, conflict = null) {
    _currentOverlapState = state;
    if (!overlapEl) return;

    overlapEl.className = 'ai-overlap-status';
    overlapEl.classList.add(`is-${state}`);

    if (state === 'hidden') {
      if (overlapIcon) overlapIcon.innerHTML = '';
      if (overlapText) overlapText.textContent = '';
      return;
    }
    if (state === 'available') {
      if (overlapIcon) overlapIcon.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      if (overlapText) overlapText.textContent = 'Horario disponible';
    } else if (state === 'conflict') {
      if (overlapIcon) overlapIcon.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      const who = conflict ? ` (${Utils.escapeHTML(Utils.truncate(conflict.responsible, 20))})` : '';
      if (overlapText) overlapText.textContent = `Traslape detectado${who}`;
    } else if (state === 'invalid') {
      if (overlapIcon) overlapIcon.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
      if (overlapText) overlapText.textContent = 'La hora de fin debe ser posterior a la de inicio';
    }
  }

  /* ── Validate all proposal fields → enable Save ── */
  function _validateProposal() {
    if (!btnSave) return;
    const ok = propDate?.value
            && propStart?.value
            && propEnd?.value
            && propRespon?.value?.trim()
            && propArea?.value?.trim()
            && _currentOverlapState === 'available';
    btnSave.disabled = !ok;
  }

  /* ── Discard ── */
  btnDiscard?.addEventListener('click', () => {
    _hideProposal();
    inputEl?.focus();
  });

  /* ── Save proposal ── */
  btnSave?.addEventListener('click', _onSave);

  async function _onSave() {
    const data = {
      start_time:   `${propDate?.value}T${propStart?.value}:00Z`,
      end_time:     `${propDate?.value}T${propEnd?.value}:00Z`,
      responsible:  propRespon?.value?.trim(),
      area:         propArea?.value?.trim(),
      observations: propObs?.value?.trim() ?? '',
    };

    const result = await Reservations.create(data);
    if (result.success) {
      Toast.show(`Reservación guardada para ${Utils.formatDateLong(data.date)}.`, 'success');
      _hideProposal();
      if (inputEl) inputEl.value = '';
      // Clear suggestions
      if (suggestDate) suggestDate.value = '';
      if (suggestList) suggestList.innerHTML = '<p class="suggestions-empty">Selecciona una fecha para ver los horarios disponibles.</p>';
    } else if (result.error === 'overlap') {
      Toast.show('Traslape detectado. Ajusta el horario antes de guardar.', 'error');
      _setOverlapStatus('conflict', result.conflictWith);
    } else {
      Toast.show('Error al guardar la reservación.', 'error');
    }
  }

  /* ════════════════════════════════════════════════════════
     SMART SUGGESTIONS (HU-33)
  ════════════════════════════════════════════════════════ */

  suggestDate?.addEventListener('change', () => _renderSuggestions(suggestDate.value));

  function _renderSuggestions(date) {
    if (!suggestList) return;

    if (!date) {
      suggestList.innerHTML = '<p class="suggestions-empty">Selecciona una fecha para ver los horarios disponibles.</p>';
      return;
    }

    if (Utils.isWeekend(date)) {
      suggestList.innerHTML = '<p class="suggestions-empty">Los fines de semana no están disponibles para reservaciones.</p>';
      return;
    }

    const slots = AI.suggest(date, 60);

    if (!slots.length) {
      suggestList.innerHTML = '<p class="suggestions-empty">No hay horarios disponibles en esta fecha.</p>';
      return;
    }

    suggestList.innerHTML = slots.map(s => `
      <button class="suggestion-chip${s.isPreferred ? ' is-preferred' : ''}"
              data-start="${s.startTime}" data-end="${s.endTime}"
              type="button"
              aria-label="Usar horario ${s.label}">
        <span class="suggestion-chip__time">${s.label}</span>
        ${s.isPreferred ? '<span class="suggestion-chip__badge">Recomendado</span>' : ''}
      </button>`
    ).join('');

    suggestList.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        // Populate proposal if visible, else fill-in date/time for a new proposal
        const start = chip.dataset.start;
        const end   = chip.dataset.end;

        if (proposalEl?.classList.contains('is-visible')) {
          // Update proposal selects
          if (propDate) propDate.value = date;
          _setSelectValue(propStart, start);
          _setSelectValue(propEnd, end);
          _checkOverlap();
          propRespon?.focus();
        } else {
          // Pre-fill input with suggestion info
          if (inputEl) {
            inputEl.value = `Reservación el ${date} de ${start} a ${end}`;
          }
        }

        Toast.show(`Horario ${start}–${end} seleccionado.`, 'info');
      });
    });
  }

  /* ════════════════════════════════════════════════════════
     API CONFIG
  ════════════════════════════════════════════════════════ */

  btnToggleCfg?.addEventListener('click', () => {
    const isOpen = cfgPanel?.classList.contains('is-open');
    cfgPanel?.classList.toggle('is-open', !isOpen);
    btnToggleCfg?.setAttribute('aria-expanded', String(!isOpen));
  });

  btnSaveCfg?.addEventListener('click', () => {
    AI.configure({
      provider: cfgProvider?.value ?? 'anthropic',
      apiKey:   cfgKey?.value?.trim() ?? '',
      model:    cfgModel?.value?.trim() ?? '',
    });
    Toast.show('Configuración de API guardada.', 'success');
    cfgPanel?.classList.remove('is-open');
    btnToggleCfg?.setAttribute('aria-expanded', 'false');
  });

  btnClearCfg?.addEventListener('click', () => {
    AI.configure({ apiKey: '', model: '' });
    if (cfgKey)   cfgKey.value   = '';
    if (cfgModel) cfgModel.value = '';
    Toast.show('Clave de API eliminada. Se usará análisis local.', 'info');
  });

  function _loadConfigUI() {
    const cfg = AI.getConfig();
    if (cfgProvider) cfgProvider.value = cfg.provider ?? 'anthropic';
    if (cfgKey)      cfgKey.value      = cfg.apiKey   ?? '';
    if (cfgModel)    cfgModel.value    = cfg.model    ?? '';
  }

  /* ════════════════════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════════════════════ */

  function _setLoading(on, message = '') {
    loadingEl?.classList.toggle('is-visible', on);
    if (loadingText && message) loadingText.textContent = message;
    if (btnProcess) btnProcess.disabled = on;
  }

  function _populateTimeSelects() {
    const options = ['<option value="">— Selecciona —</option>'];
    for (let h = 7; h <= 21; h++) {
      for (const m of [0, 30]) {
        if (h === 21 && m === 30) break;
        const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        options.push(`<option value="${t}">${t}</option>`);
      }
    }
    const html = options.join('');
    if (propStart) propStart.innerHTML = html;
    if (propEnd)   propEnd.innerHTML   = html;
  }

  function _setSelectValue(selectEl, value) {
    if (!selectEl || !value) return;
    // Try exact match first; then round to nearest 30-min slot
    const opt = [...selectEl.options].find(o => o.value === value);
    if (opt) {
      selectEl.value = value;
      return;
    }
    // Round to nearest half-hour
    const [h, m] = value.split(':').map(Number);
    const rounded = m < 15 ? `${String(h).padStart(2, '0')}:00`
                  : m < 45 ? `${String(h).padStart(2, '0')}:30`
                  :           `${String(h + 1 > 21 ? h : h + 1).padStart(2, '0')}:00`;
    selectEl.value = rounded;
  }
});
