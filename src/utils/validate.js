export function isNonEmptyString(v, max = 200) {
  return typeof v === 'string' && v.length > 0 && v.length <= max;
}

export function isPositiveNumber(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

export function isIn(v, allowed) {
  return allowed.includes(v);
}

const ALLOWED_CATEGORIES = ['travel', 'meals', 'equipment', 'software', 'conference', 'other'];
const ALLOWED_CURRENCIES = ['EUR', 'USD', 'GBP'];

export function validateExpenseInput(body) {
  const errors = [];
  if (!isIn(body.category, ALLOWED_CATEGORIES)) errors.push('invalid category');
  if (!isPositiveNumber(body.amount)) errors.push('invalid amount');
  if (body.amount > 100000) errors.push('amount exceeds hard cap');
  if (!isIn(body.currency ?? 'EUR', ALLOWED_CURRENCIES)) errors.push('invalid currency');
  if (!isNonEmptyString(body.description, 500)) errors.push('invalid description');
  return errors;
}

export function validateRegisterInput(body) {
  const errors = [];
  if (!isNonEmptyString(body.username, 64) || !/^[a-zA-Z0-9_.-]+$/.test(body.username))
    errors.push('invalid username');
  if (!isNonEmptyString(body.password, 128) || body.password.length < 8)
    errors.push('invalid password');
  if (!isNonEmptyString(body.full_name, 128)) errors.push('invalid full_name');
  if (!isNonEmptyString(body.department, 64)) errors.push('invalid department');
  return errors;
}
