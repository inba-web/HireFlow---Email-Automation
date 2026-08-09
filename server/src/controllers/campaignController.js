import { Campaign } from '../models/Campaign.js';
import { Candidate } from '../models/Candidate.js';
import { EmailTemplate } from '../models/EmailTemplate.js';
import { DocumentTemplate } from '../models/DocumentTemplate.js';
import { queueCampaignJobs } from '../services/queueService.js';
import { recordAudit } from '../services/auditService.js';
import { isDBConnected } from '../config/db.js';
import { mockStore } from '../utils/mockStore.js';

export async function listCampaigns(req, res, next) {
  try {
    const { status, search } = req.query;
    if (!isDBConnected()) {
      let campaigns = [...mockStore.campaigns];
      if (status && status !== 'all') campaigns = campaigns.filter(c => c.status === status);
      if (search) campaigns = campaigns.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
      return res.json({ success: true, data: campaigns });
    }

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const campaigns = await Campaign.find(query)
      .populate('emailTemplateId', 'name category subject')
      .populate('documentTemplateId', 'name type')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
}

export async function getCampaignById(req, res, next) {
  try {
    const { id } = req.params;
    if (!isDBConnected()) {
      const campaign = mockStore.campaigns.find(c => c._id === id);
      if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
      return res.json({ success: true, data: campaign });
    }

    const campaign = await Campaign.findById(id)
      .populate('emailTemplateId')
      .populate('documentTemplateId')
      .populate('recipientCandidateIds');

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req, res, next) {
  try {
    const {
      name,
      description,
      recipientCandidateIds,
      emailTemplateId,
      documentTemplateId,
      scheduledAt,
    } = req.body;

    if (!name || !recipientCandidateIds || recipientCandidateIds.length === 0 || !emailTemplateId) {
      return res.status(400).json({
        success: false,
        message: 'Campaign Name, at least one Candidate recipient, and an Email Template are required.',
      });
    }

    const initialStatus = scheduledAt ? 'Scheduled' : 'Draft';

    if (isDBConnected()) {
      const campaign = await Campaign.create({
        name: name.trim(),
        description: description?.trim() || '',
        recipientCandidateIds,
        emailTemplateId,
        documentTemplateId: documentTemplateId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: initialStatus,
        stats: {
          totalRecipients: recipientCandidateIds.length,
          sent: 0,
          delivered: 0,
          failed: 0,
          retrying: 0,
        },
        createdBy: req.user?.name || 'HR Team',
      });

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'CAMPAIGN_CREATED',
        resourceType: 'Campaign',
        resourceId: campaign._id,
        details: { name: campaign.name, recipientCount: recipientCandidateIds.length },
      });

      return res.status(201).json({ success: true, data: campaign });
    }

    const emailTemplate = mockStore.emailTemplates.find(t => t._id === emailTemplateId) || { name: 'Offer Letter' };
    const docTemplate = mockStore.documentTemplates.find(d => d._id === documentTemplateId) || null;

    const newCampaign = {
      _id: `camp_${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || '',
      recipientCandidateIds,
      emailTemplateId: emailTemplate,
      documentTemplateId: docTemplate,
      status: initialStatus,
      stats: {
        totalRecipients: recipientCandidateIds.length,
        sent: 0,
        delivered: 0,
        failed: 0,
        retrying: 0,
      },
      createdAt: new Date(),
    };

    mockStore.campaigns.unshift(newCampaign);
    return res.status(201).json({ success: true, data: newCampaign });
  } catch (err) {
    next(err);
  }
}

export async function sendCampaign(req, res, next) {
  try {
    const { id } = req.params;
    if (!isDBConnected()) {
      const camp = mockStore.campaigns.find(c => c._id === id);
      if (!camp) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      camp.status = 'Processing';
      await queueCampaignJobs(camp);

      return res.json({
        success: true,
        message: `Campaign "${camp.name}" queued for async processing (${camp.recipientCandidateIds?.length || 1} recipients).`,
        data: camp,
      });
    }

    const campaign = await Campaign.findById(id).populate('recipientCandidateIds');
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status === 'Processing') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is already being processed.',
      });
    }

    await queueCampaignJobs(campaign);

    return res.json({
      success: true,
      message: `Campaign "${campaign.name}" queued for async processing (${campaign.recipientCandidateIds.length} recipients).`,
      data: campaign,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelCampaign(req, res, next) {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      const campaign = await Campaign.findById(id);
      if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
      campaign.status = 'Cancelled';
      await campaign.save();
      return res.json({ success: true, message: 'Campaign cancelled successfully', data: campaign });
    }

    const camp = mockStore.campaigns.find(c => c._id === id);
    if (camp) camp.status = 'Cancelled';
    return res.json({ success: true, message: 'Campaign cancelled' });
  } catch (err) {
    next(err);
  }
}

export async function retryFailedJobs(req, res, next) {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      const campaign = await Campaign.findById(id);
      if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
      await queueCampaignJobs(campaign);
      return res.json({ success: true, message: 'Retrying campaign dispatch for all eligible jobs' });
    }
    return res.json({ success: true, message: 'Retry initiated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteCampaign(req, res, next) {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      await Campaign.findByIdAndDelete(id);
    } else {
      mockStore.campaigns = mockStore.campaigns.filter(c => c._id !== id);
    }
    return res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (err) {
    next(err);
  }
}
