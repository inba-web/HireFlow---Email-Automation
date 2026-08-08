import fs from 'fs';
import path from 'path';
import { Document } from '../models/Document.js';
import { isDBConnected } from '../config/db.js';
import { mockStore } from '../utils/mockStore.js';

export async function listDocuments(req, res, next) {
  try {
    const { candidateId, search } = req.query;
    if (!isDBConnected()) {
      let docs = [...mockStore.documents];
      if (candidateId) docs = docs.filter(d => d.candidateId === candidateId);
      if (search) {
        docs = docs.filter(d =>
          d.fileName?.toLowerCase().includes(search.toLowerCase()) ||
          d.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
          d.templateName?.toLowerCase().includes(search.toLowerCase())
        );
      }
      return res.json({ success: true, data: docs });
    }

    const query = {};
    if (candidateId) query.candidateId = candidateId;
    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { candidateName: { $regex: search, $options: 'i' } },
        { templateName: { $regex: search, $options: 'i' } },
      ];
    }

    const docs = await Document.find(query).sort({ generatedAt: -1 });
    return res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const { id } = req.params;
    if (!isDBConnected()) {
      const doc = mockStore.documents.find(d => d._id === id);
      if (doc && doc.storagePath && fs.existsSync(doc.storagePath)) {
        res.setHeader('Content-Type', doc.fileType || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${doc.fileName}"`);
        return fs.createReadStream(doc.storagePath).pipe(res);
      }
      return res.status(404).json({ success: false, message: 'Document preview not available' });
    }

    const doc = await Document.findById(id);
    if (!doc || !fs.existsSync(doc.storagePath)) {
      return res.status(404).json({ success: false, message: 'Document file not found on disk' });
    }

    res.setHeader('Content-Type', doc.fileType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.fileName}"`);
    const fileStream = fs.createReadStream(doc.storagePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
}
