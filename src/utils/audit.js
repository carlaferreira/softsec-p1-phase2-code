import { run } from '../config/db.js';

export function audit(req, action, outcome, details = null) {
  run(
    `INSERT INTO audit_log (user_id, action, outcome, details, ip)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user?.id ?? null, action, outcome, details ? JSON.stringify(details) : null, req.ip ?? null]
  ).catch((e) => console.error('[audit] failed to write log entry', e));
}
