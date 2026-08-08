import { Router } from 'express';
import { listEmailLogs, getEmailLogById } from '../controllers/emailLogController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listEmailLogs);
router.get('/:id', requireAuth, getEmailLogById);

export default router;
