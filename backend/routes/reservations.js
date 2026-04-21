const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// All reservations routes require authentication
router.use(auth);

// POST /api/reservations/recurring-group - Create recurring group (for HU-27)
router.post('/recurring-group', requireRole('secretaria'), async (req, res) => {
  const { pattern, endDate, maxOccurrences } = req.body;

  if (!pattern || !['weekly', 'biweekly', 'monthly'].includes(pattern)) {
    return res.status(400).json({ error: 'Invalid pattern' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO recurring_groups (pattern, end_date, max_occurrences)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [pattern, endDate || null, maxOccurrences || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating recurring group:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reservations - Get all reservations with optional filters
router.get('/', async (req, res) => {
  const { status, dateFrom, dateTo, responsible } = req.query;

  try {
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (dateFrom) {
      query += ` AND start_time >= $${paramCount}`;
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      query += ` AND end_time <= $${paramCount}`;
      params.push(dateTo);
      paramCount++;
    }

    if (responsible) {
      query += ` AND responsible_name ILIKE $${paramCount}`;
      params.push(`%${responsible}%`);
      paramCount++;
    }

    query += ' ORDER BY start_time ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reservations/:id - Get single reservation
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching reservation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reservations - Create new reservation (secretaria only)
router.post('/', requireRole('secretaria'), async (req, res) => {
  const {
    responsible_name,
    area,
    start_time,
    end_time,
    observations,
    is_recurring,
    recurring_group
  } = req.body;

  if (!responsible_name || !area || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check for overlap with active reservations
    const overlapCheck = await pool.query(
      `SELECT id, responsible_name, start_time, end_time
       FROM reservations
       WHERE status = 'active'
       AND start_time < $2
       AND end_time > $1`,
      [start_time, end_time]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(409).json({
        error: 'overlap',
        message: 'Time slot is already booked',
        conflictWith: overlapCheck.rows[0]
      });
    }

    // Create reservation
    const result = await pool.query(
      `INSERT INTO reservations (
        responsible_name, area, start_time, end_time,
        observations, is_recurring, recurring_group, created_by, last_modified_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        responsible_name,
        area,
        start_time,
        end_time,
        observations || null,
        is_recurring || false,
        recurring_group || null,
        req.user.id,
        req.user.id
      ]
    );

    // Log to audit
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'create_reservation', 'reservations', result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/reservations/:id - Update reservation (secretaria only)
router.put('/:id', requireRole('secretaria'), async (req, res) => {
  const { id } = req.params;
  const { responsible_name, area, start_time, end_time, observations } = req.body;

  try {
    // Check if reservation exists
    const existing = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check for overlap (excluding current reservation)
    if (start_time && end_time) {
      const overlapCheck = await pool.query(
        `SELECT id FROM reservations
         WHERE status = 'active' AND id != $1
         AND start_time < $3 AND end_time > $2`,
        [id, start_time, end_time]
      );

      if (overlapCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Time slot is already booked' });
      }
    }

    // Update reservation
    const result = await pool.query(
      `UPDATE reservations
       SET responsible_name = COALESCE($2, responsible_name),
           area = COALESCE($3, area),
           start_time = COALESCE($4, start_time),
           end_time = COALESCE($5, end_time),
           observations = COALESCE($6, observations),
           last_modified_by = $7,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, responsible_name, area, start_time, end_time, observations, req.user.id]
    );

    // Log to audit
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'update_reservation', 'reservations', id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating reservation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/reservations/:id - Cancel single reservation (soft delete)
router.delete('/:id', requireRole('secretaria'), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE reservations SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Log to audit
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'cancel_reservation', 'reservations', id]
    );

    res.status(204).send();
  } catch (err) {
    console.error('Error cancelling reservation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/reservations/bulk - Cancel multiple reservations
router.delete('/bulk', requireRole('secretaria'), async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array required' });
  }

  try {
    const result = await pool.query(
      `UPDATE reservations SET status = 'cancelled', updated_at = NOW()
       WHERE id = ANY($1::uuid[])
       RETURNING id`,
      [ids]
    );

    // Log to audit
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity, details)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'bulk_cancel_reservations', 'reservations', JSON.stringify({ count: result.rows.length })]
    );

    res.json({ deleted: result.rows.length });
  } catch (err) {
    console.error('Error bulk cancelling reservations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
