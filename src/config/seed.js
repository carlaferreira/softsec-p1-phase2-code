import bcrypt from 'bcryptjs';
import { initSchema, run, exec } from './db.js';

await initSchema();
await exec(`DELETE FROM audit_log; DELETE FROM expenses; DELETE FROM users;
            DELETE FROM sqlite_sequence WHERE name IN ('users','expenses','audit_log');`);

const users = [
  ['admin_alice',   'alice123',   'Alice Admin',    'finance_admin', 'finance'],
  ['mgr_bruno',     'bruno123',   'Bruno Manager',  'manager',       'engineering'],
  ['mgr_clara',     'clara123',   'Clara Manager',  'manager',       'sales'],
  ['emp_diego',     'diego123',   'Diego Employee', 'employee',      'engineering'],
  ['emp_elena',     'elena123',   'Elena Employee', 'employee',      'engineering'],
  ['emp_felipe',    'felipe123',  'Felipe Employee','employee',      'sales'],
];

for (const [u, p, name, role, dept] of users) {
  await run(
    `INSERT INTO users (username, password_hash, full_name, role, department)
     VALUES (?, ?, ?, ?, ?)`,
    [u, bcrypt.hashSync(p, 10), name, role, dept]
  );
}

const expenses = [
  [4, 'engineering', 'travel',      120.50, 'EUR', 'Taxi to client site',            'approved',  2],
  [4, 'engineering', 'equipment',   340.00, 'EUR', 'USB-C docking station',          'pending',   null],
  [5, 'engineering', 'conference',  890.00, 'EUR', 'PyCon registration',             'pending',   null],
  [6, 'sales',       'meals',        65.30, 'EUR', 'Client dinner',                  'approved',  3],
  [6, 'sales',       'travel',     1450.00, 'EUR', 'Flight Lisbon-Berlin (Q2 fair)', 'pending',   null],
  [2, 'engineering', 'software',    299.00, 'EUR', 'JetBrains license renewal',      'approved',  1],
];

for (const e of expenses) {
  await run(
    `INSERT INTO expenses (submitter_id, department, category, amount, currency, description, status, approved_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    e
  );
}

console.log('Seeded users and expenses.');
process.exit(0);
