/* ============================================================
   USERS.JS — Gestión de usuarios
   HU-21 (CRUD usuarios, desactivación, último acceso)
   Plataforma Reservación Sala de Juntas · Ibero CDMX
   ============================================================ */

const Users = (() => {

  /* ── READ ─────────────────────────────────────────────── */

  function getAll() {
    return [...Store.getState().users];
  }

  function getById(id) {
    return Store.getState().users.find(u => u.id === id) ?? null;
  }

  function getByEmail(email) {
    const q = email.toLowerCase().trim();
    return Store.getState().users.find(u => u.email.toLowerCase() === q) ?? null;
  }

  /* ── CREATE ───────────────────────────────────────────── */

  /**
   * create({ name, email, role, password })
   * Returns { success, user } or { success: false, error }
   */
  function create({ name, email, role, password }) {
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return { success: false, error: 'missing_fields' };
    }
    if (!Utils.isValidEmail(email)) {
      return { success: false, error: 'invalid_email' };
    }
    if (!Utils.isValidPassword(password)) {
      return { success: false, error: 'weak_password' };
    }
    if (getByEmail(email)) {
      return { success: false, error: 'email_taken' };
    }

    const newUser = {
      id:        Utils.uid(),
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      role:      role === 'secretaria' ? 'secretaria' : 'academico',
      password,                // stored plain in prototype; hash in prod
      isAdmin:   false,
      active:    true,
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };

    const { users } = Store.getState();
    Store.setState({ users: [...users, newUser] });
    Store.persist();

    return { success: true, user: newUser };
  }

  /* ── UPDATE ───────────────────────────────────────────── */

  /**
   * update(id, { name?, email?, role?, password? })
   * Returns { success } or { success: false, error }
   */
  function update(id, updates) {
    const users = Store.getState().users;
    const idx   = users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false, error: 'not_found' };

    const current = users[idx];

    // Email uniqueness check (excluding self)
    if (updates.email) {
      const emailLower = updates.email.trim().toLowerCase();
      const duplicate  = users.find(u => u.id !== id && u.email.toLowerCase() === emailLower);
      if (duplicate) return { success: false, error: 'email_taken' };
      if (!Utils.isValidEmail(updates.email)) return { success: false, error: 'invalid_email' };
    }

    if (updates.password && !Utils.isValidPassword(updates.password)) {
      return { success: false, error: 'weak_password' };
    }

    const updated = {
      ...current,
      ...(updates.name     ? { name:  updates.name.trim() }                        : {}),
      ...(updates.email    ? { email: updates.email.trim().toLowerCase() }         : {}),
      ...(updates.role     ? { role:  updates.role === 'secretaria' ? 'secretaria' : 'academico' } : {}),
      ...(updates.password ? { password: updates.password }                        : {}),
      updatedAt: new Date().toISOString(),
    };

    const newUsers  = [...users];
    newUsers[idx]   = updated;
    Store.setState({ users: newUsers });
    Store.persist();

    return { success: true };
  }

  /* ── ACTIVATE / DEACTIVATE ────────────────────────────── */

  function deactivate(id) {
    const user = getById(id);
    if (!user) return false;
    // Cannot deactivate self
    if (Store.getUser()?.id === id) return false;
    return _setActive(id, false);
  }

  function activate(id) {
    return _setActive(id, true);
  }

  function _setActive(id, active) {
    const users = Store.getState().users;
    const idx   = users.findIndex(u => u.id === id);
    if (idx === -1) return false;

    const newUsers = [...users];
    newUsers[idx]  = { ...newUsers[idx], active, updatedAt: new Date().toISOString() };
    Store.setState({ users: newUsers });
    Store.persist();
    return true;
  }

  /* ── VALIDATION HELPERS ─────────────────────────────────── */

  const ERROR_MSGS = {
    missing_fields: 'Todos los campos requeridos deben completarse.',
    invalid_email:  'El correo electrónico no tiene un formato válido.',
    weak_password:  'La contraseña debe tener al menos 8 caracteres.',
    email_taken:    'Ya existe un usuario con ese correo electrónico.',
    not_found:      'Usuario no encontrado.',
  };

  function errorMessage(code) {
    return ERROR_MSGS[code] ?? 'Error desconocido.';
  }

  return { getAll, getById, getByEmail, create, update, deactivate, activate, errorMessage };
})();
