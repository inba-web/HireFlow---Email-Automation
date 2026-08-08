import { SystemSettings } from '../models/SystemSettings.js';
import { recordAudit } from '../services/auditService.js';
import { isDBConnected } from '../config/db.js';
import { config } from '../config/env.js';

export async function getSettings(req, res, next) {
  try {
    let settings = null;
    if (isDBConnected()) {
      settings = await SystemSettings.findOne().lean();
    }

    if (!settings) {
      settings = {
        companyName: 'HireFlow Technologies Inc.',
        companyEmail: 'talent@hireflow.dev',
        companyAddress: '500 Howard Street, Suite 300, San Francisco, CA 94105',
        companyWebsite: 'https://hireflow.dev',
        hrName: 'Sarah Jenkins (Director of Talent Acquisition)',
        hrContact: '+1 (415) 890-1234',
        defaultSmtpFrom: '"HireFlow Talent" <talent@hireflow.dev>',
        rateLimitPerMinute: 60,
      };
    }

    return res.json({
      success: true,
      data: {
        ...settings,
        smtpConfigured: Boolean(config.SMTP.USER && config.SMTP.PASSWORD),
        smtpHost: config.SMTP.HOST,
        smtpPort: config.SMTP.PORT,
        clerkConfigured: Boolean(config.CLERK_SECRET_KEY),
        dbConnected: isDBConnected(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const {
      companyName,
      companyEmail,
      companyAddress,
      companyWebsite,
      hrName,
      hrContact,
      defaultSmtpFrom,
      rateLimitPerMinute,
    } = req.body;

    if (isDBConnected()) {
      const settings = await SystemSettings.findOneAndUpdate(
        {},
        {
          $set: {
            companyName,
            companyEmail,
            companyAddress,
            companyWebsite,
            hrName,
            hrContact,
            defaultSmtpFrom,
            rateLimitPerMinute,
          }
        },
        { new: true, upsert: true }
      );

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'SETTINGS_UPDATED',
        resourceType: 'SystemSettings',
        resourceId: settings._id,
      });

      return res.json({ success: true, data: settings });
    }

    return res.json({ success: true, data: req.body });
  } catch (err) {
    next(err);
  }
}
