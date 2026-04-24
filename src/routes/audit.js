import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/rbac.js';
import { listAuditLog } from '../controllers/auditController.js';

const router = Router();
router.use(authenticate, requireRole('finance_admin'));
router.get('/', listAuditLog);
export default router;
