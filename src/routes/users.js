import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/rbac.js';
import {
  listUsers, getProfile, updateProfile, updatePreferences, adminUpdateUser,
} from '../controllers/userController.js';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('finance_admin'), listUsers);
router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.patch('/me/preferences', updatePreferences);
router.patch('/:id', requireRole('finance_admin'), adminUpdateUser);

export default router;
