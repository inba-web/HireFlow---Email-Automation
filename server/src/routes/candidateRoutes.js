import { Router } from 'express';
import {
  listCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  bulkDeleteCandidates,
  bulkUpdateStatus,
  importCandidatesCsv,
  exportCandidates,
  uploadCsvMiddleware,
} from '../controllers/candidateController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', requireAuth, listCandidates);
router.get('/export', requireAuth, exportCandidates);
router.get('/:id', requireAuth, getCandidateById);
router.post('/', requireAuth, createCandidate);
router.patch('/:id', requireAuth, updateCandidate);
router.delete('/:id', requireAuth, requireRole(['Admin', 'HR Manager']), deleteCandidate);

router.post('/bulk-delete', requireAuth, requireRole(['Admin', 'HR Manager']), bulkDeleteCandidates);
router.post('/bulk-status', requireAuth, bulkUpdateStatus);
router.post('/import', requireAuth, uploadLimiter, uploadCsvMiddleware, importCandidatesCsv);

export default router;
