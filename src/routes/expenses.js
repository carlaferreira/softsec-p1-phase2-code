import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/rbac.js';
import {
  createExpense, listExpenses, searchExpenses, getExpense,
  approveExpense, rejectExpense, deleteExpense,
} from '../controllers/expenseController.js';

const router = Router();
router.use(authenticate);

router.get('/', listExpenses);
router.get('/search', searchExpenses);
router.post('/', createExpense);
router.get('/:id', getExpense);
router.post('/:id/approve', requireRole('manager', 'finance_admin'), approveExpense);
router.post('/:id/reject',  requireRole('manager', 'finance_admin'), rejectExpense);
router.delete('/:id',       requireRole('finance_admin'), deleteExpense);

export default router;
