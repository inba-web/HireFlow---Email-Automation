import { EmailTemplate } from '../models/EmailTemplate.js';
import { Candidate } from '../models/Candidate.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { extractVariables, interpolateTemplate, sanitizeEmailHtml, buildTemplateContext } from '../services/templateEngine.js';
import { sendEmail } from '../services/emailService.js';
import { recordAudit } from '../services/auditService.js';
import { isDBConnected } from '../config/db.js';
import { mockStore } from '../utils/mockStore.js';

export async function listEmailTemplates(req, res, next) {
  try {
    const { category, search } = req.query;
    if (!isDBConnected()) {
      let templates = [...mockStore.emailTemplates];
      if (category && category !== 'all') templates = templates.filter(t => t.category === category);
      if (search) templates = templates.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));
      return res.json({ success: true, data: templates });
    }

    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const templates = await EmailTemplate.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
}

export async function getEmailTemplateById(req, res, next) {
  try {
    const { id } = req.params;
    if (!isDBConnected()) {
      const template = mockStore.emailTemplates.find(t => t._id === id);
      if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
      return res.json({ success: true, data: template });
    }

    const template = await EmailTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function createEmailTemplate(req, res, next) {
  try {
    const { name, subject, bodyHtml, category } = req.body;
    if (!name || !subject || !bodyHtml) {
      return res.status(400).json({ success: false, message: 'Name, Subject, and Body HTML are required' });
    }

    const variables = extractVariables(`${subject} ${bodyHtml}`);
    const sanitizedHtml = sanitizeEmailHtml(bodyHtml);

    if (isDBConnected()) {
      const template = await EmailTemplate.create({
        name: name.trim(),
        subject: subject.trim(),
        bodyHtml: sanitizedHtml,
        category: category || 'General',
        variables,
        createdBy: req.user?.name || 'HR Team',
      });

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'EMAIL_TEMPLATE_CREATED',
        resourceType: 'EmailTemplate',
        resourceId: template._id,
        details: { name: template.name, category: template.category },
      });

      return res.status(201).json({ success: true, data: template });
    }

    const newTemplate = {
      _id: `tpl_${Date.now()}`,
      name: name.trim(),
      subject: subject.trim(),
      bodyHtml: sanitizedHtml,
      category: category || 'General',
      variables,
      createdAt: new Date(),
    };
    mockStore.emailTemplates.unshift(newTemplate);

    return res.status(201).json({ success: true, data: newTemplate });
  } catch (err) {
    next(err);
  }
}

export async function updateEmailTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const { name, subject, bodyHtml, category, isActive } = req.body;

    const updatePayload = {};
    if (name) updatePayload.name = name.trim();
    if (subject) updatePayload.subject = subject.trim();
    if (bodyHtml) {
      updatePayload.bodyHtml = sanitizeEmailHtml(bodyHtml);
      updatePayload.variables = extractVariables(`${subject || ''} ${bodyHtml}`);
    }
    if (category) updatePayload.category = category;
    if (isActive !== undefined) updatePayload.isActive = isActive;

    if (isDBConnected()) {
      const template = await EmailTemplate.findByIdAndUpdate(id, { $set: updatePayload }, { new: true });
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }

      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'EMAIL_TEMPLATE_UPDATED',
        resourceType: 'EmailTemplate',
        resourceId: template._id,
      });

      return res.json({ success: true, data: template });
    }

    const idx = mockStore.emailTemplates.findIndex(t => t._id === id);
    if (idx !== -1) {
      mockStore.emailTemplates[idx] = { ...mockStore.emailTemplates[idx], ...updatePayload };
      return res.json({ success: true, data: mockStore.emailTemplates[idx] });
    }

    return res.json({ success: true, data: { _id: id, ...req.body } });
  } catch (err) {
    next(err);
  }
}

export async function duplicateEmailTemplate(req, res, next) {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      const source = await EmailTemplate.findById(id);
      if (!source) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }

      const duplicate = await EmailTemplate.create({
        name: `${source.name} (Copy - ${Date.now().toString().slice(-4)})`,
        subject: source.subject,
        bodyHtml: source.bodyHtml,
        category: source.category,
        variables: source.variables,
        isActive: source.isActive,
        createdBy: req.user?.name || 'HR Team',
      });

      return res.status(201).json({ success: true, data: duplicate });
    }

    const source = mockStore.emailTemplates.find(t => t._id === id);
    if (source) {
      const duplicate = {
        ...source,
        _id: `tpl_${Date.now()}`,
        name: `${source.name} (Copy)`,
        createdAt: new Date(),
      };
      mockStore.emailTemplates.unshift(duplicate);
      return res.status(201).json({ success: true, data: duplicate });
    }

    return res.status(201).json({ success: true, message: 'Duplicated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteEmailTemplate(req, res, next) {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      await EmailTemplate.findByIdAndDelete(id);
      await recordAudit({
        clerkUserId: req.user?.clerkUserId,
        userName: req.user?.name,
        userEmail: req.user?.email,
        action: 'EMAIL_TEMPLATE_DELETED',
        resourceType: 'EmailTemplate',
        resourceId: id,
      });
    } else {
      mockStore.emailTemplates = mockStore.emailTemplates.filter(t => t._id !== id);
    }
    return res.json({ success: true, message: 'Template deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function previewEmailTemplate(req, res, next) {
  try {
    const { templateId, candidateId, subject: customSubject, bodyHtml: customBody } = req.body;

    let subject = customSubject;
    let bodyHtml = customBody;

    if (templateId) {
      if (isDBConnected()) {
        const tpl = await EmailTemplate.findById(templateId);
        if (tpl) {
          subject = subject || tpl.subject;
          bodyHtml = bodyHtml || tpl.bodyHtml;
        }
      } else {
        const tpl = mockStore.emailTemplates.find(t => t._id === templateId);
        if (tpl) {
          subject = subject || tpl.subject;
          bodyHtml = bodyHtml || tpl.bodyHtml;
        }
      }
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
        fullName: 'Alexander Vance',
        email: 'alex.vance@example.com',
        jobRole: 'Lead Full Stack Architect',
        department: 'Core Platform',
        salary: '$165,000 / year',
        location: 'San Francisco, CA',
        joiningDate: 'September 1, 2026',
        candidateId: 'HF-PREVIEW',
      };
    }

    const settings = (isDBConnected() && (await SystemSettings.findOne())) || {
      companyName: 'HireFlow Technologies Inc.',
      companyEmail: 'talent@hireflow.dev',
      hrName: 'Sarah Jenkins',
    };
    const context = buildTemplateContext(candidate, settings);

    const renderedSubject = interpolateTemplate(subject || '', context);
    const renderedBody = sanitizeEmailHtml(interpolateTemplate(bodyHtml || '', context));

    return res.json({
      success: true,
      data: {
        subject: renderedSubject,
        bodyHtml: renderedBody,
        candidate,
        context,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function sendTestEmail(req, res, next) {
  try {
    const { testEmail, subject, bodyHtml } = req.body;
    if (!testEmail || !subject || !bodyHtml) {
      return res.status(400).json({ success: false, message: 'testEmail, subject, and bodyHtml are required' });
    }

    const mockCandidate = {
      _id: 'cand_test',
      fullName: req.user?.name || 'Recruiter Preview',
      email: testEmail.trim(),
      jobRole: 'Software Engineer',
      department: 'Engineering',
      salary: '$120,000 / year',
      joiningDate: 'Next Monday',
      location: 'San Francisco, CA',
      candidateId: 'HF-TEST',
    };

    const settings = (isDBConnected() && (await SystemSettings.findOne())) || {
      companyName: 'HireFlow Technologies Inc.',
      companyEmail: 'talent@hireflow.dev',
      hrName: 'Sarah Jenkins',
    };
    const context = buildTemplateContext(mockCandidate, settings);

    const renderedSubject = `[TEST] ${interpolateTemplate(subject, context)}`;
    const renderedBody = sanitizeEmailHtml(interpolateTemplate(bodyHtml, context));

    const result = await sendEmail({
      candidate: mockCandidate,
      subject: renderedSubject,
      htmlContent: renderedBody,
    });

    return res.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
