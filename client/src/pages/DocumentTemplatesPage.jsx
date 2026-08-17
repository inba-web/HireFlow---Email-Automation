import React, { useState, useEffect } from 'react';
import {
  FileSignatureIcon,
  PlusIcon,
  SearchIcon,
  Edit2Icon,
  Trash2Icon,
  EyeIcon,
  FileCheckIcon,
  DownloadIcon,
  SparklesIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassModal } from '../components/ui/GlassModal';
import { GlassInput, GlassSelect, GlassTextarea } from '../components/ui/GlassInput';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';

const DOC_TYPES = [
  { value: 'all', label: 'All Document Types' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'selection_letter', label: 'Selection Letter' },
  { value: 'internship_certificate', label: 'Internship Certificate' },
  { value: 'experience_certificate', label: 'Experience Certificate' },
  { value: 'joining_letter', label: 'Joining Letter' },
  { value: 'rejection_letter', label: 'Rejection Letter' },
  { value: 'custom', label: 'Custom HR Document' },
];

export function DocumentTemplatesPage() {
  const { success, error } = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'offer_letter',
    description: '',
    orientation: 'portrait',
    htmlTemplate: '',
    cssStyles: '',
  });

  // PDF Preview Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isRenderingPdf, setIsRenderingPdf] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/document-templates', {
        params: { type: typeFilter, search: debouncedSearch },
      });
      if (res.success) {
        setTemplates(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch document templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [typeFilter, debouncedSearch]);

  const handleOpenCreate = () => {
    setActiveTemplate(null);
    setFormData({
      name: 'Standard Job Offer Agreement',
      type: 'offer_letter',
      description: 'Official corporate offer letter with compensation breakdown and signatures.',
      orientation: 'portrait',
      htmlTemplate: `<div class="header">\n  <div class="logo-text">{{companyName}}</div>\n  <div class="meta-info">Ref: {{candidateId}}<br/>Date: {{currentDate}}</div>\n</div>\n\n<div class="doc-title">OFFER OF EMPLOYMENT</div>\n\n<p>Dear <strong>{{candidateName}}</strong>,</p>\n<p>We are pleased to offer you the position of <strong>{{jobRole}}</strong> with the <strong>{{department}}</strong> team at <strong>{{companyName}}</strong>.</p>\n<br/>\n<table style="width:100%; border: 1px solid #ddd;">\n  <tr><td><strong>Compensation (CTC)</strong></td><td>{{salary}}</td></tr>\n  <tr><td><strong>Location</strong></td><td>{{location}}</td></tr>\n  <tr><td><strong>Joining Date</strong></td><td>{{joiningDate}}</td></tr>\n</table>\n<br/>\n<p>Sincerely,<br/><strong>{{hrName}}</strong></p>`,
      cssStyles: '',
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (tpl) => {
    setActiveTemplate(tpl);
    setFormData({
      name: tpl.name,
      type: tpl.type,
      description: tpl.description || '',
      orientation: tpl.orientation || 'portrait',
      htmlTemplate: tpl.htmlTemplate,
      cssStyles: tpl.cssStyles || '',
    });
    setIsEditorOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeTemplate) {
        const res = await api.patch(`/document-templates/${activeTemplate._id}`, formData);
        if (res.success) {
          success('Document template updated');
          setIsEditorOpen(false);
          fetchTemplates();
        }
      } else {
        const res = await api.post('/document-templates', formData);
        if (res.success) {
          success('Document template created');
          setIsEditorOpen(false);
          fetchTemplates();
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save document template');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document template?')) return;
    try {
      const res = await api.delete(`/document-templates/${id}`);
      if (res.success) {
        success('Document template deleted');
        fetchTemplates();
      }
    } catch (err) {
      error(err.message || 'Failed to delete template');
    }
  };

  const handleRenderTestPdf = async (tpl) => {
    try {
      setIsRenderingPdf(true);
      setIsPdfModalOpen(true);
      setPdfBlobUrl(null);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/document-templates/render-test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: tpl?._id,
            htmlTemplate: tpl ? undefined : formData.htmlTemplate,
            cssStyles: tpl ? undefined : formData.cssStyles,
            orientation: tpl ? undefined : formData.orientation,
          }),
        }
      );

      if (!res.ok) throw new Error('PDF generation failed on server');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(blobUrl);
    } catch (err) {
      error(err.message || 'Failed to generate test PDF');
      setIsPdfModalOpen(false);
    } finally {
      setIsRenderingPdf(false);
    }
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
          Document{' '}
          <span className="bg-gradient-to-r from-[#D10A8A] via-[#F26A06] to-[#2E08CF] bg-clip-text text-transparent">
            Template Engine
          </span>
        </h1>

        <p className="text-gray-300 text-sm max-w-xl">
          Server-side Puppeteer PDF generators for offer agreements, certificates, and employment contracts.
        </p>

        <div className="pt-2">
          <GlassButton size="md" variant="gradient" icon={PlusIcon} onClick={handleOpenCreate}>
            Create Doc Template
          </GlassButton>
        </div>
      </section>

      {/* Filter Toolbar */}
      <GlassCard animate={false} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <GlassInput
              icon={SearchIcon}
              placeholder="Search document templates by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <GlassSelect
            options={DOC_TYPES}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Templates Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 glass rounded-2xl animate-pulse">
          Loading document templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="p-12 text-center text-gray-400 glass rounded-2xl space-y-3">
          <FileSignatureIcon className="size-8 text-gray-500 mx-auto" />
          <div className="text-base font-semibold text-white">No document templates found</div>
          <GlassButton size="sm" variant="gradient" onClick={handleOpenCreate}>
            Create New Document Template
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
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                      {tpl.description || 'Dynamic PDF contract document.'}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium glass bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase">
                    {tpl.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <span className="p-1.5 rounded-lg glass bg-white/5">
                    Orientation: <strong className="text-white capitalize">{tpl.orientation || 'portrait'}</strong>
                  </span>
                  <span className="p-1.5 rounded-lg glass bg-white/5">
                    Variables: <strong className="text-white">{tpl.variables?.length || 0}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {tpl.variables?.slice(0, 5).map((v) => (
                    <span key={v} className="px-2 py-0.5 rounded-full text-[10px] glass text-gray-400">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-[11px] text-gray-400">
                  {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString() : ''}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRenderTestPdf(tpl)}
                    title="Live Test PDF Render"
                    className="p-1.5 rounded-lg glass text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                  >
                    <EyeIcon className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(tpl)}
                    title="Edit Template"
                    className="p-1.5 rounded-lg glass text-indigo-300 hover:text-white transition cursor-pointer"
                  >
                    <Edit2Icon className="size-3.5" />
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

      {/* Document Template Editor Modal */}
      <GlassModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        maxWidth="max-w-3xl"
        title={activeTemplate ? 'Edit Document Template' : 'Create Document Template'}
        subtitle="HTML & CSS structure converted server-side to high-resolution printable PDFs via Puppeteer."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <GlassInput
                label="Template Name"
                required
                placeholder="e.g. Executive Employment Agreement"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <GlassSelect
              label="Document Type"
              options={DOC_TYPES.filter((d) => d.value !== 'all')}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <GlassInput
              label="Description"
              placeholder="Summary of document purpose"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <GlassSelect
              label="Page Orientation"
              options={[
                { value: 'portrait', label: 'Portrait (Standard Document)' },
                { value: 'landscape', label: 'Landscape (Certificate Format)' },
              ]}
              value={formData.orientation}
              onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
            />
          </div>

          <GlassTextarea
            label="HTML Structure"
            rows={10}
            required
            placeholder="<div>...<h1>{{companyName}}</h1>...</div>"
            value={formData.htmlTemplate}
            onChange={(e) => setFormData({ ...formData, htmlTemplate: e.target.value })}
          />

          <GlassTextarea
            label="Custom CSS Styling (Optional)"
            rows={3}
            placeholder=".doc-title { font-size: 24px; color: #1e1b4b; }"
            value={formData.cssStyles}
            onChange={(e) => setFormData({ ...formData, cssStyles: e.target.value })}
          />

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <GlassButton
              type="button"
              variant="outline"
              icon={EyeIcon}
              onClick={() => handleRenderTestPdf(null)}
            >
              Test PDF Render
            </GlassButton>

            <div className="flex gap-3">
              <GlassButton variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton type="submit" variant="gradient">
                {activeTemplate ? 'Update Template' : 'Save Template'}
              </GlassButton>
            </div>
          </div>
        </form>
      </GlassModal>

      {/* Live PDF Viewer Modal */}
      <GlassModal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
        }}
        maxWidth="max-w-4xl"
        title="Live Server-Generated PDF Preview"
        subtitle="Verifying Puppeteer layout and typography"
      >
        <div className="w-full h-[65vh] rounded-xl overflow-hidden glass bg-black/80 flex items-center justify-center">
          {isRenderingPdf ? (
            <div className="text-center space-y-2 text-gray-400">
              <FileSignatureIcon className="size-8 mx-auto animate-bounce text-indigo-400" />
              <div>Generating PDF via Headless Chromium...</div>
            </div>
          ) : pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              title="Generated PDF Preview"
              className="w-full h-full border-none rounded-xl"
            />
          ) : (
            <div className="text-rose-400 text-xs">Failed to render preview.</div>
          )}
        </div>
      </GlassModal>
    </div>
  );
}
