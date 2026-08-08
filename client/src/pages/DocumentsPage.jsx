import React, { useState, useEffect } from 'react';
import {
  FolderArchiveIcon,
  SearchIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  UsersIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassTable } from '../components/ui/GlassTable';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassModal } from '../components/ui/GlassModal';
import { useToast } from '../context/ToastContext';

export function DocumentsPage() {
  const { error } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents', { params: { search } });
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch generated documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [search]);

  const handleDownload = (doc) => {
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/documents/${doc._id}/download`;
    window.open(downloadUrl, '_blank');
  };

  const columns = [
    {
      header: 'File Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg glass flex items-center justify-center text-indigo-400">
            <FileTextIcon className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white truncate max-w-xs">{row.fileName}</span>
            <span className="text-[11px] text-gray-400">{(row.fileSize / 1024).toFixed(1)} KB • PDF</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Candidate Name',
      accessor: 'candidateName',
      cellClassName: 'font-medium text-white',
    },
    {
      header: 'Template Used',
      accessor: 'templateName',
      cellClassName: 'text-xs text-indigo-300',
    },
    {
      header: 'Generated Date',
      render: (row) => (
        <span className="text-xs text-gray-400">
          {row.generatedAt ? new Date(row.generatedAt).toLocaleString() : ''}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPreviewDoc(row)}
            title="Preview PDF"
            className="p-1.5 rounded-lg glass text-gray-300 hover:text-white transition cursor-pointer"
          >
            <EyeIcon className="size-3.5" />
          </button>
          <button
            onClick={() => handleDownload(row)}
            title="Download PDF"
            className="p-1.5 rounded-lg glass text-indigo-300 hover:text-white transition cursor-pointer"
          >
            <DownloadIcon className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Generated Documents Repository</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Access, view, and download all server-generated candidate offer agreements and certificates.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <GlassCard animate={false} className="p-4">
        <GlassInput
          icon={SearchIcon}
          placeholder="Search by candidate name, filename, or template..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </GlassCard>

      {/* Table */}
      <GlassTable
        columns={columns}
        data={documents}
        loading={loading}
        emptyMessage="No generated documents found. Launch a campaign with an attached PDF template to generate documents."
      />

      {/* PDF View Modal */}
      <GlassModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        maxWidth="max-w-4xl"
        title={previewDoc?.fileName || 'Document Preview'}
        subtitle={`Candidate: ${previewDoc?.candidateName}`}
      >
        {previewDoc && (
          <div className="w-full h-[65vh] rounded-xl overflow-hidden glass bg-black/90">
            <iframe
              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/documents/${previewDoc._id}/download`}
              title="Document Preview"
              className="w-full h-full border-none rounded-xl"
            />
          </div>
        )}
      </GlassModal>
    </div>
  );
}
