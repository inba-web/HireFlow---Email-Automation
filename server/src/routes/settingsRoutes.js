import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, getSettings);
router.patch('/', requireAuth, requireRole(['Admin']), updateSettings);

export default router;
