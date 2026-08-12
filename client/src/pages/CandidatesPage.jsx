import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UsersIcon,
  PlusIcon,
  UploadCloudIcon,
  DownloadIcon,
  SearchIcon,
  FilterIcon,
  Trash2Icon,
  Edit2Icon,
  EyeIcon,
  CheckSquareIcon,
  SquareIcon,
  FileTextIcon,
  AlertCircleIcon,
  SparklesIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassTable } from '../components/ui/GlassTable';
import { GlassModal } from '../components/ui/GlassModal';
import { GlassInput, GlassSelect, GlassTextarea } from '../components/ui/GlassInput';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Shortlisted', label: 'Shortlisted' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Selected', label: 'Selected' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Offer Sent', label: 'Offer Sent' },
  { value: 'Offer Accepted', label: 'Offer Accepted' },
  { value: 'Joined', label: 'Joined' },
];

const DEPT_OPTIONS = [
  { value: 'all', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Product Platform', label: 'Product Platform' },
  { value: 'Design Systems', label: 'Design Systems' },
  { value: 'Security & Compliance', label: 'Security & Compliance' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'Product Growth', label: 'Product Growth' },
];

export function CandidatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error, warning } = useToast();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobRole: 'Software Engineer',
    department: 'Engineering',
    company: 'Thodar Technologies Inc.',
    location: 'Remote',
    salary: '$100,000 / year',
    joiningDate: 'September 1, 2026',
    status: 'Applied',
    notes: '',
  });

  // Import State
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchCandidates = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/candidates', {
        params: {
          page,
          limit: pagination.limit,
          search,
          status: statusFilter,
          department: deptFilter,
        },
      });

      if (res.success) {
        setCandidates(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, deptFilter, pagination.limit, error]);

  useEffect(() => {
    fetchCandidates(1);
  }, [fetchCandidates]);

  // Check URL query action trigger (e.g. ?action=new or ?action=import)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') {
      setIsAddModalOpen(true);
      setSearchParams({});
    } else if (action === 'import') {
      setIsImportModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c._id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/candidates', formData);
      if (res.success) {
        success('Candidate created successfully!');
        setIsAddModalOpen(false);
        fetchCandidates(1);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          jobRole: 'Software Engineer',
          department: 'Engineering',
          company: 'Thodar Technologies Inc.',
          location: 'Remote',
          salary: '$100,000 / year',
          joiningDate: 'September 1, 2026',
          status: 'Applied',
          notes: '',
        });
      }
    } catch (err) {
      error(err.message || 'Failed to create candidate');
    }
  };

  const handleUpdateCandidate = async (e) => {
    e.preventDefault();
    if (!activeCandidate) return;
    try {
      const res = await api.patch(`/candidates/${activeCandidate._id}`, formData);
      if (res.success) {
        success('Candidate updated successfully!');
        setIsEditModalOpen(false);
        fetchCandidates(pagination.page);
      }
    } catch (err) {
      error(err.message || 'Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      const res = await api.delete(`/candidates/${id}`);
      if (res.success) {
        success('Candidate deleted');
        fetchCandidates(pagination.page);
      }
    } catch (err) {
      error(err.message || 'Failed to delete candidate');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected candidates?`)) return;
    try {
      const res = await api.post('/candidates/bulk-delete', { candidateIds: selectedIds });
      if (res.success) {
        success(res.message);
        setSelectedIds([]);
        fetchCandidates(1);
      }
    } catch (err) {
      error(err.message || 'Bulk delete failed');
    }
  };

  const handleBulkStatus = async (status) => {
    try {
      const res = await api.post('/candidates/bulk-status', { candidateIds: selectedIds, status });
      if (res.success) {
        success(res.message);
        setSelectedIds([]);
        fetchCandidates(pagination.page);
      }
    } catch (err) {
      error(err.message || 'Failed to update status');
    }
  };

  const handleImportCsv = async (e) => {
    e.preventDefault();
    if (!importFile) {
      warning('Please choose a CSV file to import.');
      return;
    }

    try {
      setIsImporting(true);
      const data = new FormData();
      data.append('file', importFile);

      const res = await api.post('/candidates/import', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        setImportResults(res.data);
        success(res.message);
        fetchCandidates(1);
      }
    } catch (err) {
      error(err.message || 'CSV Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCsv = () => {
    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/candidates/export?status=${statusFilter}&department=${deptFilter}`;
    window.open(url, '_blank');
  };

  const openEditModal = (cand) => {
    setActiveCandidate(cand);
    setFormData({
      fullName: cand.fullName || '',
      email: cand.email || '',
      phone: cand.phone || '',
      jobRole: cand.jobRole || '',
      department: cand.department || 'Engineering',
      company: cand.company || 'Thodar Technologies Inc.',
      location: cand.location || 'Remote',
      salary: cand.salary || '',
      joiningDate: cand.joiningDate || '',
      status: cand.status || 'Applied',
      notes: cand.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const openDetailModal = (cand) => {
    setActiveCandidate(cand);
    setIsDetailModalOpen(true);
  };

  const tableColumns = [
    {
      header: (
        <button onClick={handleSelectAll} className="cursor-pointer text-gray-400 hover:text-white p-1">
          {selectedIds.length > 0 && selectedIds.length === candidates.length ? (
            <CheckSquareIcon className="size-4 text-indigo-400" />
          ) : (
            <SquareIcon className="size-4" />
          )}
        </button>
      ),
      width: '40px',
      render: (row) => (
        <button
          onClick={() => handleToggleSelect(row._id)}
          className="cursor-pointer text-gray-400 hover:text-white p-1"
        >
          {selectedIds.includes(row._id) ? (
            <CheckSquareIcon className="size-4 text-indigo-400" />
          ) : (
            <SquareIcon className="size-4" />
          )}
        </button>
      ),
    },
    {
      header: 'Candidate ID',
      accessor: 'candidateId',
      cellClassName: 'font-mono text-xs text-gray-400',
    },
    {
      header: 'Full Name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-white group-hover:text-indigo-300 transition">
            {row.fullName}
          </span>
          <span className="text-xs text-gray-400">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Role & Dept',
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="text-gray-200 font-medium">{row.jobRole}</span>
          <span className="text-gray-400">{row.department}</span>
        </div>
      ),
    },
    {
      header: 'Compensation',
      accessor: 'salary',
      cellClassName: 'text-xs text-gray-300 font-medium',
    },
    {
      header: 'Status',
      render: (row) => <GlassBadge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openDetailModal(row)}
            title="View Details"
            className="p-1.5 rounded-lg glass text-gray-300 hover:text-white transition cursor-pointer"
          >
            <EyeIcon className="size-3.5" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            title="Edit Candidate"
            className="p-1.5 rounded-lg glass text-indigo-300 hover:text-white transition cursor-pointer"
          >
            <Edit2Icon className="size-3.5" />
          </button>
          <button
            onClick={() => handleDeleteCandidate(row._id)}
            title="Delete Candidate"
            className="p-1.5 rounded-lg glass text-rose-400 hover:text-rose-300 transition cursor-pointer"
          >
            <Trash2Icon className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Centered Hero Header - Matching Theme */}
      <section className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="flex items-center gap-2.5 glass px-4 py-1.5 rounded-full text-xs font-medium text-gray-200 shadow-xl border-white/20">
          <SparklesIcon className="size-3.5 text-amber-400" />
          <span>Enterprise Recruitment Email &amp; Document Automation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Candidate{' '}
          <span className="bg-gradient-to-r from-[#D10A8A] via-[#F26A06] to-[#2E08CF] bg-clip-text text-transparent">
            Roster &amp; Pipeline
          </span>
        </h1>

        <p className="text-gray-300 text-sm max-w-xl">
          Search, filter, and batch-personalize recruitment documents and emails for all active applicants.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <GlassButton size="sm" variant="outline" icon={DownloadIcon} onClick={handleExportCsv}>
            Export CSV
          </GlassButton>
          <GlassButton size="sm" variant="glass" icon={UploadCloudIcon} onClick={() => setIsImportModalOpen(true)}>
            Import CSV
          </GlassButton>
          <GlassButton size="sm" variant="gradient" icon={PlusIcon} onClick={() => setIsAddModalOpen(true)}>
            Add Candidate
          </GlassButton>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <GlassCard animate={false} className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <GlassInput
              icon={SearchIcon}
              placeholder="Search by candidate name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <GlassSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />

          <GlassSelect
            options={DEPT_OPTIONS}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          />
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl glass bg-white/10 border border-white/20 text-xs">
            <div className="font-semibold text-white flex items-center gap-2">
              <span className="size-2 rounded-full bg-indigo-400 animate-pulse" />
              {selectedIds.length} candidate(s) selected
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-400">Set Status:</span>
              {['Shortlisted', 'Interview', 'Selected', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleBulkStatus(st)}
                  className="px-2.5 py-1 rounded-lg glass hover:bg-white/20 text-white transition cursor-pointer"
                >
                  {st}
                </button>
              ))}

              <GlassButton size="sm" variant="danger" icon={Trash2Icon} onClick={handleBulkDelete}>
                Delete Selected
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Candidate Data Table */}
      <GlassTable
        columns={tableColumns}
        data={candidates}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchCandidates(page)}
        emptyMessage="No candidates matched your search or filters."
      />

      {/* Add Candidate Modal */}
      <GlassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Candidate"
        subtitle="Fill in candidate details to begin recruitment automation."
      >
        <form onSubmit={handleCreateCandidate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Full Name"
              required
              placeholder="e.g. Inbavarunan"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <GlassInput
              label="Email Address"
              type="email"
              required
              placeholder="e.g. inba@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Phone Number"
              placeholder="e.g. +1 (555) 234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <GlassInput
              label="Job Role"
              required
              placeholder="e.g. Senior Frontend Architect"
              value={formData.jobRole}
              onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassInput
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <GlassInput
              label="Salary / CTC"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
            <GlassInput
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Joining Date"
              placeholder="e.g. October 15, 2026"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            />
            <GlassSelect
              label="Initial Status"
              options={STATUS_OPTIONS.filter((s) => s.value !== 'all')}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
          </div>

          <GlassTextarea
            label="Internal Notes"
            rows={3}
            placeholder="Special qualifications, interviewer comments, interview scores..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <GlassButton variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="gradient">
              Save Candidate
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Edit Candidate Modal */}
      <GlassModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Candidate Details"
        subtitle={`Updating profile for ${formData.fullName}`}
      >
        <form onSubmit={handleUpdateCandidate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <GlassInput
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <GlassInput
              label="Job Role"
              required
              value={formData.jobRole}
              onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassInput
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <GlassInput
              label="Salary / CTC"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
            <GlassInput
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Joining Date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            />
            <GlassSelect
              label="Status"
              options={STATUS_OPTIONS.filter((s) => s.value !== 'all')}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
          </div>

          <GlassTextarea
            label="Internal Notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <GlassButton variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="gradient">
              Update Candidate
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* CSV Import Modal */}
      <GlassModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportResults(null);
          setImportFile(null);
        }}
        title="Import Candidates via CSV"
        subtitle="Upload candidate roster with automated validation, format checks, and duplicate detection."
      >
        <form onSubmit={handleImportCsv} className="space-y-5">
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center space-y-3 glass bg-white/5 hover:border-white/40 transition">
            <UploadCloudIcon className="size-10 text-indigo-400 mx-auto" />
            <div>
              <label htmlFor="csv-upload-input" className="font-semibold text-white hover:underline cursor-pointer">
                Click to browse
              </label>
              <span className="text-gray-400"> or drag and drop your CSV file</span>
            </div>
            <p className="text-xs text-gray-400">
              Required columns: <code>Full Name</code>, <code>Email</code>, <code>Job Role</code> (optional: <code>Salary</code>, <code>Department</code>, <code>Location</code>)
            </p>
            <input
              id="csv-upload-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>

          {importFile && (
            <div className="flex items-center justify-between p-3 rounded-xl glass bg-white/10 text-xs">
              <div className="flex items-center gap-2">
                <FileTextIcon className="size-4 text-indigo-400" />
                <span className="font-medium text-white">{importFile.name}</span>
                <span className="text-gray-400">({(importFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => setImportFile(null)}
                className="text-gray-400 hover:text-rose-400 transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          {/* Import Results Box */}
          {importResults && (
            <div className="space-y-3 p-4 rounded-xl glass bg-white/10 border border-white/20">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Import Summary
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg glass">
                  <div className="text-lg font-bold text-emerald-400">{importResults.imported}</div>
                  <div className="text-[10px] text-gray-300">Imported</div>
                </div>
                <div className="p-2 rounded-lg glass">
                  <div className="text-lg font-bold text-amber-400">{importResults.skipped}</div>
                  <div className="text-[10px] text-gray-300">Skipped</div>
                </div>
                <div className="p-2 rounded-lg glass">
                  <div className="text-lg font-bold text-cyan-400">{importResults.duplicates}</div>
                  <div className="text-[10px] text-gray-300">Duplicates</div>
                </div>
                <div className="p-2 rounded-lg glass">
                  <div className="text-lg font-bold text-rose-400">{importResults.invalid}</div>
                  <div className="text-[10px] text-gray-300">Invalid</div>
                </div>
              </div>

              {importResults.errors && importResults.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 text-xs text-rose-300 pt-2 border-t border-white/10">
                  {importResults.errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <AlertCircleIcon className="size-3 shrink-0" />
                      <span>Row {err.row}: {err.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <GlassButton
              variant="outline"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportResults(null);
                setImportFile(null);
              }}
            >
              Close
            </GlassButton>
            <GlassButton type="submit" variant="gradient" loading={isImporting} disabled={!importFile}>
              Upload & Parse
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Candidate Details Drawer */}
      <GlassModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Candidate Profile"
        subtitle={activeCandidate?.candidateId}
      >
        {activeCandidate && (
          <div className="space-y-6 text-sm">
            <div className="flex items-start justify-between p-4 rounded-2xl glass bg-white/5 border border-white/10">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">{activeCandidate.fullName}</h3>
                <p className="text-xs text-indigo-300 font-medium">{activeCandidate.jobRole}</p>
                <p className="text-xs text-gray-400">{activeCandidate.email} • {activeCandidate.phone || 'No phone'}</p>
              </div>
              <GlassBadge status={activeCandidate.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl glass">
                <div className="text-gray-400">Department</div>
                <div className="font-semibold text-white mt-1">{activeCandidate.department}</div>
              </div>
              <div className="p-3 rounded-xl glass">
                <div className="text-gray-400">Compensation (CTC)</div>
                <div className="font-semibold text-white mt-1">{activeCandidate.salary}</div>
              </div>
              <div className="p-3 rounded-xl glass">
                <div className="text-gray-400">Location</div>
                <div className="font-semibold text-white mt-1">{activeCandidate.location}</div>
              </div>
              <div className="p-3 rounded-xl glass">
                <div className="text-gray-400">Target Joining Date</div>
                <div className="font-semibold text-white mt-1">{activeCandidate.joiningDate || 'Immediate'}</div>
              </div>
              <div className="p-3 rounded-xl glass">
                <div className="text-gray-400">Company</div>
                <div className="font-semibold text-white mt-1">{activeCandidate.company}</div>
              </div>
              <div className="p-3 rounded-xl glass">
                <div className="text-gray-400">Application Date</div>
                <div className="font-semibold text-white mt-1">
                  {activeCandidate.createdAt ? new Date(activeCandidate.createdAt).toLocaleDateString() : 'Recent'}
                </div>
              </div>
            </div>

            {activeCandidate.notes && (
              <div className="p-4 rounded-xl glass space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recruiter Notes</div>
                <p className="text-xs text-gray-200 leading-relaxed">{activeCandidate.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <GlassButton variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </GlassButton>
              <GlassButton
                variant="gradient"
                icon={Edit2Icon}
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openEditModal(activeCandidate);
                }}
              >
                Edit Candidate
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
