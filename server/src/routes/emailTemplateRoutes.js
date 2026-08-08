import { Router } from 'express';
import {
  listEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  duplicateEmailTemplate,
  deleteEmailTemplate,
  previewEmailTemplate,
  sendTestEmail,
} from '../controllers/emailTemplateController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, listEmailTemplates);
router.get('/:id', requireAuth, getEmailTemplateById);
router.post('/', requireAuth, createEmailTemplate);
router.patch('/:id', requireAuth, updateEmailTemplate);
router.post('/:id/duplicate', requireAuth, duplicateEmailTemplate);
router.delete('/:id', requireAuth, requireRole(['Admin', 'HR Manager']), deleteEmailTemplate);

router.post('/preview', requireAuth, previewEmailTemplate);
router.post('/test-send', requireAuth, sendTestEmail);

export default router;
