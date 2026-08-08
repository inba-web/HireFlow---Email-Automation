import React, { useState, useEffect, useCallback } from 'react';
import {
  ListOrderedIcon,
  SearchIcon,
  FilterIcon,
  RefreshCwIcon,
  MailCheckIcon,
  AlertOctagonIcon,
  EyeIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassTable } from '../components/ui/GlassTable';
import { GlassInput, GlassSelect } from '../components/ui/GlassInput';
import { GlassModal } from '../components/ui/GlassModal';
import { useToast } from '../context/ToastContext';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Queued', label: 'Queued' },
];

export function EmailLogsPage() {
  const { error } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/email-logs', {
        params: {
          page,
          limit: pagination.limit,
          search,
          status: statusFilter,
        },
      });
      if (res.success) {
        setLogs(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch email logs');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.limit, error]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const columns = [
    {
      header: 'Recipient',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-white">{row.candidateName}</span>
          <span className="text-xs text-gray-400">{row.recipient}</span>
        </div>
      ),
    },
    {
      header: 'Subject & Campaign',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-200 font-medium">{row.subject}</span>
          <span className="text-[11px] text-indigo-300">{row.campaignName || 'Direct Dispatch'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => <GlassBadge status={row.status} />,
    },
    {
      header: 'Attempts',
      accessor: 'attemptCount',
      cellClassName: 'font-mono text-xs text-gray-400',
    },
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-xs text-gray-400">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : ''}
        </span>
      ),
    },
    {
      header: 'Details',
      render: (row) => (
        <button
          onClick={() => setSelectedLog(row)}
          title="View Diagnostics"
          className="p-1.5 rounded-lg glass text-gray-300 hover:text-white transition cursor-pointer"
        >
          <EyeIcon className="size-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Email Delivery Logs</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time audit log of all outbound emails, delivery confirmation timestamps, and error diagnostics.
          </p>
        </div>

        <GlassButton size="sm" variant="outline" icon={RefreshCwIcon} onClick={() => fetchLogs(pagination.page)}>
          Refresh Logs
        </GlassButton>
      </div>

      {/* Filter Bar */}
      <GlassCard animate={false} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <GlassInput
              icon={SearchIcon}
              placeholder="Search by recipient, subject, or candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <GlassSelect
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Table */}
      <GlassTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchLogs(page)}
        emptyMessage="No transmission records match your search."
      />

      {/* Log Diagnostics Modal */}
      <GlassModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Email Transmission Diagnostics"
        subtitle={`Message ID: ${selectedLog?.providerMessageId || 'N/A'}`}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl glass bg-white/5 border border-white/10">
              <div>
                <span className="text-gray-400">Recipient:</span>
                <div className="font-semibold text-white mt-0.5">{selectedLog.candidateName} &lt;{selectedLog.recipient}&gt;</div>
              </div>
              <div>
                <span className="text-gray-400">Campaign:</span>
                <div className="font-semibold text-indigo-300 mt-0.5">{selectedLog.campaignName}</div>
              </div>
              <div>
                <span className="text-gray-400">Delivery Status:</span>
                <div className="mt-0.5"><GlassBadge status={selectedLog.status} /></div>
              </div>
              <div>
                <span className="text-gray-400">Attempt Count:</span>
                <div className="font-semibold text-white mt-0.5">{selectedLog.attemptCount}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl glass bg-white/5 border border-white/10 space-y-1">
              <span className="text-gray-400">Subject Line:</span>
              <div className="font-semibold text-white">{selectedLog.subject}</div>
            </div>

            {selectedLog.errorMessage && (
              <div className="p-4 rounded-xl glass bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertOctagonIcon className="size-4" />
                  <span>Error Diagnostics ({selectedLog.errorCode || 'ERROR'})</span>
                </div>
                <div className="font-mono text-[11px] break-all">{selectedLog.errorMessage}</div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-white/10">
              <GlassButton variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
