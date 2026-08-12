import { DocumentTemplate } from '../models/DocumentTemplate.js';
import { Candidate } from '../models/Candidate.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { extractVariables, buildTemplateContext } from '../services/templateEngine.js';
import { generateDocumentPdf } from '../services/documentService.js';
import { recordAudit } from '../services/auditService.js';
import { isDBConnected } from '../config/db.js';
import { mockStore } from '../utils/mockStore.js';

export async function listDocumentTemplates(req, res, next) {
  try {
    const { type, search } = req.query;
    if (!isDBConnected()) {
      let templates = [...mockStore.documentTemplates];
      if (type && type !== 'all') templates = templates.filter(t => t.type === type);
      if (search) templates = templates.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));
      return res.json({ success: true, data: templates });
    }

    const query = {};
    if (type && type !== 'all') query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };

    const templates = await DocumentTemplate.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
}

export async function getDocumentTemplateById(req, res, next) {
  try {
    const { id } = req.params;
    if (!isDBConnected()) {
      const template = mockStore.documentTemplates.find(t => t._id === id);
      if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
      return res.json({ success: true, data: template });
    }

    const template = await DocumentTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function createDocumentTemplate(req, res, next) {
  try {
    const { name, type, description, htmlTemplate, cssStyles, orientation } = req.body;
    if (!name || !htmlTemplate) {
      return res.status(400).json({ success: false, message: 'Name and HTML Template are required' });
    }

    const variables = extractVariables(htmlTemplate);

    if (isDBConnected()) {
      const template = await DocumentTemplate.create({
        name: name.trim(),
        type: type || 'offer_letter',
        description: description?.trim() || '',
        htmlTemplate,
        cssStyles: cssStyles || '',
        orientation: orientation || 'portrait',
        variables,
        createdBy: req.user?.name || 'HR Team',
      });

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'DOCUMENT_TEMPLATE_CREATED',
        resourceType: 'DocumentTemplate',
        resourceId: template._id,
      });

      return res.status(201).json({ success: true, data: template });
    }

    const newTemplate = {
      _id: `doc_tpl_${Date.now()}`,
      name: name.trim(),
      type: type || 'offer_letter',
      description: description?.trim() || '',
      htmlTemplate,
      cssStyles: cssStyles || '',
      orientation: orientation || 'portrait',
      variables,
      createdAt: new Date(),
    };
    mockStore.documentTemplates.unshift(newTemplate);

    return res.status(201).json({ success: true, data: newTemplate });
  } catch (err) {
    next(err);
  }
}

export async function updateDocumentTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const { name, type, description, htmlTemplate, cssStyles, orientation, isActive } = req.body;

    const updatePayload = {};
    if (name) updatePayload.name = name.trim();
    if (type) updatePayload.type = type;
    if (description !== undefined) updatePayload.description = description.trim();
    if (htmlTemplate) {
      updatePayload.htmlTemplate = htmlTemplate;
      updatePayload.variables = extractVariables(htmlTemplate);
    }
    if (cssStyles !== undefined) updatePayload.cssStyles = cssStyles;
    if (orientation) updatePayload.orientation = orientation;
    if (isActive !== undefined) updatePayload.isActive = isActive;

    if (isDBConnected()) {
      const template = await DocumentTemplate.findByIdAndUpdate(id, { $set: updatePayload }, { new: true });
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'DOCUMENT_TEMPLATE_UPDATED',
        resourceType: 'DocumentTemplate',
        resourceId: template._id,
      });

      return res.json({ success: true, data: template });
    }

    const idx = mockStore.documentTemplates.findIndex(t => t._id === id);
    if (idx !== -1) {
      mockStore.documentTemplates[idx] = { ...mockStore.documentTemplates[idx], ...updatePayload };
      return res.json({ success: true, data: mockStore.documentTemplates[idx] });
    }

    return res.json({ success: true, data: { _id: id, ...req.body } });
  } catch (err) {
    next(err);
  }
}

export async function deleteDocumentTemplate(req, res, next) {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      await DocumentTemplate.findByIdAndDelete(id);
      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'DOCUMENT_TEMPLATE_DELETED',
        resourceType: 'DocumentTemplate',
        resourceId: id,
      });
    } else {
      mockStore.documentTemplates = mockStore.documentTemplates.filter(t => t._id !== id);
    }
    return res.json({ success: true, message: 'Document template deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function renderTestPdf(req, res, next) {
  try {
    const { templateId, candidateId, htmlTemplate, cssStyles, orientation } = req.body;

    let docTemplate = null;
    if (templateId) {
      if (isDBConnected()) {
        docTemplate = await DocumentTemplate.findById(templateId);
      } else {
        docTemplate = mockStore.documentTemplates.find(t => t._id === templateId);
      }
    }

    if (!docTemplate) {
      docTemplate = {
        name: 'Preview Document',
        type: 'offer_letter',
        htmlTemplate: htmlTemplate || '<div class="doc-title">SAMPLE DOCUMENT</div><p>Candidate: {{candidateName}}</p>',
        cssStyles: cssStyles || '',
        orientation: orientation || 'portrait',
      };
    }

    let candidate = null;
    if (candidateId) {
      if (isDBConnected()) {
        candidate = await Candidate.findById(candidateId);
      } else {
        candidate = mockStore.candidates.find(c => c._id === candidateId || c.candidateId === candidateId);
      }
    }

    if (!candidate) {
      candidate = {
        _id: 'cand_preview',
        candidateId: 'TD-1001',
        fullName: 'Alexander Vance',
        email: 'alex.vance@example.com',
        phone: '+1 (555) 349-8812',
        jobRole: 'Principal Systems Architect',
        department: 'Cloud Infrastructure',
        salary: '$180,000 / year',
        location: 'San Francisco, CA',
        joiningDate: 'October 15, 2026',
        company: 'Thodar Technologies Inc.',
      };
    }

    const settings = (isDBConnected() && (await SystemSettings.findOne())) || {
      companyName: 'Thodar Technologies Inc.',
      companyEmail: 'talent@thodar.dev',
      hrName: 'Sarah Jenkins',
    };
    const context = buildTemplateContext(candidate, settings);

    const generated = await generateDocumentPdf({
      candidate,
      documentTemplate: docTemplate,
      context,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=preview_${Date.now()}.pdf`);
    return res.send(generated.pdfBuffer);
  } catch (err) {
    next(err);
  }
}
