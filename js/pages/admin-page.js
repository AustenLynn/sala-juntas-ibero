/* ============================================================
   ADMIN-PAGE.JS — Lógica de configuración calendario maestro
   HU-05: Configurar días festivos y cierres institucionales
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Proteger ruta (sólo secretaria)
  Store.init();
  const user = Auth.requireRole('secretaria');
  if (!user) return;

  // 2. Sidebar
  Sidebar.init('admin-config');

  // 3. Badge de rol
  const badge = document.getElementById('topbar-role-badge');
  if (badge) {
    badge.textContent = 'Secretaria';
    badge.className   = 'badge badge-primary topbar__badge-role';
  }

  // 4. Iniciar watcher de inactividad
  Auth.startInactivityWatcher();

  /* ── ESTADO DEL MINI CALENDARIO ── */
  let _selectedDate = null;
  let _calYear      = new Date().getFullYear();
  let _calMonth     = new Date().getMonth();

  /* ── RENDER MINI CALENDARIO ── */
  const _renderMiniCal = () => {
    document.getElementById('admin-cal-title').textContent =
      `${Utils.monthName(_calMonth)} ${_calYear}`;

    CalendarGrid.render({
      containerId:   'admin-mini-cal',
      year:          _calYear,
      month:         _calMonth,
      reservations:  [],                         // no se muestran reservaciones
      holidays:      Store.getState().holidays,
      editable:      true,
      maxPerDay:     0,
      onDayClick:    _onDateSelect,
    });
  };

  /* ── SELECCIÓN DE FECHA ── */
  const _onDateSelect = (dateStr) => {
    _selectedDate = dateStr;

    // Mostrar fecha seleccionada
    const display = document.getElementById('selected-date-display');
    if (display) display.textContent = Utils.formatDateLong(dateStr);

    // Habilitar botón submit
    const btn = document.getElementById('btn-mark-date');
    if (btn) btn.disabled = false;

    // Comprobar conflictos con reservaciones activas
    const count = Holidays.conflictCount(dateStr);
    const alertEl  = document.getElementById('conflict-warning');
    const alertTxt = document.getElementById('conflict-warning-text');
    if (alertEl && alertTxt) {
      if (count > 0) {
        alertTxt.textContent =
          `Hay ${count} reservación${count > 1 ? 'es' : ''} activa${count > 1 ? 's' : ''} en esta fecha. ` +
          `Márcala de todas formas o cancela esas reservaciones primero.`;
        alertEl.classList.remove('hidden');
      } else {
        alertEl.classList.add('hidden');
      }
    }
  };

  /* ── NAVEGACIÓN DEL MINI CALENDARIO ── */
  document.getElementById('admin-cal-prev')?.addEventListener('click', () => {
    _calMonth--;
    if (_calMonth < 0) { _calMonth = 11; _calYear--; }
    _renderMiniCal();
  });

  document.getElementById('admin-cal-next')?.addEventListener('click', () => {
    _calMonth++;
    if (_calMonth > 11) { _calMonth = 0; _calYear++; }
    _renderMiniCal();
  });

  /* ── FORMULARIO: AGREGAR FECHA ── */
  document.getElementById('add-holiday-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!_selectedDate) {
      Toast.show('Selecciona una fecha en el calendario primero.', 'warning');
      return;
    }

    const nameInput = document.getElementById('holiday-name');
    const typeInput = document.getElementById('holiday-type');
    const name = nameInput?.value.trim() ?? '';
    const type = typeInput?.value ?? 'holiday';

    if (!name) {
      Toast.show('Escribe un nombre o descripción para la fecha.', 'warning');
      nameInput?.focus();
      return;
    }

    Holidays.add({ date: _selectedDate, name, type });

    const typeLabel = type === 'holiday' ? 'Día Festivo' : 'Cierre Institucional';
    Toast.show(
      `${typeLabel} marcado: ${Utils.formatDateLong(_selectedDate)}`,
      'success'
    );

    // Limpiar formulario
    if (nameInput) nameInput.value = '';
    _selectedDate = null;

    const display = document.getElementById('selected-date-display');
    if (display) display.textContent = 'Haz clic en un día del calendario';

    const btn = document.getElementById('btn-mark-date');
    if (btn) btn.disabled = true;

    const alertEl = document.getElementById('conflict-warning');
    alertEl?.classList.add('hidden');

    // Refrescar calendario y lista
    _renderMiniCal();
    _renderList();
  });

  /* ── RENDER LISTA DE FECHAS MARCADAS ── */
  const _renderList = () => {
    Holidays.renderList('holiday-list', _renderList);

    // Actualizar contador
    const count = Holidays.getAll().length;
    const countEl = document.getElementById('holiday-count');
    if (countEl) {
      countEl.textContent = count
        ? `${count} fecha${count > 1 ? 's' : ''} marcada${count > 1 ? 's' : ''}`
        : '';
    }
  };

  /* ── INICIALIZACIÓN ── */
  _renderMiniCal();
  _renderList();
});
