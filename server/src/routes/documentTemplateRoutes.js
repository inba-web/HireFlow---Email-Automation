import { Router } from 'express';
import {
  listDocumentTemplates,
  getDocumentTemplateById,
  createDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate,
  renderTestPdf,
} from '../controllers/documentTemplateController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, listDocumentTemplates);
router.get('/:id', requireAuth, getDocumentTemplateById);
router.post('/', requireAuth, createDocumentTemplate);
router.patch('/:id', requireAuth, updateDocumentTemplate);
router.delete('/:id', requireAuth, requireRole(['Admin', 'HR Manager']), deleteDocumentTemplate);

router.post('/render-test', requireAuth, renderTestPdf);

export default router;
