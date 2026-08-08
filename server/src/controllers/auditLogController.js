import { AuditLog } from '../models/AuditLog.js';
import { isDBConnected } from '../config/db.js';
import { mockStore } from '../utils/mockStore.js';

export async function listAuditLogs(req, res, next) {
  try {
    const {
      page = 1,
      limit = 30,
      action,
      resourceType,
      search,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    if (!isDBConnected()) {
      let logs = [...mockStore.auditLogs];
      if (action && action !== 'all') logs = logs.filter(l => l.action === action);
      if (resourceType && resourceType !== 'all') logs = logs.filter(l => l.resourceType === resourceType);
      if (search) {
        logs = logs.filter(l =>
          l.userName?.toLowerCase().includes(search.toLowerCase()) ||
          l.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
          l.action?.toLowerCase().includes(search.toLowerCase())
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
    if (action && action !== 'all') query.action = action;
    if (resourceType && resourceType !== 'all') query.resourceType = resourceType;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments(query),
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
