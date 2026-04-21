/* ============================================================
   CALENDAR-WEEK.JS — Componente de vista semanal
   HU-04 (disponibilidad), HU-06 (responsable), HU-07 (navegación)
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

const CalendarWeek = (() => {

  const HOUR_START = 8;
  const HOUR_END   = 20;
  const SLOT_H     = 60;                              // px por hora
  const TOTAL_H    = (HOUR_END - HOUR_START) * SLOT_H; // 720px

  /* ════════════════════════════════════════
     PUBLIC: render
     ════════════════════════════════════════ */
  /**
   * @param {object}   opts
   * @param {string}   opts.containerId
   * @param {Date}     opts.weekStart          — Lunes de la semana a mostrar
   * @param {Array}    opts.reservations
   * @param {Array}    opts.holidays
   * @param {boolean}  opts.editable
   * @param {Function} opts.onSlotClick        (dateStr, hourStr) => void
   * @param {Function} opts.onReservationClick (id, event) => void
   */
  const render = ({
    containerId,
    weekStart,
    reservations       = [],
    holidays           = [],
    editable           = false,
    onSlotClick        = null,
    onReservationClick = null,
  }) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const days       = _buildDays(weekStart);
    const todayStr   = Utils.today();
    const holidaySet = new Set(holidays.map(h => h.date));

    // Indexar reservaciones por fecha (solo activas, solo esta semana)
    const resByDate = {};
    days.forEach(d => { resByDate[d.iso] = []; });
    reservations.forEach(r => {
      if (resByDate[r.date] !== undefined && r.status !== 'cancelled') {
        resByDate[r.date].push(r);
      }
    });

    container.innerHTML = `
      <div class="cal-wk" role="grid" aria-label="Vista semanal">
        ${_buildHeader(days, todayStr, holidaySet)}
        <div class="cal-wk__body">
          ${_buildGutter()}
          ${days.map(d => _buildDayCol(d, resByDate[d.iso] || [], holidaySet, editable, todayStr)).join('')}
        </div>
      </div>`;

    _attachEvents(container, editable, onSlotClick, onReservationClick);
  };

  /* ── CONSTRUIR 7 DÍAS ── */
  const _buildDays = (weekStart) => {
    const abbrs = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return abbrs.map((abbr, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return {
        date:      d,
        iso:       Utils.dateToISO(d),
        day:       d.getDate(),
        abbr,
        isWeekend: i >= 5,
      };
    });
  };

  /* ── HEADER ── */
  const _buildHeader = (days, todayStr, holidaySet) => {
    const cells = days.map(d => {
      const isToday = d.iso === todayStr;
      const cls = [
        'cal-wk__head-cell',
        isToday           ? 'is-today'   : '',
        holidaySet.has(d.iso) ? 'is-holiday' : '',
        d.isWeekend       ? 'is-weekend' : '',
      ].filter(Boolean).join(' ');

      return `
        <div class="${cls}" role="columnheader" aria-label="${d.abbr} ${d.day}">
          <span class="cal-wk__dow">${d.abbr}</span>
          <span class="cal-wk__daynum${isToday ? ' is-today' : ''}">${d.day}</span>
        </div>`;
    }).join('');

    return `
      <div class="cal-wk__header" role="row">
        <div class="cal-wk__gutter-head" aria-hidden="true"></div>
        ${cells}
      </div>`;
  };

  /* ── GUTTER DE HORAS ── */
  const _buildGutter = () => {
    let labels = '';
    for (let h = HOUR_START; h <= HOUR_END; h++) {
      labels += `<span class="cal-wk__hour-label"
                       style="top:${(h - HOUR_START) * SLOT_H}px"
                       aria-hidden="true">
                   ${String(h).padStart(2, '0')}:00
                 </span>`;
    }
    return `<div class="cal-wk__gutter" style="height:${TOTAL_H}px;" aria-hidden="true">${labels}</div>`;
  };

  /* ── COLUMNA DE DÍA ── */
  const _buildDayCol = (d, reservations, holidaySet, editable, todayStr) => {
    const isDisabled = d.isWeekend || holidaySet.has(d.iso);
    const cls = [
      'cal-wk__day-col',
      d.iso === todayStr ? 'is-today'   : '',
      isDisabled         ? 'is-disabled' : '',
    ].filter(Boolean).join(' ');

    // Líneas de hora (fondo clickeable)
    let slots = '';
    for (let h = HOUR_START; h < HOUR_END; h++) {
      const canClick = editable && !isDisabled;
      const timeStr  = `${String(h).padStart(2, '0')}:00`;
      slots += `<div class="cal-wk__slot${canClick ? ' is-clickable' : ''}"
                     style="top:${(h - HOUR_START) * SLOT_H}px;height:${SLOT_H}px;"
                     data-date="${d.iso}" data-hour="${timeStr}"
                     ${canClick
                       ? `role="button" tabindex="0" aria-label="Reservar el ${d.iso} a las ${timeStr}"`
                       : 'aria-hidden="true"'}
               ></div>`;
    }

    const blocks = reservations.map(r => _buildEvent(r)).join('');

    return `<div class="${cls}" style="height:${TOTAL_H}px;" role="gridcell">${slots}${blocks}</div>`;
  };

  /* ── BLOQUE DE EVENTO ── */
  const _buildEvent = (r) => {
    const [sh, sm] = r.startTime.split(':').map(Number);
    const [eh, em] = r.endTime.split(':').map(Number);

    const startMin = Math.max(0, (sh - HOUR_START) * 60 + sm);
    const endMin   = Math.min(TOTAL_H, (eh - HOUR_START) * 60 + em);
    const height   = Math.max(22, endMin - startMin);

    const cls = [
      'cal-wk__event cal-reservation',
      r.isRecurring ? 'is-recurring' : '',
    ].filter(Boolean).join(' ');

    return `
      <div class="${cls}"
           style="top:${startMin}px;height:${height}px;"
           data-id="${r.id}"
           role="button" tabindex="0"
           aria-label="${Utils.escapeHTML(r.responsible)}, ${r.startTime}–${r.endTime}">
        <span class="cal-wk__ev-time">${r.startTime}–${r.endTime}</span>
        <span class="cal-wk__ev-name">${Utils.escapeHTML(Utils.truncate(r.responsible, 22))}</span>
      </div>`;
  };

  /* ── EVENT LISTENERS ── */
  const _attachEvents = (container, editable, onSlotClick, onReservationClick) => {
    container.querySelectorAll('.cal-wk__event').forEach(el => {
      const fire = (e) => { e.stopPropagation(); onReservationClick?.(el.dataset.id, e); };
      el.addEventListener('click',   fire);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(e); }
      });
    });

    if (editable && onSlotClick) {
      container.querySelectorAll('.cal-wk__slot.is-clickable').forEach(el => {
        const fire = () => onSlotClick(el.dataset.date, el.dataset.hour);
        el.addEventListener('click',   fire);
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
        });
      });
    }
  };

  return { render };
})();
