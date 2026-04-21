/* ============================================================
   AUTH.JS — Autenticación y gestión de sesión
   HU-01 (secretaria), HU-02 (académico), HU-03 (logout), HU-22 (forgot pwd)
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

const Auth = (() => {
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  /* ── LOGIN ── */
  const login = (email, password) => {
    const { users } = Store.getState();
    const user = users.find(
      u => u.email === email && u.password === password && u.active
    );
    if (!user) return { success: false, error: 'Credenciales inválidas' };

    // Actualizar último acceso
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    Store.setState({
      currentUser: updatedUser,
      users: Store.getState().users.map(u => u.id === user.id ? updatedUser : u)
    });
    Store.persist();

    localStorage.setItem('ibero_session', JSON.stringify(updatedUser));
    localStorage.setItem('ibero_login_time', Date.now().toString());

    return { success: true, role: user.role };
  };

  /* ── LOGOUT ── */
  const logout = () => {
    Store.setState({ currentUser: null });
    localStorage.removeItem('ibero_session');
    localStorage.removeItem('ibero_login_time');
    window.location.href = 'index.html';
  };

  /* ── VERIFICAR SESIÓN ── */
  const checkSession = () => {
    const raw = localStorage.getItem('ibero_session');
    const loginTime = localStorage.getItem('ibero_login_time');
    if (!raw || !loginTime) return null;

    const elapsed = Date.now() - parseInt(loginTime, 10);
    if (elapsed > SESSION_TIMEOUT) {
      logout();
      return null;
    }

    const user = JSON.parse(raw);
    // Renovar timestamp en cada verificación
    localStorage.setItem('ibero_login_time', Date.now().toString());
    Store.setState({ currentUser: user });
    return user;
  };

  /* ── PROTECCIÓN DE RUTA POR ROL ── */
  const requireRole = (requiredRole) => {
    const user = checkSession();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    if (requiredRole && user.role !== requiredRole) {
      // Redirigir a su vista correcta
      if (user.role === 'secretaria') {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'calendar.html';
      }
      return null;
    }
    return user;
  };

  /* ── PROTECCIÓN GENERAL (cualquier sesión válida) ── */
  const requireAuth = () => {
    const user = checkSession();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  };

  /* ── OLVIDÉ CONTRASEÑA (simulado) ── */
  const requestPasswordReset = (email) => {
    const { users } = Store.getState();
    // No revelar si el email existe (seguridad)
    const exists = users.some(u => u.email === email && u.active);

    if (exists) {
      // Simular envío de email en prototipo
      Notifications && Notifications.logEmail({
        to: email,
        subject: 'Recuperación de contraseña — Sala de Juntas Ibero',
        body: `Se ha enviado un enlace de recuperación de contraseña a ${email}.`
      });
    }

    // Siempre responde genérico
    return { success: true, message: 'Si el correo existe, recibirás un enlace de recuperación.' };
  };

  /* ── CAMBIAR CONTRASEÑA ── */
  const changePassword = (userId, newPassword) => {
    if (!Utils.isValidPassword(newPassword)) {
      return { success: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }
    const updated = Store.getState().users.map(u =>
      u.id === userId ? { ...u, password: newPassword } : u
    );
    Store.setState({ users: updated });
    Store.persist();
    return { success: true };
  };

  /* ── TIMEOUT AUTOMÁTICO ── */
  let _inactivityTimer = null;

  const resetInactivityTimer = () => {
    clearTimeout(_inactivityTimer);
    _inactivityTimer = setTimeout(() => {
      if (checkSession()) {
        Toast && Toast.show('Sesión expirada por inactividad', 'warning');
        setTimeout(logout, 1500);
      }
    }, SESSION_TIMEOUT);
  };

  const startInactivityWatcher = () => {
    ['mousemove','keydown','click','scroll','touchstart'].forEach(evt => {
      document.addEventListener(evt, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();
  };

  return {
    login,
    logout,
    checkSession,
    requireRole,
    requireAuth,
    requestPasswordReset,
    changePassword,
    startInactivityWatcher
  };
})();
