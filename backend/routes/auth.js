const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const { sign } = require('../utils/jwt');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, is_admin FROM users WHERE email = $1 AND active = true',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [user.id]
    );

    const passwordHash = passwordResult.rows[0].password_hash;
    const validPassword = await bcrypt.compare(password, passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last_login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const token = sign({
      id: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.is_admin,
      name: user.name
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.is_admin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', auth, (req, res) => {
  // JWT is stateless, logout is client-side only
  return res.json({ ok: true });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    // Always return generic message (do not reveal user existence)
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND active = true',
      [email]
    );

    if (result.rows.length > 0) {
      // Log to audit_log (email sending would happen here)
      await pool.query(
        'INSERT INTO audit_log (user_id, action, entity) VALUES ($1, $2, $3)',
        [result.rows[0].id, 'password_reset_requested', 'user']
      );
    }

    // Always return success regardless
    return res.json({
      message: 'If the email exists in our system, a password reset link will be sent.'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
