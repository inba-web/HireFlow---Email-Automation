import { Queue, Worker } from 'bullmq';
import { getRedisClient, checkRedisAvailable } from '../config/redis.js';
import { Campaign } from '../models/Campaign.js';
import { Candidate } from '../models/Candidate.js';
import { EmailTemplate } from '../models/EmailTemplate.js';
import { DocumentTemplate } from '../models/DocumentTemplate.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { EmailJob } from '../models/EmailJob.js';
import { generateDocumentPdf } from './documentService.js';
import { sendEmail } from './emailService.js';
import { interpolateTemplate, sanitizeEmailHtml, buildTemplateContext } from './templateEngine.js';
import { recordAudit } from './auditService.js';
import { logger } from '../utils/logger.js';
import { isDBConnected } from '../config/db.js';

const QUEUE_NAME = 'recruitment-email-queue';

let bullQueue = null;
let bullWorker = null;

// In-process memory fallback queue
const inMemoryQueue = [];
let isProcessingMemoryQueue = false;

/**
 * Processes a single email job idempotently.
 */
export async function processEmailJob({ campaignId, candidateId, idempotencyKey }) {
  if (!isDBConnected()) {
    logger.info(`Processing email dispatch in development mode for candidate ${candidateId}`);
    return { success: true, simulated: true };
  }

  // 1. Idempotency verification
  let jobRecord = await EmailJob.findOne({ idempotencyKey });
  if (jobRecord && (jobRecord.status === 'Sent' || jobRecord.status === 'Delivered')) {
    logger.info(`Idempotency check: Job ${idempotencyKey} already completed. Skipping.`);
    return { skipped: true, reason: 'Already processed' };
  }

  if (!jobRecord) {
    jobRecord = await EmailJob.create({
      campaignId,
      candidateId,
      idempotencyKey,
      status: 'Processing',
      attemptCount: 1,
    });
  } else {
    jobRecord.status = 'Processing';
    jobRecord.attemptCount += 1;
    await jobRecord.save();
  }

  try {
    const [campaign, candidate, settings] = await Promise.all([
      Campaign.findById(campaignId).populate('emailTemplateId').populate('documentTemplateId'),
      Candidate.findById(candidateId),
      SystemSettings.findOne() || {},
    ]);

    if (!campaign || !candidate) {
      throw new Error(`Campaign (${campaignId}) or Candidate (${candidateId}) not found`);
    }

    const emailTemplate = campaign.emailTemplateId;
    const documentTemplate = campaign.documentTemplateId;

    if (!emailTemplate) {
      throw new Error(`Email template missing for campaign: ${campaign.name}`);
    }

    // 2. Build context
    const context = buildTemplateContext(candidate, settings);

    // 3. Generate personalized document if attached
    const attachments = [];
    if (documentTemplate) {
      const generated = await generateDocumentPdf({
        candidate,
        documentTemplate,
        context,
        campaignId: campaign._id,
      });
      attachments.push({
        fileName: generated.fileName,
        filePath: generated.filePath,
        fileType: 'application/pdf',
      });
    }

    // 4. Personalize Subject & HTML
    const personalizedSubject = interpolateTemplate(emailTemplate.subject, context);
    const rawBody = interpolateTemplate(emailTemplate.bodyHtml, context);
    const sanitizedBody = sanitizeEmailHtml(rawBody);

    // 5. Send Email via configured provider (Gmail SMTP)
    await sendEmail({
      candidate,
      campaign,
      subject: personalizedSubject,
      htmlContent: sanitizedBody,
      attachments,
    });

    // 6. Update job status
    jobRecord.status = 'Sent';
    jobRecord.processedAt = new Date();
    await jobRecord.save();

    // 7. Update Campaign stats
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { 'stats.sent': 1, 'stats.delivered': 1 },
    });

    // 8. Update candidate status
    if (emailTemplate.category === 'Offer' && candidate.status !== 'Offer Sent') {
      candidate.status = 'Offer Sent';
      await candidate.save();
    } else if (emailTemplate.category === 'Interview' && candidate.status === 'Applied') {
      candidate.status = 'Interview';
      await candidate.save();
    }

    return { success: true };
  } catch (error) {
    logger.error(`Error processing job ${idempotencyKey}: ${error.message}`);
    if (jobRecord) {
      jobRecord.status = 'Failed';
      jobRecord.lastError = error.message;
      await jobRecord.save();
    }

    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { 'stats.failed': 1 },
    });

    throw error;
  }
}

/**
 * Memory queue runner for zero-dependency local async execution.
 */
async function processNextInMemoryJob() {
  if (isProcessingMemoryQueue || inMemoryQueue.length === 0) return;
  isProcessingMemoryQueue = true;

  while (inMemoryQueue.length > 0) {
    const jobData = inMemoryQueue.shift();
    try {
      await processEmailJob(jobData);
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      logger.warn(`In-memory async job processed: ${err.message}`);
    }
  }

  isProcessingMemoryQueue = false;
}

/**
 * Enqueue candidate jobs for a campaign.
 */
export async function queueCampaignJobs(campaign) {
  const isRedis = checkRedisAvailable();
  const candidateIds = campaign.recipientCandidateIds || [];
  logger.info(`Enqueuing ${candidateIds.length} candidate jobs for Campaign: ${campaign.name}`);

  if (isDBConnected()) {
    campaign.status = 'Processing';
    campaign.stats.totalRecipients = candidateIds.length;
    await campaign.save();
  }

  for (const candidateId of candidateIds) {
    const candidateIdStr = candidateId._id ? candidateId._id.toString() : candidateId.toString();
    const idempotencyKey = `camp_${campaign._id}_cand_${candidateIdStr}`;

    const jobPayload = {
      campaignId: campaign._id.toString(),
      candidateId: candidateIdStr,
      idempotencyKey,
    };

    if (isRedis && bullQueue) {
      await bullQueue.add('send-email', jobPayload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      });
    } else {
      inMemoryQueue.push(jobPayload);
    }
  }

  if (!isRedis || !bullQueue) {
    setTimeout(processNextInMemoryJob, 50);
  }

  await recordAudit({
    action: 'CAMPAIGN_QUEUED',
    resourceType: 'Campaign',
    resourceId: campaign._id,
    details: { campaignName: campaign.name, recipientCount: candidateIds.length },
  });
}

/**
 * Initialize BullMQ if Redis is active.
 */
export function initQueueWorker() {
  const redis = getRedisClient();
  if (!redis) return;

  redis.on('ready', () => {
    try {
      if (!bullQueue) {
        bullQueue = new Queue(QUEUE_NAME, { connection: redis });
        bullWorker = new Worker(
          QUEUE_NAME,
          async (job) => {
            return await processEmailJob(job.data);
          },
          { connection: redis, concurrency: 5 }
        );

        bullWorker.on('completed', (job) => {
          logger.info(`BullMQ job ${job.id} completed`);
        });

        bullWorker.on('failed', (job, err) => {
          logger.error(`BullMQ job ${job?.id} failed: ${err.message}`);
        });

        logger.info('BullMQ worker initialized with concurrency limit 5');
      }
    } catch (err) {
      logger.warn(`BullMQ initialization deferred: ${err.message}`);
    }
  });
}
