/* ============================================================
   RESERVATIONS.JS — CRUD de reservaciones
   HU-08 (crear), HU-09 (traslape), HU-10 (editar),
   HU-11 (cancelar), HU-12 (masiva), HU-15 (responsable)
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

const Reservations = (() => {

  /* ════════════════════════════════════════
     CREATE — HU-08
     ════════════════════════════════════════ */
  /**
   * Crea una nueva reservación individual.
   * @param {{ date, startTime, endTime, responsible, area, observations }} data
   * @returns {{ success: true, reservation } | { success: false, error, conflictWith }}
   */
  const create = (data) => {
    const conflict = checkOverlap(data.date, data.startTime, data.endTime);
    if (conflict) return { success: false, error: 'overlap', conflictWith: conflict };

    const r = _buildRecord(data);
    Store.addReservation(r);
    Notifications.onReservationCreated(r);
    return { success: true, reservation: r };
  };

  /* ════════════════════════════════════════
     UPDATE — HU-10
     ════════════════════════════════════════ */
  /**
   * Actualiza una reservación existente.
   * @param {string} id
   * @param {{ date, startTime, endTime, responsible, area, observations }} data
   * @returns {{ success: true } | { success: false, error, conflictWith }}
   */
  const update = (id, data) => {
    const conflict = checkOverlap(data.date, data.startTime, data.endTime, id);
    if (conflict) return { success: false, error: 'overlap', conflictWith: conflict };

    Store.updateReservation(id, {
      responsible:  data.responsible.trim(),
      area:         data.area.trim(),
      date:         data.date,
      startTime:    data.startTime,
      endTime:      data.endTime,
      observations: (data.observations ?? '').trim(),
      updatedAt:    new Date().toISOString(),
    });

    return { success: true };
  };

  /* ════════════════════════════════════════
     CANCEL — HU-11
     ════════════════════════════════════════ */
  /**
   * Cancela (soft-delete) una reservación.
   * @param {string} id
   * @returns {boolean}
   */
  const cancel = (id) => {
    const r = getById(id);
    if (!r) return false;
    Store.updateReservation(id, {
      status:      'cancelled',
      cancelledAt: new Date().toISOString(),
    });
    Notifications.onReservationCancelled(r);
    return true;
  };

  /* ════════════════════════════════════════
     BULK CANCEL — HU-12
     ════════════════════════════════════════ */
  /**
   * Cancela múltiples reservaciones.
   * @param {string[]} ids
   * @returns {number}  — cantidad cancelada
   */
  const bulkCancel = (ids) => {
    let count = 0;
    ids.forEach(id => { if (cancel(id)) count++; });
    return count;
  };

  /* ════════════════════════════════════════
     READ
     ════════════════════════════════════════ */
  const getAll   = ()   => Store.getState().reservations;
  const getById  = (id) => Store.getState().reservations.find(r => r.id === id) ?? null;

  /* ════════════════════════════════════════
     OVERLAP CHECK — HU-09
     ════════════════════════════════════════ */
  /**
   * Busca la primera reservación activa que traslape el horario dado.
   * @param {string} date
   * @param {string} startTime  — "HH:MM"
   * @param {string} endTime    — "HH:MM"
   * @param {string} [excludeId]  — excluir al editar la propia reservación
   * @returns {object|null}  — reservación conflictiva o null
   */
  const checkOverlap = (date, startTime, endTime, excludeId = null) => {
    const sameDay = Store.getReservations({ date, status: 'active' });
    return sameDay.find(r =>
      r.id !== excludeId &&
      Utils.timesOverlap(startTime, endTime, r.startTime, r.endTime)
    ) ?? null;
  };

  /* ════════════════════════════════════════
     PRIVATE
     ════════════════════════════════════════ */
  const _buildRecord = (data) => ({
    id:               Utils.uid(),
    responsible:      data.responsible.trim(),
    area:             data.area.trim(),
    date:             data.date,
    startTime:        data.startTime,
    endTime:          data.endTime,
    observations:     (data.observations ?? '').trim(),
    status:           'active',
    isRecurring:      false,
    recurringGroupId: null,
    createdBy:        Store.getUser()?.id ?? 'unknown',
    createdAt:        new Date().toISOString(),
  });

  return {
    create,
    update,
    cancel,
    bulkCancel,
    getAll,
    getById,
    checkOverlap,
  };
})();
