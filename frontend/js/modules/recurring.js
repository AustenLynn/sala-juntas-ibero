/* ============================================================
   RECURRING.JS — Lógica de reservaciones recurrentes
   HU-27: Crear reservación recurrente
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

const Recurring = (() => {

  const MAX_INSTANCES = 52;

  /* ════════════════════════════════════════
     GENERATE — calcula las instancias
     ════════════════════════════════════════ */
  /**
   * @param {object} opts
   * @param {string} opts.date
   * @param {string} opts.startTime
   * @param {string} opts.endTime
   * @param {string} opts.responsible
   * @param {string} opts.area
   * @param {string} [opts.observations]
   * @param {'weekly'|'biweekly'|'monthly'} opts.frequency
   * @param {number} opts.count
   * @param {string} [opts.endDate]
   * @returns {{ group, instances, skipped }}
   */
  const generate = (opts) => {
    const {
      date, startTime, endTime, responsible, area, observations = '',
      frequency, count, endDate,
    } = opts;

    const groupId = Utils.uid();
    const group = {
      id:             groupId,
      pattern:        frequency,
      endDate:        endDate || null,
      maxOccurrences: count,
      createdAt:      new Date().toISOString(),
    };

    const holidaySet = new Set(Store.getState().holidays.map(h => h.date));
    const userId     = Store.getUser()?.id ?? 'unknown';
    const maxCount   = Math.min(count, MAX_INSTANCES);

    const instances = [];
    const skipped   = [];

    let current   = _toDate(date);
    let generated = 0;
    let iters     = 0;
    const iterLimit = maxCount * 4;

    while (generated < maxCount && iters < iterLimit) {
      iters++;
      const dateStr = Utils.dateToISO(current);

      if (endDate && dateStr > endDate) break;

      const dow = current.getDay();
      if (dow === 0 || dow === 6) {
        skipped.push({ date: dateStr, reason: 'weekend' });
        _advance(current, frequency);
        continue;
      }

      if (holidaySet.has(dateStr)) {
        skipped.push({ date: dateStr, reason: 'holiday' });
        _advance(current, frequency);
        continue;
      }

      const conflict = Reservations.checkOverlap(dateStr, startTime, endTime);
      if (conflict) {
        skipped.push({ date: dateStr, reason: 'overlap', conflictWith: conflict });
        _advance(current, frequency);
        continue;
      }

      instances.push({
        id:               Utils.uid(),
        responsible:      responsible.trim(),
        area:             area.trim(),
        date:             dateStr,
        startTime,
        endTime,
        observations:     observations.trim(),
        status:           'active',
        isRecurring:      true,
        recurringGroupId: groupId,
        createdBy:        userId,
        createdAt:        new Date().toISOString(),
      });

      generated++;
      _advance(current, frequency);
    }

    return { group, instances, skipped };
  };

  /* ════════════════════════════════════════
     SAVE — persiste grupo e instancias
     ════════════════════════════════════════ */
  const save = ({ group, instances }) => {
    if (!instances.length) return 0;

    const state = Store.getState();
    Store.setState({ recurringGroups: [...state.recurringGroups, group] });
    instances.forEach(r => Store.addReservation(r));

    Notifications.onReservationCreated({
      ...instances[0],
      _batchCount: instances.length,
    });

    Store.persist();
    return instances.length;
  };

  /* ════════════════════════════════════════
     CANCEL SERIES
     ════════════════════════════════════════ */
  const cancelSeries = (recurringGroupId) => {
    const series = Store.getState().reservations.filter(r =>
      r.recurringGroupId === recurringGroupId && r.status === 'active'
    );
    const cancelledAt = new Date().toISOString();
    series.forEach(r => {
      Store.updateReservation(r.id, { status: 'cancelled', cancelledAt });
    });
    Store.persist();
    return series.length;
  };

  const getSeriesInstances = (recurringGroupId) =>
    Store.getState().reservations.filter(r => r.recurringGroupId === recurringGroupId);

  /* ── HELPERS ── */
  const _advance = (date, frequency) => {
    switch (frequency) {
      case 'weekly':   date.setDate(date.getDate() + 7);  break;
      case 'biweekly': date.setDate(date.getDate() + 14); break;
      case 'monthly':  date.setMonth(date.getMonth() + 1); break;
    }
  };

  const _toDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  return { generate, save, cancelSeries, getSeriesInstances };
})();
