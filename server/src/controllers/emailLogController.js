import { EmailLog } from '../models/EmailLog.js';
import { isDBConnected } from '../config/db.js';
import { mockStore } from '../utils/mockStore.js';

export async function listEmailLogs(req, res, next) {
  try {
    const {
      page = 1,
      limit = 25,
      status,
      campaignId,
      candidateId,
      search,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    if (!isDBConnected()) {
      let logs = [...mockStore.emailLogs];
      if (status && status !== 'all') logs = logs.filter(l => l.status === status);
      if (campaignId) logs = logs.filter(l => l.campaignId === campaignId);
      if (candidateId) logs = logs.filter(l => l.candidateId === candidateId);
      if (search) {
        logs = logs.filter(l =>
          l.recipient?.toLowerCase().includes(search.toLowerCase()) ||
          l.subject?.toLowerCase().includes(search.toLowerCase()) ||
          l.candidateName?.toLowerCase().includes(search.toLowerCase())
        );
      }

      const total = logs.length;
      const paginated = logs.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        data: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      });
    }

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (campaignId) query.campaignId = campaignId;
    if (candidateId) query.candidateId = candidateId;
    if (search) {
      query.$or = [
        { recipient: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { candidateName: { $regex: search, $options: 'i' } },
      ];
    }

    const [logs, total] = await Promise.all([
      EmailLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      EmailLog.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getEmailLogById(req, res, next) {
  try {
    const { id } = req.params;
    if (!isDBConnected()) {
      const log = mockStore.emailLogs.find(l => l._id === id);
      if (!log) return res.status(404).json({ success: false, message: 'Email log not found' });
      return res.json({ success: true, data: log });
    }

    const log = await EmailLog.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Email log not found' });
    }

    return res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
}
