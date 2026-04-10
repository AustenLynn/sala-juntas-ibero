/* ============================================================
   CALENDAR.JS — Módulo de calendario maestro
   HU-04 (vista disponibilidad), HU-05 (festivos/cierres),
   HU-06 (ver responsable), HU-07 (navegación anual libre)
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

const Calendar = (() => {

  /* ── ESTADO INTERNO ── */
  let _year        = new Date().getFullYear();
  let _month       = new Date().getMonth();   // 0-based
  let _containerId = 'cal-body';
  let _titleId     = 'cal-title';
  let _editable    = false;
  let _onDayClick         = null;
  let _onReservationClick = null;

  /* ════════════════════════════════════════
     INIT
     ════════════════════════════════════════ */
  /**
   * @param {object}   opts
   * @param {string}   opts.containerId
   * @param {string}   [opts.titleId]
   * @param {boolean}  [opts.editable]
   * @param {Function} [opts.onDayClick]         (dateStr) => void
   * @param {Function} [opts.onReservationClick] (id, event) => void
   */
  const init = (opts = {}) => {
    _containerId        = opts.containerId         ?? 'cal-body';
    _titleId            = opts.titleId             ?? 'cal-title';
    _editable           = opts.editable            ?? false;
    _onDayClick         = opts.onDayClick          ?? null;
    _onReservationClick = opts.onReservationClick  ?? null;

    const state = Store.getState();
    _year  = state.currentYear  ?? new Date().getFullYear();
    _month = state.currentMonth ?? new Date().getMonth();

    renderMonth(_year, _month);
  };

  /* ════════════════════════════════════════
     RENDER MONTH
     ════════════════════════════════════════ */
  const renderMonth = (year, month) => {
    _year  = year;
    _month = month;
    Store.setState({ currentYear: year, currentMonth: month });

    const titleEl = document.getElementById(_titleId);
    if (titleEl) titleEl.textContent = `${Utils.monthName(month)} ${year}`;

    const { reservations, holidays } = Store.getState();

    CalendarGrid.render({
      containerId:        _containerId,
      year,
      month,
      reservations,
      holidays,
      editable:           _editable,
      onDayClick:         _onDayClick,
      onReservationClick: _onReservationClick,
      onMoreClick:        _onDayClick,
    });
  };

  /* ════════════════════════════════════════
     NAVIGATION — sin restricción de año (HU-07)
     ════════════════════════════════════════ */
  /**
   * @param {'prev'|'next'|'today'} direction
   */
  const navigateTo = (direction) => {
    if (direction === 'today') {
      const now = new Date();
      renderMonth(now.getFullYear(), now.getMonth());
      return;
    }
    let y = _year;
    let m = _month;
    if (direction === 'prev') {
      m--;
      if (m < 0)  { m = 11; y--; }
    } else {
      m++;
      if (m > 11) { m = 0;  y++; }
    }
    renderMonth(y, m);
  };

  /* ════════════════════════════════════════
     MARK HELPERS — actualiza datos y re-renderiza
     ════════════════════════════════════════ */

  /** Reemplaza los días festivos y re-renderiza (HU-05) */
  const markHolidays = (newHolidays) => {
    const existing = Store.getState().holidays.filter(h => h.type !== 'holiday');
    Store.setState({ holidays: [...existing, ...newHolidays] });
    Store.persist();
    renderMonth(_year, _month);
  };

  /** Reemplaza los cierres institucionales y re-renderiza (HU-05) */
  const markClosed = (newClosures) => {
    const existing = Store.getState().holidays.filter(h => h.type !== 'closure');
    Store.setState({ holidays: [...existing, ...newClosures] });
    Store.persist();
    renderMonth(_year, _month);
  };

  /** Actualiza reservaciones en el store y re-renderiza */
  const renderReservations = (reservations) => {
    Store.setState({ reservations });
    Store.persist();
    renderMonth(_year, _month);
  };

  /* ════════════════════════════════════════
     ACCESSORS
     ════════════════════════════════════════ */
  const getCurrentYear  = () => _year;
  const getCurrentMonth = () => _month;

  return {
    init,
    renderMonth,
    navigateTo,
    markHolidays,
    markClosed,
    renderReservations,
    getCurrentYear,
    getCurrentMonth,
  };
})();
