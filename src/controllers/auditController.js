import { all } from '../config/db.js';

export async function listAuditLog(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const rows = await all('SELECT * FROM audit_log ORDER BY id DESC LIMIT ?', [limit]);
    res.json(rows);
  } catch (err) { next(err); }
}
