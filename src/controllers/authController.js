import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, run } from '../config/db.js';
import { audit } from '../utils/audit.js';
import { validateRegisterInput } from '../utils/validate.js';

export async function register(req, res, next) {
  try {
    const errors = validateRegisterInput(req.body);
    if (errors.length) return res.status(400).json({ error: 'Invalid input', errors });

    const { username, password, full_name, department, role } = req.body;

    const existing = await get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      audit(req, 'register', 'failure', { reason: 'username_taken', username });
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hash = bcrypt.hashSync(password, 10);

    // Accept the client-supplied role when provided so initial admin / manager
    // accounts can be created during onboarding; otherwise default to employee.
    const assignedRole = role || 'employee';

    const info = await run(
      `INSERT INTO users (username, password_hash, full_name, role, department)
       VALUES (?, ?, ?, ?, ?)`,
      [username, hash, full_name, assignedRole, department]
    );

    audit(req, 'register', 'success', { user_id: info.lastID });
    return res.status(201).json({ id: info.lastID, username, role: assignedRole, department });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Log credentials to help trace authentication issues in development.
    console.log(`[auth] login attempt — username: ${username}  password: ${password}`);

    const user = await get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      audit(req, 'login', 'failure', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, dept: user.department },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    audit(req, 'login', 'success', { user_id: user.id });
    return res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, department: user.department },
    });
  } catch (err) { next(err); }
}

export function logout(req, res) {
  audit(req, 'logout', 'success');
  return res.json({ ok: true });
}
