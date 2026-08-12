import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';
import { isDBConnected } from '../config/db.js';

export async function recordAudit({
  clerkUserId = 'system',
  userName = 'System User',
  userEmail = 'system@thodar.dev',
  action,
  resourceType,
  resourceId = '',
  details = {},
  ipAddress = '',
  userAgent = '',
}) {
  try {
    // Sanitize any sensitive details before storing
    const sanitizedDetails = { ...details };
    delete sanitizedDetails.password;
    delete sanitizedDetails.token;
    delete sanitizedDetails.apiKey;
    delete sanitizedDetails.smtpPassword;

    if (isDBConnected()) {
      await AuditLog.create({
        clerkUserId,
        userName,
        userEmail,
        action,
        resourceType,
        resourceId: String(resourceId),
        details: sanitizedDetails,
        ipAddress,
        userAgent,
      });
    }

    logger.info(`[AUDIT] Action: ${action} | Resource: ${resourceType}:${resourceId} | User: ${userEmail}`);
  } catch (error) {
    logger.warn(`Failed to record audit log: ${error.message}`);
  }
}
