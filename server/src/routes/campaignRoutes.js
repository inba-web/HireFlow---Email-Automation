import { Router } from 'express';
import {
  listCampaigns,
  getCampaignById,
  createCampaign,
  sendCampaign,
  cancelCampaign,
  retryFailedJobs,
  deleteCampaign,
} from '../controllers/campaignController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { campaignSendLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', requireAuth, listCampaigns);
router.get('/:id', requireAuth, getCampaignById);
router.post('/', requireAuth, createCampaign);
router.post('/:id/send', requireAuth, campaignSendLimiter, sendCampaign);
router.post('/:id/cancel', requireAuth, cancelCampaign);
router.post('/:id/retry', requireAuth, campaignSendLimiter, retryFailedJobs);
router.delete('/:id', requireAuth, requireRole(['Admin', 'HR Manager']), deleteCampaign);

export default router;
