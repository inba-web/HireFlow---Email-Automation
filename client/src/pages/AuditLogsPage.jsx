import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheckIcon,
  SearchIcon,
  RefreshCwIcon,
  LockIcon,
  UserCheckIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassTable } from '../components/ui/GlassTable';
import { GlassInput, GlassSelect } from '../components/ui/GlassInput';
import { useToast } from '../context/ToastContext';

const ACTION_FILTERS = [
  { value: 'all', label: 'All Security Actions' },
  { value: 'CAMPAIGN_QUEUED', label: 'Campaign Queued' },
  { value: 'CAMPAIGN_CREATED', label: 'Campaign Created' },
  { value: 'CANDIDATE_CREATED', label: 'Candidate Created' },
  { value: 'CANDIDATES_IMPORTED_CSV', label: 'Candidates CSV Imported' },
  { value: 'EMAIL_TEMPLATE_CREATED', label: 'Email Template Created' },
  { value: 'DOCUMENT_TEMPLATE_CREATED', label: 'Doc Template Created' },
  { value: 'SETTINGS_UPDATED', label: 'Settings Updated' },
  { value: 'USER_SYNCED', label: 'User Synced' },
];

export function AuditLogsPage() {
  const { error } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, pages: 1 });

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchAuditLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs', {
        params: {
          page,
          limit: pagination.limit,
          search,
          action: actionFilter,
        },
      });
      if (res.success) {
        setLogs(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, pagination.limit, error]);

  useEffect(() => {
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  const columns = [
    {
      header: 'Action',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-indigo-300 glass px-2.5 py-1 rounded-lg">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Resource',
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-white">{row.resourceType}</span>
          <span className="text-gray-400 font-mono text-[11px]">{row.resourceId || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'User',
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-white">{row.userName || 'System'}</span>
          <span className="text-gray-400">{row.userEmail}</span>
        </div>
      ),
    },
    {
      header: 'Details',
      render: (row) => (
        <span className="text-xs text-gray-300 font-mono line-clamp-1 max-w-xs">
          {row.details ? JSON.stringify(row.details) : '-'}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-xs text-gray-400">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : ''}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Immutable Audit Trail</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            OWASP-compliant immutable log recording administrative events, candidate imports, and campaign dispatches.
          </p>
        </div>

        <GlassButton size="sm" variant="outline" icon={RefreshCwIcon} onClick={() => fetchAuditLogs(pagination.page)}>
          Refresh Trail
        </GlassButton>
      </div>

      {/* Filter Toolbar */}
      <GlassCard animate={false} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <GlassInput
              icon={SearchIcon}
              placeholder="Search by user email, name, or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <GlassSelect
            options={ACTION_FILTERS}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Table */}
      <GlassTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchAuditLogs(page)}
        emptyMessage="No audit logs matched your search filter."
      />
    </div>
  );
}
