/* ============================================================
   STORE.JS — Estado Global (patrón Module)
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

const Store = (() => {
  let state = {
    currentUser:        null,
    reservations:       [],
    recurringGroups:    [],
    users:              [],
    holidays:           [],
    responsibleHistory: [],
    currentMonth:       new Date().getMonth(),
    currentYear:        new Date().getFullYear(),
    calendarView:       'month',    // 'month' | 'week'
    selectedDate:       null,
    filters:            {},
    notificationLog:    []
  };

  /** Devuelve copia superficial del estado */
  const getState = () => ({ ...state });

  /** Actualiza estado (merge) */
  const setState = (updates) => {
    state = { ...state, ...updates };
    _notifyListeners();
  };

  /** Devuelve usuario actual */
  const getUser = () => state.currentUser;

  /** true si el usuario es secretaria */
  const isAdmin = () => state.currentUser?.role === 'secretaria';

  /* ── Listeners de cambio ── */
  const _listeners = [];
  const subscribe = (fn) => {
    _listeners.push(fn);
    return () => {
      const idx = _listeners.indexOf(fn);
      if (idx > -1) _listeners.splice(idx, 1);
    };
  };
  const _notifyListeners = () => _listeners.forEach(fn => fn(state));

  /* ── Inicialización desde localStorage ── */
  const init = () => {
    // Cargar datos mock si localStorage está vacío
    const stored = localStorage.getItem('ibero_reservations');
    const storedUsers = localStorage.getItem('ibero_users');
    const storedHolidays = localStorage.getItem('ibero_holidays');

    state.reservations    = stored
      ? JSON.parse(stored)
      : (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.reservations : []);

    state.recurringGroups = localStorage.getItem('ibero_recurring')
      ? JSON.parse(localStorage.getItem('ibero_recurring'))
      : (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.recurringGroups : []);

    state.users           = storedUsers
      ? JSON.parse(storedUsers)
      : (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.users : []);

    state.holidays        = storedHolidays
      ? JSON.parse(storedHolidays)
      : (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.holidays : []);

    state.responsibleHistory = localStorage.getItem('ibero_responsible')
      ? JSON.parse(localStorage.getItem('ibero_responsible'))
      : (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.responsibleHistory : []);

    state.notificationLog = localStorage.getItem('ibero_notif_log')
      ? JSON.parse(localStorage.getItem('ibero_notif_log'))
      : [];
  };

  /* ── Persistencia ── */
  const persist = () => {
    localStorage.setItem('ibero_reservations',  JSON.stringify(state.reservations));
    localStorage.setItem('ibero_recurring',      JSON.stringify(state.recurringGroups));
    localStorage.setItem('ibero_users',          JSON.stringify(state.users));
    localStorage.setItem('ibero_holidays',       JSON.stringify(state.holidays));
    localStorage.setItem('ibero_responsible',    JSON.stringify(state.responsibleHistory));
    localStorage.setItem('ibero_notif_log',      JSON.stringify(state.notificationLog));
  };

  /* ── Helpers de reservaciones ── */
  const getReservations = (filter = {}) => {
    let list = [...state.reservations];
    if (filter.status)    list = list.filter(r => r.status === filter.status);
    if (filter.date)      list = list.filter(r => r.date === filter.date);
    if (filter.dateFrom)  list = list.filter(r => r.date >= filter.dateFrom);
    if (filter.dateTo)    list = list.filter(r => r.date <= filter.dateTo);
    if (filter.responsible) {
      const q = filter.responsible.toLowerCase();
      list = list.filter(r => r.responsible.toLowerCase().includes(q));
    }
    return list;
  };

  const addReservation = (r) => {
    state.reservations.push(r);
    _updateResponsibleHistory(r.responsible);
    persist();
    _notifyListeners();
  };

  const updateReservation = (id, updates) => {
    const idx = state.reservations.findIndex(r => r.id === id);
    if (idx === -1) return false;
    state.reservations[idx] = { ...state.reservations[idx], ...updates, updatedAt: new Date().toISOString() };
    persist();
    _notifyListeners();
    return true;
  };

  const removeReservations = (ids) => {
    state.reservations = state.reservations.filter(r => !ids.includes(r.id));
    persist();
    _notifyListeners();
  };

  /* ── Helpers de historial de responsables ── */
  const _updateResponsibleHistory = (name) => {
    if (!name || !name.trim()) return;
    const clean = name.trim();
    if (!state.responsibleHistory.includes(clean)) {
      state.responsibleHistory.unshift(clean);
      if (state.responsibleHistory.length > 50) state.responsibleHistory.pop();
      persist();
    }
  };

  return {
    getState,
    setState,
    getUser,
    isAdmin,
    subscribe,
    init,
    persist,
    getReservations,
    addReservation,
    updateReservation,
    removeReservations
  };
})();
