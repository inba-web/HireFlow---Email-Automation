import multer from 'multer';
import { Candidate } from '../models/Candidate.js';
import { parseAndImportCandidates, exportCandidatesToCsv } from '../services/candidateService.js';
import { recordAudit } from '../services/auditService.js';
import { isDBConnected } from '../config/db.js';
import { mockStore } from '../utils/mockStore.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadCsvMiddleware = upload.single('file');

export async function listCandidates(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      department = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    if (!isDBConnected()) {
      let filtered = [...mockStore.candidates];
      if (search) {
        filtered = filtered.filter(c =>
          c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.jobRole?.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (status && status !== 'all') {
        filtered = filtered.filter(c => c.status === status);
      }
      if (department && department !== 'all') {
        filtered = filtered.filter(c => c.department === department);
      }

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limitNum);

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

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { jobRole: { $regex: search, $options: 'i' } },
        { candidateId: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    const sortOption = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [candidates, total] = await Promise.all([
      Candidate.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Candidate.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: candidates,
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

export async function getCandidateById(req, res, next) {
  try {
    const { id } = req.params;
    if (!isDBConnected()) {
      const candidate = mockStore.candidates.find(c => c._id === id || c.candidateId === id);
      if (!candidate) {
        return res.status(404).json({ success: false, message: 'Candidate not found' });
      }
      return res.json({ success: true, data: candidate });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    return res.json({ success: true, data: candidate });
  } catch (err) {
    next(err);
  }
}

export async function createCandidate(req, res, next) {
  try {
    const {
      fullName,
      email,
      phone,
      jobRole,
      department,
      company,
      location,
      salary,
      joiningDate,
      status,
      notes,
    } = req.body;

    if (!fullName || !email || !jobRole) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email, and Job Role are required fields.',
      });
    }

    const lowerEmail = email.toLowerCase().trim();
    const candidateId = `HF-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    if (isDBConnected()) {
      const existing = await Candidate.findOne({ email: lowerEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          code: 'DUPLICATE_CANDIDATE',
          message: `Candidate with email ${email} already exists.`,
        });
      }

      const candidate = await Candidate.create({
        candidateId,
        fullName: fullName.trim(),
        email: lowerEmail,
        phone: phone?.trim() || '',
        jobRole: jobRole.trim(),
        department: department?.trim() || 'Engineering',
        company: company?.trim() || 'Thodar Technologies',
        location: location?.trim() || 'Remote',
        salary: salary?.trim() || '$90,000 / year',
        joiningDate: joiningDate?.trim() || '',
        status: status || 'Applied',
        notes: notes?.trim() || '',
        createdBy: req.user?.name || 'HR Executive',
      });

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'CANDIDATE_CREATED',
        resourceType: 'Candidate',
        resourceId: candidate._id,
        details: { candidateId: candidate.candidateId, email: candidate.email },
      });

      return res.status(201).json({ success: true, data: candidate });
    }

    const newCandidate = {
      _id: `cand_${Date.now()}`,
      candidateId,
      fullName: fullName.trim(),
      email: lowerEmail,
      phone: phone?.trim() || '',
      jobRole: jobRole.trim(),
      department: department?.trim() || 'Engineering',
      company: company?.trim() || 'Thodar Technologies',
      location: location?.trim() || 'Remote',
      salary: salary?.trim() || '$90,000 / year',
      joiningDate: joiningDate?.trim() || '',
      status: status || 'Applied',
      notes: notes?.trim() || '',
      createdAt: new Date(),
    };

    mockStore.candidates.unshift(newCandidate);
    return res.status(201).json({ success: true, data: newCandidate });
  } catch (err) {
    next(err);
  }
}

export async function updateCandidate(req, res, next) {
  try {
    const { id } = req.params;
    if (!isDBConnected()) {
      const idx = mockStore.candidates.findIndex(c => c._id === id);
      if (idx !== -1) {
        mockStore.candidates[idx] = { ...mockStore.candidates[idx], ...req.body };
        return res.json({ success: true, data: mockStore.candidates[idx] });
      }
      return res.json({ success: true, data: { _id: id, ...req.body } });
    }

    const candidate = await Candidate.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    await recordAudit({
      clerkUserId: req.user?.clerkUserId,
      userName: req.user?.name,
      userEmail: req.user?.email,
      action: 'CANDIDATE_UPDATED',
      resourceType: 'Candidate',
      resourceId: candidate._id,
    });

    return res.json({ success: true, data: candidate });
  } catch (err) {
    next(err);
  }
}

export async function deleteCandidate(req, res, next) {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      const candidate = await Candidate.findByIdAndDelete(id);
      if (!candidate) {
        return res.status(404).json({ success: false, message: 'Candidate not found' });
      }

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'CANDIDATE_DELETED',
        resourceType: 'Candidate',
        resourceId: id,
        details: { email: candidate.email, name: candidate.fullName },
      });
    } else {
      mockStore.candidates = mockStore.candidates.filter(c => c._id !== id);
    }

    return res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function bulkDeleteCandidates(req, res, next) {
  try {
    const { candidateIds } = req.body;
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ success: false, message: 'candidateIds array is required' });
    }

    if (isDBConnected()) {
      await Candidate.deleteMany({ _id: { $in: candidateIds } });

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'CANDIDATES_BULK_DELETED',
        resourceType: 'Candidate',
        details: { count: candidateIds.length },
      });
    } else {
      mockStore.candidates = mockStore.candidates.filter(c => !candidateIds.includes(c._id));
    }

    return res.json({ success: true, message: `Successfully deleted ${candidateIds.length} candidates` });
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdateStatus(req, res, next) {
  try {
    const { candidateIds, status } = req.body;
    if (!Array.isArray(candidateIds) || candidateIds.length === 0 || !status) {
      return res.status(400).json({ success: false, message: 'candidateIds array and status are required' });
    }

    if (isDBConnected()) {
      await Candidate.updateMany({ _id: { $in: candidateIds } }, { $set: { status } });

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'CANDIDATES_BULK_STATUS_UPDATED',
        resourceType: 'Candidate',
        details: { count: candidateIds.length, newStatus: status },
      });
    } else {
      mockStore.candidates.forEach(c => {
        if (candidateIds.includes(c._id)) c.status = status;
      });
    }

    return res.json({ success: true, message: `Updated status to ${status} for ${candidateIds.length} candidates` });
  } catch (err) {
    next(err);
  }
}

export async function importCandidatesCsv(req, res, next) {
  try {
    let csvContent = '';
    if (req.file) {
      csvContent = req.file.buffer.toString('utf-8');
    } else if (req.body.csvText) {
      csvContent = req.body.csvText;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No CSV file or csvText payload provided.',
      });
    }

    const result = await parseAndImportCandidates(csvContent, req.user?.name || 'HR Team');

    if (!isDBConnected() && result.candidates) {
      result.candidates.forEach(c => {
        mockStore.candidates.unshift({
          _id: `cand_${Date.now()}_${Math.random()}`,
          ...c,
          createdAt: new Date(),
        });
      });
    }

    await recordAudit({
      clerkUserId: req.user?.clerkUserId,
      userName: req.user?.name,
      userEmail: req.user?.email,
      action: 'CANDIDATES_IMPORTED_CSV',
      resourceType: 'Candidate',
      details: {
        imported: result.imported,
        skipped: result.skipped,
        duplicates: result.duplicates,
        invalid: result.invalid,
      },
    });

    return res.json({
      success: true,
      message: `Import finished: ${result.imported} imported, ${result.skipped} skipped, ${result.duplicates} duplicates, ${result.invalid} invalid`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function exportCandidates(req, res, next) {
  try {
    const { status, department } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (department && department !== 'all') query.department = department;

    let candidates = [];
    if (isDBConnected()) {
      candidates = await Candidate.find(query).sort({ createdAt: -1 }).lean();
    } else {
      candidates = mockStore.candidates;
    }

    const csvData = exportCandidatesToCsv(candidates);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=candidates_${Date.now()}.csv`);
    return res.send(csvData);
  } catch (err) {
    next(err);
  }
}
