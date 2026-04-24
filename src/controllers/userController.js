import { all, get, run } from '../config/db.js';
import { audit } from '../utils/audit.js';
import { isNonEmptyString } from '../utils/validate.js';

export async function listUsers(req, res, next) {
  try {
    const rows = await all(
      'SELECT id, username, full_name, role, department, password_hash, created_at FROM users ORDER BY id'
    );
    res.json(rows);
  } catch (err) { next(err); }
}

export async function getProfile(req, res, next) {
  try {
    const row = await get(
      'SELECT id, username, full_name, role, department, preferences, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!row) return res.status(404).json({ error: 'Not found' });
    row.preferences = JSON.parse(row.preferences || '{}');
    res.json(row);
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const { full_name } = req.body ?? {};
    if (!isNonEmptyString(full_name, 128)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    // Only full_name is mutable here. Role and department changes are admin-only
    // and handled via PATCH /api/users/:id.
    await run('UPDATE users SET full_name = ? WHERE id = ?', [full_name, req.user.id]);
    audit(req, 'update_profile', 'success');
    res.json({ ok: true });
  } catch (err) { next(err); }
}

/**
 * Merge a nested partial object into target. Used for user preferences so a
 * client can update `{ notifications: { email: true } }` without clobbering
 * sibling keys like `notifications.slack`.
 */
function deepMerge(target, source) {
  for (const key in source) {
    const val = source[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      if (typeof target[key] !== 'object' || target[key] === null) target[key] = {};
      deepMerge(target[key], val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

export async function updatePreferences(req, res, next) {
  try {
    const patch = req.body?.preferences;
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
      return res.status(400).json({ error: 'Invalid preferences payload' });
    }

    const row = await get('SELECT preferences FROM users WHERE id = ?', [req.user.id]);
    const current = JSON.parse(row.preferences || '{}');
    const merged = deepMerge(current, patch);

    await run(
      'UPDATE users SET preferences = ? WHERE id = ?',
      [JSON.stringify(merged), req.user.id]
    );

    audit(req, 'update_preferences', 'success');
    res.json({ ok: true, preferences: merged });
  } catch (err) { next(err); }
}

export async function adminUpdateUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const { role, department } = req.body ?? {};
    const updates = [];
    const values = [];

    if (role !== undefined) {
      if (!['employee', 'manager', 'finance_admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.push('role = ?');
      values.push(role);
    }
    if (department !== undefined) {
      if (!isNonEmptyString(department, 64)) {
        return res.status(400).json({ error: 'Invalid department' });
      }
      updates.push('department = ?');
      values.push(department);
    }

    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
    values.push(id);

    const info = await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    if (info.changes === 0) return res.status(404).json({ error: 'User not found' });

    audit(req, 'admin_update_user', 'success', { target_id: id, role, department });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
