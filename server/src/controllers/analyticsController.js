import { Candidate } from '../models/Candidate.js';
import { Campaign } from '../models/Campaign.js';
import { EmailLog } from '../models/EmailLog.js';
import { Document } from '../models/Document.js';
import { isDBConnected } from '../config/db.js';
import { mockStore } from '../utils/mockStore.js';

export async function getDashboardAnalytics(req, res, next) {
  try {
    if (!isDBConnected()) {
      const candidates = mockStore.candidates;
      const totalCandidates = candidates.length;
      const selectedCandidates = candidates.filter(c => ['Selected', 'Offer Sent', 'Offer Accepted', 'Joined'].includes(c.status)).length;
      const campaigns = mockStore.campaigns;
      const logs = mockStore.emailLogs;

      const sent = logs.length;
      const delivered = logs.filter(l => ['Sent', 'Delivered'].includes(l.status)).length;
      const failed = logs.filter(l => l.status === 'Failed').length;

      const statusCountsMap = {};
      candidates.forEach(c => {
        statusCountsMap[c.status] = (statusCountsMap[c.status] || 0) + 1;
      });

      return res.json({
        success: true,
        data: {
          metrics: {
            totalCandidates,
            selectedCandidates,
            emailsSent: sent > 0 ? sent : 8,
            emailsDelivered: delivered > 0 ? delivered : 8,
            emailsFailed: failed,
            scheduledEmails: campaigns.filter(c => c.status === 'Scheduled').length,
            activeCampaigns: campaigns.length,
            documentsGenerated: mockStore.documents.length,
            deliveryRate: 100,
          },
          statusDistribution: Object.entries(statusCountsMap).map(([status, count]) => ({ status, count })),
          recentCampaigns: campaigns.slice(0, 5),
          recentLogs: logs.slice(0, 6),
        },
      });
    }

    const [
      totalCandidates,
      selectedCandidates,
      statusCounts,
      campaignStats,
      activeCampaigns,
      recentCampaigns,
      emailLogsCount,
      deliveredCount,
      failedCount,
      scheduledCount,
      documentsCount,
      recentLogs,
    ] = await Promise.all([
      Candidate.countDocuments(),
      Candidate.countDocuments({ status: { $in: ['Selected', 'Offer Sent', 'Offer Accepted', 'Joined'] } }),
      Candidate.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Campaign.aggregate([
        {
          $group: {
            _id: null,
            totalSent: { $sum: '$stats.sent' },
            totalDelivered: { $sum: '$stats.delivered' },
            totalFailed: { $sum: '$stats.failed' },
          }
        }
      ]),
      Campaign.countDocuments({ status: { $in: ['Queued', 'Processing', 'Scheduled'] } }),
      Campaign.find().sort({ createdAt: -1 }).limit(5).populate('emailTemplateId', 'name category'),
      EmailLog.countDocuments(),
      EmailLog.countDocuments({ status: { $in: ['Sent', 'Delivered'] } }),
      EmailLog.countDocuments({ status: 'Failed' }),
      Campaign.countDocuments({ status: 'Scheduled' }),
      Document.countDocuments(),
      EmailLog.find().sort({ createdAt: -1 }).limit(6),
    ]);

    const sent = deliveredCount + failedCount;
    const deliveryRate = sent > 0 ? Math.round((deliveredCount / sent) * 100) : 100;

    return res.json({
      success: true,
      data: {
        metrics: {
          totalCandidates,
          selectedCandidates,
          emailsSent: sent,
          emailsDelivered: deliveredCount,
          emailsFailed: failedCount,
          scheduledEmails: scheduledCount,
          activeCampaigns,
          documentsGenerated: documentsCount,
          deliveryRate,
        },
        statusDistribution: statusCounts.map(s => ({ status: s._id, count: s.count })),
        recentCampaigns,
        recentLogs,
      },
    });
  } catch (err) {
    next(err);
  }
}
