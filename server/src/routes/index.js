import { Router } from 'express';
import authRoutes from './authRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import emailTemplateRoutes from './emailTemplateRoutes.js';
import documentTemplateRoutes from './documentTemplateRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import documentRoutes from './documentRoutes.js';
import emailLogRoutes from './emailLogRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import { isDBConnected } from '../config/db.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: isDBConnected() ? 'connected' : 'fallback_mode',
  });
});

router.use('/auth', authRoutes);
router.use('/candidates', candidateRoutes);
router.use('/email-templates', emailTemplateRoutes);
router.use('/document-templates', documentTemplateRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/documents', documentRoutes);
router.use('/email-logs', emailLogRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/settings', settingsRoutes);

export default router;
