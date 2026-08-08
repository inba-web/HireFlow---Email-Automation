import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { EmailLog } from '../models/EmailLog.js';
import { isDBConnected } from '../config/db.js';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (config.SMTP.USER && config.SMTP.PASSWORD) {
    const isGmail = config.SMTP.HOST.includes('gmail') || config.SMTP.USER.includes('gmail.com');
    transporter = nodemailer.createTransport({
      ...(isGmail ? { service: 'gmail' } : { host: config.SMTP.HOST, port: config.SMTP.PORT, secure: config.SMTP.SECURE }),
      auth: {
        user: config.SMTP.USER,
        pass: config.SMTP.PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    logger.info(`Initialized SMTP Transporter with ${isGmail ? 'Gmail Service' : config.SMTP.HOST} for ${config.SMTP.USER}`);
  } else {
    // Generate test ethereal account for seamless development
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`Initialized Ethereal Test Email Transporter (User: ${testAccount.user})`);
    } catch (err) {
      logger.warn(`Could not create Ethereal account: ${err.message}. Using dummy mailer.`);
      transporter = {
        sendMail: async (options) => ({
          messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          response: '250 Mock Email Delivered',
        }),
      };
    }
  }

  return transporter;
}

/**
 * Sanitizes header fields to prevent SMTP header injection.
 */
function sanitizeHeader(val = '') {
  return String(val).replace(/[\r\n]/g, ' ').trim();
}

/**
 * Sends a personalized email with optional attachments and updates logs.
 */
export async function sendEmail({
  candidate,
  campaign = null,
  subject,
  htmlContent,
  attachments = [],
}) {
  const sanitizedSubject = sanitizeHeader(subject);
  const sanitizedRecipient = sanitizeHeader(candidate.email);

  if (!sanitizedRecipient || !sanitizedRecipient.includes('@')) {
    throw new Error(`Invalid recipient email address: ${sanitizedRecipient}`);
  }

  const mailOptions = {
    from: config.SMTP.FROM,
    to: `"${sanitizeHeader(candidate.fullName)}" <${sanitizedRecipient}>`,
    subject: sanitizedSubject,
    html: htmlContent,
    attachments: attachments.map(att => ({
      filename: att.fileName || att.filename,
      path: att.filePath || att.path,
      content: att.content,
      contentType: att.fileType || att.contentType || 'application/pdf',
    })),
  };

  const mailer = await getTransporter();

  try {
    const info = await mailer.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`[ETHEREAL PREVIEW URL]: ${previewUrl}`);
    }

    let logRecord = null;
    if (isDBConnected()) {
      logRecord = await EmailLog.create({
        candidateId: candidate._id,
        candidateName: candidate.fullName,
        campaignId: campaign?._id || null,
        campaignName: campaign?.name || 'Direct / Test',
        recipient: sanitizedRecipient,
        subject: sanitizedSubject,
        status: 'Sent',
        providerMessageId: info.messageId || `msg_${Date.now()}`,
        attemptCount: 1,
        sentAt: new Date(),
        deliveredAt: new Date(),
        attachments: attachments.map(a => ({ fileName: a.fileName || 'document.pdf', fileType: 'application/pdf' })),
      });
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      log: logRecord,
    };
  } catch (error) {
    logger.error(`Failed to send email to ${sanitizedRecipient}: ${error.message}`);

    if (isDBConnected()) {
      await EmailLog.create({
        candidateId: candidate._id,
        candidateName: candidate.fullName,
        campaignId: campaign?._id || null,
        campaignName: campaign?.name || 'Direct / Test',
        recipient: sanitizedRecipient,
        subject: sanitizedSubject,
        status: 'Failed',
        attemptCount: 1,
        failedAt: new Date(),
        errorCode: error.code || 'SMTP_ERROR',
        errorMessage: error.message,
      });
    }

    throw error;
  }
}
