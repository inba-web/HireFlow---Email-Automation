import { Router } from 'express';
import { getMe, syncUser, listUsers, updateUserRole } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.post('/sync', requireAuth, syncUser);
router.get('/users', requireAuth, requireRole(['Admin']), listUsers);
router.patch('/users/:userId/role', requireAuth, requireRole(['Admin']), updateUserRole);

export default router;
