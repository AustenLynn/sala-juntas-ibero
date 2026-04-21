const API = (() => {
  const BASE = '/api';

  const _request = async (method, path, body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add JWT token if available
    const token = localStorage.getItem('ibero_jwt');
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${BASE}${path}`, options);

      // Handle 401 Unauthorized - clear session and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('ibero_jwt');
        localStorage.removeItem('ibero_session');
        localStorage.removeItem('ibero_login_time');
        window.location.href = '/index.html';
        return;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API ${method} ${path}:`, err);
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

  // Auth
  const login = (email, password) =>
    _request('POST', '/auth/login', { email, password });

  const logout = () =>
    _request('POST', '/auth/logout');

  const forgotPassword = (email) =>
    _request('POST', '/auth/forgot-password', { email });

  // Reservations
  const getReservations = (params = {}) =>
    _request('GET', `/reservations${_qs(params)}`);

  const getReservation = (id) =>
    _request('GET', `/reservations/${id}`);

  const createReservation = (data) =>
    _request('POST', '/reservations', data);

  const updateReservation = (id, data) =>
    _request('PUT', `/reservations/${id}`, data);

  const cancelReservation = (id) =>
    _request('DELETE', `/reservations/${id}`);

  const bulkCancelReservations = (ids) =>
    _request('DELETE', '/reservations/bulk', { ids });

  // Calendar / Holidays
  const getHolidays = () =>
    _request('GET', '/calendar/holidays');

  const createHoliday = (data) =>
    _request('POST', '/calendar/holidays', data);

  const deleteHoliday = (id) =>
    _request('DELETE', `/calendar/holidays/${id}`);

  // Users
  const getUsers = () =>
    _request('GET', '/users');

  const createUser = (data) =>
    _request('POST', '/users', data);

  const updateUser = (id, data) =>
    _request('PUT', `/users/${id}`, data);

  const deactivateUser = (id) =>
    _request('PATCH', `/users/${id}/deactivate`);

  // Stats
  const getDashboardStats = () =>
    _request('GET', '/stats/dashboard');

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
    getDashboardStats
  };
})();
