/* ============================================================
   RESERVACION.JS — Lógica del formulario de reservación
   HU-08 (crear), HU-09 (traslape), HU-10 (editar),
   HU-15 (responsable), HU-16 (observaciones), HU-17 (flujo rápido)
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Proteger ruta
  Store.init();
  const user = Auth.requireRole('secretaria');
  if (!user) return;

  // 2. Sidebar
  Sidebar.init('reservacion');
  Auth.startInactivityWatcher();

  // 3. Load data from API if not already loaded (for autocomplete suggestions)
  const state = Store.getState();
  if (!state.reservations || state.reservations.length === 0) {
    try {
      const [reservations, holidays] = await Promise.all([
        API.getReservations(),
        API.getHolidays()
      ]);
      Store.setState({ reservations, holidays });
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }

  /* ── PARSEAR URL ── */
  const params    = new URLSearchParams(window.location.search);
  const editId    = params.get('edit');       // modo edición
  const dateParam = params.get('date');       // fecha prellenada (YYYY-MM-DD)
  const timeParam = params.get('time');       // hora prellenada (HH:MM, del slot semanal)

  const isEditMode = Boolean(editId);
  let existingReservation = null;

  /* ── REFERENCIAS A ELEMENTOS ── */
  const form         = document.getElementById('reservacion-form');
  const fieldDate    = document.getElementById('field-date');
  const fieldStart   = document.getElementById('field-start');
  const fieldEnd     = document.getElementById('field-end');
  const fieldResp    = document.getElementById('field-responsible');
  const fieldArea    = document.getElementById('field-area');
  const fieldObs     = document.getElementById('field-observations');
  const obsCounter   = document.getElementById('obs-counter');
  const overlapBox   = document.getElementById('overlap-status');
  const overlapIcon  = document.getElementById('overlap-icon');
  const overlapText  = document.getElementById('overlap-text');
  const btnSubmit    = document.getElementById('btn-submit');
  const btnSubmitTxt = document.getElementById('btn-submit-text');
  const btnCancel    = document.getElementById('btn-cancel-form');
  const recurChk     = document.getElementById('field-recurring');
  const recurPanel   = document.getElementById('recurrence-panel');

  /* ── POBLAR SELECTORES DE HORA ── */
  _populateTimeSelects();

  /* ── MODO EDICIÓN vs CREACIÓN ── */
  if (isEditMode) {
    existingReservation = Reservations.getById(editId);
    if (!existingReservation) {
      Toast.show('No se encontró la reservación a editar.', 'error');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
      return;
    }
    _setEditMode(existingReservation);
  } else {
    _setCreateMode();
  }

  /* ── AUTOCOMPLETADO DE RESPONSABLE (HU-15) ── */
  Autocomplete.init(
    fieldResp,
    () => Store.getState().responsibleHistory,
    { minChars: 2, onSelect: () => _validateField(fieldResp, 'err-responsible') }
  );

  /* ── EVENT LISTENERS ── */

  // Detección de traslape en tiempo real (HU-09)
  fieldDate.addEventListener('change',  _onTimeChange);
  fieldStart.addEventListener('change', _onTimeChange);
  fieldEnd.addEventListener('change',   _onTimeChange);

  // Contador de observaciones
  fieldObs.addEventListener('input', _updateObsCounter);

  // Toggle recurrencia
  recurChk.addEventListener('change', () => {
    recurPanel.classList.toggle('hidden', !recurChk.checked);
  });

  // Validación inline al salir del campo
  fieldResp.addEventListener('blur', () => _validateField(fieldResp, 'err-responsible'));
  fieldArea.addEventListener('blur', () => _validateField(fieldArea, 'err-area'));
  fieldDate.addEventListener('blur', () => _validateField(fieldDate, 'err-date'));

  // Submit
  form.addEventListener('submit', _onSubmit);

  // Cancelar
  btnCancel.addEventListener('click', () => {
    window.location.href = _backUrl();
  });

  /* ════════════════════════════════════════
     INICIALIZACIÓN DE MODOS
     ════════════════════════════════════════ */

  function _setCreateMode() {
    document.getElementById('page-title').textContent    = 'Nueva Reservación';
    document.getElementById('breadcrumb-current').textContent = 'Nueva Reservación';
    document.getElementById('form-title').textContent    = 'Nueva Reservación';
    document.getElementById('form-subtitle').textContent = 'Completa los datos para registrar la sala';
    btnSubmitTxt.textContent = 'Guardar reservación';

    // Prellenar fecha desde URL (HU-17)
    if (dateParam) {
      fieldDate.value = dateParam;
      _validateField(fieldDate, 'err-date');
    }
    // Prellenar hora de inicio desde slot semanal o usar default
    if (timeParam) {
      fieldStart.value = timeParam;
      // Auto-seleccionar +1h como fin
      fieldEnd.value = _addHour(timeParam, 1);
      _onTimeChange();
    } else {
      // If no time param, set default times (10:00 - 11:00)
      if (dateParam) {
        fieldStart.value = '10:00';
        fieldEnd.value = '11:00';
        _onTimeChange();
      }
    }
    _updateSubmitState();
  }

  function _setEditMode(r) {
    document.getElementById('page-title').textContent    = 'Editar Reservación';
    document.getElementById('breadcrumb-current').textContent = 'Editar Reservación';
    document.getElementById('form-title').textContent    = 'Editar Reservación';
    document.getElementById('form-subtitle').textContent = `Modificando reservación del ${Utils.formatDateLong(r.date)}`;
    btnSubmitTxt.textContent = 'Guardar cambios';

    document.getElementById('btn-back').href = _backUrl();

    // Rellenar campos
    fieldDate.value  = r.date;
    fieldStart.value = r.startTime;
    fieldEnd.value   = r.endTime;
    fieldResp.value  = r.responsible;
    fieldArea.value  = r.area;
    fieldObs.value   = r.observations ?? '';

    _updateObsCounter();
    _onTimeChange();     // verificar traslape excluyendo self
    _updateSubmitState();
  }

  /* ════════════════════════════════════════
     DETECCIÓN DE TRASLAPE — HU-09
     ════════════════════════════════════════ */

  function _onTimeChange() {
    const date  = fieldDate.value;
    const start = fieldStart.value;
    const end   = fieldEnd.value;

    // Limpiar estado si no hay valores completos
    if (!date || !start || !end) {
      _setOverlapStatus('hidden');
      _updateSubmitState();
      return;
    }

    // Validar que fin > inicio
    if (!Utils.isValidTimeRange(start, end)) {
      _setOverlapStatus('invalid', null, 'La hora de fin debe ser posterior al inicio.');
      _updateSubmitState();
      return;
    }

    // Buscar conflicto
    const conflict = Reservations.checkOverlap(date, start, end, editId ?? null);

    if (conflict) {
      _setOverlapStatus('conflict', conflict);
    } else {
      _setOverlapStatus('available');
    }
    _updateSubmitState();
  }

  function _setOverlapStatus(state, conflict, customMsg) {
    overlapBox.classList.remove('hidden', 'is-checking', 'is-available', 'is-conflict');

    if (state === 'hidden') {
      overlapBox.classList.add('hidden');
      return;
    }

    overlapBox.classList.remove('hidden');

    const svgAvailable = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/></svg>`;
    const svgConflict = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    const svgWarn = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

    if (state === 'available') {
      overlapBox.classList.add('is-available');
      overlapIcon.innerHTML = svgAvailable;
      overlapText.textContent = 'Horario disponible';
    } else if (state === 'conflict') {
      overlapBox.classList.add('is-conflict');
      overlapIcon.innerHTML = svgConflict;
      const who = conflict ? `${Utils.escapeHTML(conflict.responsible)} (${conflict.startTime}–${conflict.endTime})` : 'otra reservación';
      overlapText.innerHTML = `Traslape con <strong>${who}</strong>`;
    } else if (state === 'invalid') {
      overlapBox.classList.add('is-conflict');
      overlapIcon.innerHTML = svgWarn;
      overlapText.textContent = customMsg || 'Horario inválido.';
    }
  }

  /* ════════════════════════════════════════
     SUBMIT — HU-08 / HU-10
     ════════════════════════════════════════ */

  async function _onSubmit(e) {
    e.preventDefault();
    console.log('[Submit] Form submitted. Checking validation...');
    console.log('[Submit] Fields:', {
      date: fieldDate.value,
      start: fieldStart.value,
      end: fieldEnd.value,
      responsible: fieldResp.value.trim(),
      area: fieldArea.value.trim(),
      recurring: recurChk?.checked,
      overlapConflict: overlapBox.classList.contains('is-conflict'),
      btnDisabled: btnSubmit.disabled
    });

    if (!_validateAll()) {
      console.log('[Submit] Validation FAILED');
      return;
    }
    console.log('[Submit] Validation passed');

    const data = {
      start_time:   `${fieldDate.value}T${fieldStart.value}:00Z`,
      end_time:     `${fieldDate.value}T${fieldEnd.value}:00Z`,
      responsible:  fieldResp.value.trim(),
      area:         fieldArea.value.trim(),
      observations: fieldObs.value.trim(),
    };

    try {
      // Recurring path (HU-27) — sólo en modo creación
      if (!isEditMode && recurChk?.checked) {
        console.log('[Submit] Taking RECURRING path');
        await _submitRecurring(data);
        return;
      }
      console.log('[Submit] Taking NORMAL path');

      // Normal path
      let result;
      if (isEditMode) {
        result = await Reservations.update(editId, data);
      } else {
        result = await Reservations.create(data);
      }

      if (!result.success) {
        _setOverlapStatus('conflict', result.conflictWith);
        Toast.show('No se puede guardar: hay un traslape de horario.', 'error');
        return;
      }

      const msg = isEditMode
        ? 'Reservación actualizada correctamente.'
        : 'Reservación creada correctamente.';
      Toast.show(msg, 'success');
      setTimeout(() => { window.location.href = _backUrl(); }, 900);
    } catch (err) {
      console.error('Submit error:', err);
      Toast.show('Error al guardar la reservación. Intenta nuevamente.', 'error');
    }
  }

  /* ── RECURRING SUBMIT ── */
  async function _submitRecurring(data) {
    const freq    = document.getElementById('field-recur-freq')?.value ?? 'weekly';
    const rawCount = parseInt(document.getElementById('field-recur-count')?.value ?? '4', 10);
    const count   = Math.min(Math.max(isNaN(rawCount) ? 4 : rawCount, 2), 52);
    const endDate = document.getElementById('field-recur-end')?.value || null;

    // Transform data to match Recurring.generate() expectations
    const recurData = {
      date: fieldDate.value,
      startTime: fieldStart.value,
      endTime: fieldEnd.value,
      responsible: data.responsible,
      area: data.area,
      observations: data.observations,
      frequency: freq,
      count,
      endDate,
    };

    const { group, instances, skipped } = Recurring.generate(recurData);

    if (!instances.length) {
      Toast.show(
        'No se generaron instancias. Todos los días están ocupados, son festivos o fin de semana.',
        'error'
      );
      return;
    }

    try {
      const savedCount = await Recurring.save({ group, instances });

      if (savedCount === 0) {
        Toast.show('No se guardaron instancias. Intenta nuevamente.', 'error');
        return;
      }

      const skipMsg = skipped.length
        ? ` ${skipped.length} fecha${skipped.length !== 1 ? 's' : ''} omitida${skipped.length !== 1 ? 's' : ''} (festivo, fin de semana u ocupado).`
        : '';

      Toast.show(
        `Serie creada: ${savedCount} reservación${savedCount !== 1 ? 'es' : ''}.${skipMsg}`,
        'success'
      );

      // Wait for all data to be persisted before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = _backUrl();
    } catch (err) {
      console.error('Error saving recurring series:', err);
      Toast.show('Error al crear la serie. Intenta nuevamente.', 'error');
    }
  }

  /* ════════════════════════════════════════
     VALIDACIÓN
     ════════════════════════════════════════ */

  function _validateAll() {
    let ok = true;
    const dateOk  = _validateField(fieldDate,  'err-date');
    const startOk = _validateField(fieldStart, 'err-start');
    const endOk   = _validateField(fieldEnd,   'err-end');
    const respOk  = _validateField(fieldResp,  'err-responsible');
    const areaOk  = _validateField(fieldArea,  'err-area');
    ok = dateOk && startOk && endOk && respOk && areaOk;
    console.log('[Validate]', { dateOk, startOk, endOk, respOk, areaOk });

    // No permitir guardar si hay traslape o rango inválido
    if (overlapBox.classList.contains('is-conflict')) {
      Toast.show('Corrige el conflicto de horario antes de guardar.', 'error');
      ok = false;
    }
    return ok;
  }

  function _validateField(el, errId) {
    const errEl = document.getElementById(errId);
    const ok    = el.value.trim() !== '';
    el.classList.toggle('is-error', !ok);
    errEl?.classList.toggle('hidden', ok);
    return ok;
  }

  function _updateSubmitState() {
    const hasDate  = fieldDate.value !== '';
    const hasStart = fieldStart.value !== '';
    const hasEnd   = fieldEnd.value !== '';
    const noConflict = !overlapBox.classList.contains('is-conflict');
    btnSubmit.disabled = !(hasDate && hasStart && hasEnd && noConflict);
  }

  /* ════════════════════════════════════════
     UTILIDADES DE UI
     ════════════════════════════════════════ */

  function _populateTimeSelects() {
    const times = [];
    for (let h = 7; h <= 21; h++) {
      times.push(`${String(h).padStart(2,'0')}:00`);
      if (h < 21) times.push(`${String(h).padStart(2,'0')}:30`);
    }
    times.forEach(t => {
      fieldStart.add(new Option(t, t));
      fieldEnd.add(new Option(t, t));
    });
  }

  function _addHour(timeStr, hours) {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMin = h * 60 + m + hours * 60;
    const nh = Math.min(Math.floor(totalMin / 60), 21);
    const nm = totalMin % 60;
    return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`;
  }

  function _updateObsCounter() {
    const len = fieldObs.value.length;
    const max = 500;
    if (obsCounter) {
      obsCounter.textContent = `${len} / ${max}`;
      obsCounter.classList.toggle('is-near-limit', len >= max * 0.8 && len < max);
      obsCounter.classList.toggle('is-at-limit',   len >= max);
    }
  }

  function _backUrl() {
    // Volver a la página que originó la navegación, o al dashboard
    const ref = document.referrer;
    if (ref.includes('calendar.html')) return 'calendar.html';
    return 'dashboard.html';
  }
});
