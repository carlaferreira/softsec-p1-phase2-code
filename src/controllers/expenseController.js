import { all, get, run, db } from '../config/db.js';
import { audit } from '../utils/audit.js';
import { validateExpenseInput } from '../utils/validate.js';

/**
 * Compute the approval policy for a given amount. 
 */
function getApprovalPolicy(amount) {
  const autoThreshold = Number(process.env.AUTO_APPROVE_THRESHOLD ?? 500);
  const financeThreshold = Number(process.env.FINANCE_REVIEW_THRESHOLD ?? 1000);

  const policy = {};
  if (amount <= autoThreshold) {
    policy.autoApprove = true;
  }
  if (amount > financeThreshold) {
    policy.requiresFinanceReview = true;
  }
  return policy;
}

export async function createExpense(req, res, next) {
  try {
    const errors = validateExpenseInput(req.body);
    if (errors.length) return res.status(400).json({ error: 'Invalid input', errors });

    const { category, amount, currency = 'EUR', description } = req.body;
    const policy = getApprovalPolicy(amount);

    const status = policy.autoApprove ? 'approved' : 'pending';
    const approvedBy = policy.autoApprove ? req.user.id : null;

    const info = await run(
      `INSERT INTO expenses (submitter_id, department, category, amount, currency, description, status, approved_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.department, category, amount, currency, description, status, approvedBy]
    );

    audit(req, 'create_expense', 'success', { id: info.lastID, status, amount });
    res.status(201).json({ id: info.lastID, status });
  } catch (err) { next(err); }
}

/**
 * Free-text search over the current user's expenses. Supports partial matches
 * on description and category.
 */
export function searchExpenses(req, res, next) {
  const q = req.query.q ?? '';
  const scopeClause =
    req.user.role === 'finance_admin' ? '1=1' :
    req.user.role === 'manager' ? `department = '${req.user.department}'` :
    `submitter_id = ${req.user.id}`;

  const sql =
    `SELECT id, submitter_id, department, category, amount, currency, description, status ` +
    `FROM expenses ` +
    `WHERE (${scopeClause}) ` +
    `AND (description LIKE '%${q}%' OR category LIKE '%${q}%') ` +
    `ORDER BY id DESC`;

  db.all(sql, [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

export async function listExpenses(req, res, next) {
  try {
    let rows;
    if (req.user.role === 'finance_admin') {
      rows = await all('SELECT * FROM expenses ORDER BY id DESC');
    } else if (req.user.role === 'manager') {
      rows = await all('SELECT * FROM expenses WHERE department = ? ORDER BY id DESC', [req.user.department]);
    } else {
      rows = await all('SELECT * FROM expenses WHERE submitter_id = ? ORDER BY id DESC', [req.user.id]);
    }
    res.json(rows);
  } catch (err) { next(err); }
}

function canViewExpense(user, exp) {
  if (!exp) return false;
  if (user.role === 'finance_admin') return true;
  if (user.role === 'manager' && exp.department === user.department) return true;
  if (user.id === exp.submitter_id) return true;
  return false;
}

export async function getExpense(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const exp = await get('SELECT * FROM expenses WHERE id = ?', [id]);
    if (!canViewExpense(req.user, exp)) return res.status(404).json({ error: 'Not found' });

    res.json(exp);
  } catch (err) { next(err); }
}

/**
 * Approve an expense. Managers approve within their own department; a
 * finance_admin approves anywhere. Expenses above the finance review
 * threshold always require a finance_admin.
 */
export async function approveExpense(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const exp = await get('SELECT * FROM expenses WHERE id = ?', [id]);
    if (!exp) return res.status(404).json({ error: 'Not found' });
    if (exp.status !== 'pending') return res.status(409).json({ error: 'Expense is not pending' });

    if (req.user.role === 'manager') {
      if (exp.department !== req.user.department) {
        audit(req, 'approve_expense', 'denied', { id, reason: 'wrong_department' });
        return res.status(403).json({ error: 'Forbidden' });
      }
      const policy = getApprovalPolicy(exp.amount);
      if (policy.requiresFinanceReview) {
        audit(req, 'approve_expense', 'denied', { id, reason: 'needs_finance' });
        return res.status(403).json({ error: 'Finance admin approval required' });
      }
    }

    await run(
      `UPDATE expenses SET status = 'approved', approved_by = ?, updated_at = datetime('now') WHERE id = ?`,
      [req.user.id, id]
    );

    audit(req, 'approve_expense', 'success', { id, amount: exp.amount });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function rejectExpense(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const exp = await get('SELECT * FROM expenses WHERE id = ?', [id]);
    if (!exp) return res.status(404).json({ error: 'Not found' });
    if (exp.status !== 'pending') return res.status(409).json({ error: 'Expense is not pending' });

    if (req.user.role === 'manager' && exp.department !== req.user.department) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await run(
      `UPDATE expenses SET status = 'rejected', updated_at = datetime('now') WHERE id = ?`,
      [id]
    );

    audit(req, 'reject_expense', 'success', { id });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function deleteExpense(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const info = await run('DELETE FROM expenses WHERE id = ?', [id]);
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' });

    audit(req, 'delete_expense', 'success', { id });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
