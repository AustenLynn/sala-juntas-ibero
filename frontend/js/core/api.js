const API = (() => {
  const BASE = '/api';

  const _request = async (method, path, body = null) => {
    console.log(`[API._request] ${method} ${path} - START`);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add JWT token if available
    const token = localStorage.getItem('ibero_jwt');
    if (token) {
      console.log('[API._request] JWT token found in localStorage');
      options.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[API._request] No JWT token in localStorage');
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const fullUrl = `${BASE}${path}`;
      console.log(`[API._request] Fetching: ${fullUrl}`, options);
      const response = await fetch(fullUrl, options);
      console.log(`[API._request] Response status: ${response.status}`);

      // Handle 401 Unauthorized - clear session and redirect to login
      if (response.status === 401) {
        console.error('[API._request] 401 Unauthorized - redirecting to login');
        localStorage.removeItem('ibero_jwt');
        localStorage.removeItem('ibero_session');
        localStorage.removeItem('ibero_login_time');
        window.location.href = '/index.html';
        return;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        console.log('[API._request] 204 No Content');
        return null;
      }

      const data = await response.json();
      console.log(`[API._request] Response data:`, data);

      // Handle error responses
      if (!response.ok) {
        console.error(`[API._request] Response not ok (${response.status}):`, data);
        const error = new Error(data.error || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      console.log(`[API._request] ${method} ${path} - SUCCESS`);
      return data;
    } catch (err) {
      console.error(`[API._request] ${method} ${path} - ERROR:`, err);
      throw err;
    }
  };

  const _qs = (params) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        qs.append(key, value);
      }
    });
    const str = qs.toString();
    return str ? `?${str}` : '';
  };

  // Normalize API responses to frontend format
  const _normalizeReservation = (r) => ({
    ...r,
    date: r.start_time.split('T')[0],
    startTime: r.start_time.split('T')[1].substring(0, 5),
    endTime: r.end_time.split('T')[1].substring(0, 5),
    responsible: r.responsible_name,
    isRecurring: r.is_recurring,
    recurringGroupId: r.recurring_group
  });

  const _normalizeHoliday = (h) => ({
    ...h,
    date: h.date.split('T')[0]
  });

  // Auth
  const login = (email, password) =>
    _request('POST', '/auth/login', { email, password });

  const logout = () =>
    _request('POST', '/auth/logout');

  const forgotPassword = (email) =>
    _request('POST', '/auth/forgot-password', { email });

  // Reservations
  const getReservations = async (params = {}) => {
    const data = await _request('GET', `/reservations${_qs(params)}`);
    return Array.isArray(data) ? data.map(_normalizeReservation) : data;
  };

  const getReservation = async (id) => {
    const data = await _request('GET', `/reservations/${id}`);
    return _normalizeReservation(data);
  };

  const createReservation = async (data) => {
    const res = await _request('POST', '/reservations', data);
    return _normalizeReservation(res);
  };

  const updateReservation = async (id, data) => {
    const res = await _request('PUT', `/reservations/${id}`, data);
    return _normalizeReservation(res);
  };

  const cancelReservation = (id) =>
    _request('DELETE', `/reservations/${id}`);

  const bulkCancelReservations = (ids) =>
    _request('DELETE', '/reservations/bulk', { ids });

  // Calendar / Holidays
  const getHolidays = async () => {
    const data = await _request('GET', '/calendar/holidays');
    return Array.isArray(data) ? data.map(_normalizeHoliday) : data;
  };

  const createHoliday = async (data) => {
    const res = await _request('POST', '/calendar/holidays', data);
    return _normalizeHoliday(res);
  };

  const deleteHoliday = (id) =>
    _request('DELETE', `/calendar/holidays/${id}`);

  // Users
  const getUsers = () => {
    console.log('[API.getUsers] Calling GET /users');
    return _request('GET', '/users');
  };

  const createUser = (data) => {
    console.log('[API.createUser] Calling POST /users with:', data);
    return _request('POST', '/users', data);
  };

  const updateUser = (id, data) => {
    console.log('[API.updateUser] Calling PUT /users/' + id + ' with:', data);
    return _request('PUT', `/users/${id}`, data);
  };

  const deactivateUser = (id) => {
    console.log('[API.deactivateUser] Calling PATCH /users/' + id + '/deactivate');
    return _request('PATCH', `/users/${id}/deactivate`);
  };

  // Stats
  const getDashboardStats = () =>
    _request('GET', '/stats/dashboard');

  // Recurring groups
  const createRecurringGroup = (data) =>
    _request('POST', '/reservations/recurring-group', data);

  return {
    login,
    logout,
    forgotPassword,
    getReservations,
    getReservation,
    createReservation,
    updateReservation,
    cancelReservation,
    bulkCancelReservations,
    getHolidays,
    createHoliday,
    deleteHoliday,
    getUsers,
    createUser,
    updateUser,
    deactivateUser,
    getDashboardStats,
    createRecurringGroup
  };
})();
