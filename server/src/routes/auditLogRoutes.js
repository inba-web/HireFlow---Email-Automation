import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditLogController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, requireRole(['Admin', 'HR Manager']), listAuditLogs);

export default router;
