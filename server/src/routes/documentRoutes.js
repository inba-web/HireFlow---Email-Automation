import { Router } from 'express';
import { listDocuments, downloadDocument } from '../controllers/documentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listDocuments);
router.get('/:id/download', requireAuth, downloadDocument);

export default router;
