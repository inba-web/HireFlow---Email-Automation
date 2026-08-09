import React, { useState, useEffect } from 'react';
import {
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  CopyIcon,
  Trash2Icon,
  Edit2Icon,
  SendIcon,
  EyeIcon,
  CodeIcon,
  SparklesIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassModal } from '../components/ui/GlassModal';
import { GlassInput, GlassSelect, GlassTextarea } from '../components/ui/GlassInput';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'Offer', label: 'Offer Letter' },
  { value: 'Interview', label: 'Interview Invitation' },
  { value: 'Selection', label: 'Selection Letter' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Rejection', label: 'Respectful Rejection' },
  { value: 'General', label: 'General' },
];

const COMMON_TAGS = [
  '{{candidateName}}',
  '{{candidateEmail}}',
  '{{jobRole}}',
  '{{department}}',
  '{{salary}}',
  '{{joiningDate}}',
  '{{companyName}}',
  '{{hrName}}',
  '{{currentDate}}',
];

export function EmailTemplatesPage() {
  const { success, error, warning } = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'

  const [formData, setFormData] = useState({
    name: '',
    category: 'Offer',
    subject: '',
    bodyHtml: '',
  });

  // Test Email Modal
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/email-templates', {
        params: { category: categoryFilter, search },
      });
      if (res.success) {
        setTemplates(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch email templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter, search]);

  const handleOpenCreate = () => {
    setActiveTemplate(null);
    setFormData({
      name: '',
      category: 'Offer',
      subject: 'Congratulations {{candidateName}} — Offer for {{jobRole}} at {{companyName}}',
      bodyHtml: `<p>Dear <strong>{{candidateName}}</strong>,</p>\n<p>We are delighted to offer you the position of <strong>{{jobRole}}</strong> with the <strong>{{department}}</strong> team at <strong>{{companyName}}</strong>.</p>\n<p>Annual CTC: <strong>{{salary}}</strong><br/>Joining Date: <strong>{{joiningDate}}</strong></p>\n<br/>\n<p>Regards,<br/><strong>{{hrName}}</strong><br/>{{companyName}}</p>`,
    });
    setActiveTab('edit');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (tpl) => {
    setActiveTemplate(tpl);
    setFormData({
      name: tpl.name,
      category: tpl.category,
      subject: tpl.subject,
      bodyHtml: tpl.bodyHtml,
    });
    setActiveTab('edit');
    setIsEditorOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeTemplate) {
        const res = await api.patch(`/email-templates/${activeTemplate._id}`, formData);
        if (res.success) {
          success('Email template updated');
          setIsEditorOpen(false);
          fetchTemplates();
        }
      } else {
        const res = await api.post('/email-templates', formData);
        if (res.success) {
          success('Email template created');
          setIsEditorOpen(false);
          fetchTemplates();
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save template');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/email-templates/${id}/duplicate`);
      if (res.success) {
        success('Template duplicated');
        fetchTemplates();
      }
    } catch (err) {
      error(err.message || 'Failed to duplicate');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this email template?')) return;
    try {
      const res = await api.delete(`/email-templates/${id}`);
      if (res.success) {
        success('Template deleted');
        fetchTemplates();
      }
    } catch (err) {
      error(err.message || 'Failed to delete template');
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailAddress) {
      warning('Enter an email address to send test message to');
      return;
    }

    try {
      setIsSendingTest(true);
      const res = await api.post('/email-templates/test-send', {
        testEmail: testEmailAddress,
        subject: formData.subject,
        bodyHtml: formData.bodyHtml,
      });

      if (res.success) {
        success(res.message);
        setIsTestEmailOpen(false);
      }
    } catch (err) {
      error(err.message || 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const insertTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      bodyHtml: prev.bodyHtml + ` ${tag} `,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Centered Hero Header - Matching Theme */}
      <section className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="flex items-center gap-2.5 glass px-4 py-1.5 rounded-full text-xs font-medium text-gray-200 shadow-xl border-white/20">
          <SparklesIcon className="size-3.5 text-amber-400" />
          <span>Enterprise Recruitment Email &amp; Document Automation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Email{' '}
          <span className="bg-gradient-to-r from-[#D10A8A] via-[#F26A06] to-[#2E08CF] bg-clip-text text-transparent">
            Template Engine
          </span>
        </h1>

        <p className="text-gray-300 text-sm max-w-xl">
          Dynamic HTML email templates with automated candidate variable substitution and live inbox testing.
        </p>

        <div className="pt-2">
          <GlassButton size="md" variant="gradient" icon={PlusIcon} onClick={handleOpenCreate}>
            Create Template
          </GlassButton>
        </div>
      </section>

      {/* Filter bar */}
      <GlassCard animate={false} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <GlassInput
              icon={SearchIcon}
              placeholder="Search templates by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <GlassSelect
            options={CATEGORIES}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Templates Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 glass rounded-2xl animate-pulse">
          Loading email templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="p-12 text-center text-gray-400 glass rounded-2xl space-y-3">
          <FileTextIcon className="size-8 text-gray-500 mx-auto" />
          <div className="text-base font-semibold text-white">No email templates found</div>
          <GlassButton size="sm" variant="gradient" onClick={handleOpenCreate}>
            Create New Template
          </GlassButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tpl) => (
            <GlassCard key={tpl._id} className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white hover:text-indigo-300 transition">
                      {tpl.name}
                    </h3>
                    <div className="text-xs font-mono text-indigo-300 mt-1 line-clamp-1">
                      Subject: {tpl.subject}
                    </div>
                  </div>
                  <GlassBadge status={tpl.category} />
                </div>

                <div className="p-3.5 rounded-xl glass bg-white/5 text-xs text-gray-300 max-h-24 overflow-hidden relative">
                  <div dangerouslySetInnerHTML={{ __html: tpl.bodyHtml }} />
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                </div>

                {/* Variable tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {tpl.variables?.map((v) => (
                    <span key={v} className="px-2 py-0.5 rounded-full text-[10px] glass text-gray-400">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-[11px] text-gray-400">
                  {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString() : ''}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(tpl)}
                    title="Edit Template"
                    className="p-1.5 rounded-lg glass text-indigo-300 hover:text-white transition cursor-pointer"
                  >
                    <Edit2Icon className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(tpl._id)}
                    title="Duplicate Template"
                    className="p-1.5 rounded-lg glass text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    <CopyIcon className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tpl._id)}
                    title="Delete Template"
                    className="p-1.5 rounded-lg glass text-rose-400 hover:text-rose-300 transition cursor-pointer"
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Template Editor Modal */}
      <GlassModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        maxWidth="max-w-3xl"
        title={activeTemplate ? 'Edit Email Template' : 'Create Email Template'}
        subtitle="Write sanitized HTML content and insert dynamic variable tags."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'edit' ? 'glass bg-white/20 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <CodeIcon className="size-3.5 inline mr-1.5" />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'preview' ? 'glass bg-white/20 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <EyeIcon className="size-3.5 inline mr-1.5" />
              Live Preview
            </button>

            <button
              type="button"
              onClick={() => setIsTestEmailOpen(true)}
              className="ml-auto px-3 py-1.5 rounded-lg glass text-xs font-medium text-indigo-300 hover:text-white transition cursor-pointer"
            >
              <SendIcon className="size-3.5 inline mr-1.5" />
              Send Test Email
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <GlassInput
                label="Template Name"
                required
                placeholder="e.g. Formal Job Offer Letter Email"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <GlassSelect
              label="Category"
              options={CATEGORIES.filter((c) => c.value !== 'all')}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <GlassInput
            label="Email Subject"
            required
            placeholder="Congratulations {{candidateName}} — Offer for {{jobRole}}"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />

          {/* Dynamic Variable Insertion Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-300">Click variable to insert:</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertTag(tag)}
                  className="px-2.5 py-1 rounded-lg glass bg-white/5 hover:bg-white/15 text-xs text-indigo-300 hover:text-indigo-200 transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'edit' ? (
            <GlassTextarea
              label="HTML Body Content"
              rows={8}
              required
              value={formData.bodyHtml}
              onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
            />
          ) : (
            <div className="p-5 rounded-2xl glass bg-white text-gray-900 text-xs leading-relaxed max-h-80 overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: formData.bodyHtml
                    .replace(/\{\{candidateName\}\}/g, 'Alexander Vance')
                    .replace(/\{\{jobRole\}\}/g, 'Principal Architect')
                    .replace(/\{\{salary\}\}/g, '$180,000 / year')
                    .replace(/\{\{joiningDate\}\}/g, 'September 15, 2026')
                    .replace(/\{\{companyName\}\}/g, 'HireFlow Technologies Inc.')
                    .replace(/\{\{department\}\}/g, 'Core Architecture')
                    .replace(/\{\{hrName\}\}/g, 'Sarah Jenkins'),
                }}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <GlassButton variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="gradient">
              {activeTemplate ? 'Update Template' : 'Save Template'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Send Test Email Modal */}
      <GlassModal
        isOpen={isTestEmailOpen}
        onClose={() => setIsTestEmailOpen(false)}
        title="Send Test Email"
        subtitle="Verify how the email looks inside a real inbox."
      >
        <form onSubmit={handleSendTestEmail} className="space-y-4">
          <GlassInput
            label="Recipient Email"
            type="email"
            required
            placeholder="your-email@example.com"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
          />

          <p className="text-xs text-gray-400">
            This will transmit a sample email using mock candidate variables to test your SMTP delivery pipeline.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <GlassButton variant="outline" onClick={() => setIsTestEmailOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="gradient" loading={isSendingTest}>
              Send Test Email
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
