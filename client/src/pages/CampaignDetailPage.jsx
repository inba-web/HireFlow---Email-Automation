import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SendIcon,
  UsersIcon,
  FileTextIcon,
  FileSignatureIcon,
  PlayIcon,
  XCircleIcon,
  RotateCcwIcon,
  ArrowLeftIcon,
  MailCheckIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassTable } from '../components/ui/GlassTable';
import { useToast } from '../context/ToastContext';

export function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [campaign, setCampaign] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const [campRes, logsRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get('/email-logs', { params: { campaignId: id, limit: 100 } }),
      ]);

      if (campRes.success) setCampaign(campRes.data);
      if (logsRes.success) setLogs(logsRes.data);
    } catch (err) {
      error(err.message || 'Failed to fetch campaign details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetails();
    // Polling while campaign is processing
    const interval = setInterval(() => {
      if (campaign?.status === 'Processing') {
        fetchCampaignDetails();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [id, campaign?.status]);

  const handleSend = async () => {
    try {
      const res = await api.post(`/campaigns/${id}/send`);
      if (res.success) {
        success(res.message);
        fetchCampaignDetails();
      }
    } catch (err) {
      error(err.message || 'Failed to dispatch campaign');
    }
  };

  const handleRetry = async () => {
    try {
      const res = await api.post(`/campaigns/${id}/retry`);
      if (res.success) {
        success(res.message);
        fetchCampaignDetails();
      }
    } catch (err) {
      error(err.message || 'Failed to retry jobs');
    }
  };

  if (loading && !campaign) {
    return <div className="p-12 text-center text-gray-400 glass rounded-2xl animate-pulse">Loading campaign details...</div>;
  }

  if (!campaign) {
    return (
      <div className="p-12 text-center text-gray-400 glass rounded-2xl space-y-3">
        <h3 className="text-lg font-bold text-white">Campaign Not Found</h3>
        <GlassButton variant="outline" icon={ArrowLeftIcon} onClick={() => navigate('/campaigns')}>
          Back to Campaigns
        </GlassButton>
      </div>
    );
  }

  const total = campaign.stats?.totalRecipients || campaign.recipientCandidateIds?.length || 0;
  const sent = campaign.stats?.sent || 0;
  const delivered = campaign.stats?.delivered || 0;
  const failed = campaign.stats?.failed || 0;
  const progress = total > 0 ? Math.round((sent / total) * 100) : 0;

  const logColumns = [
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
      header: 'Subject',
      accessor: 'subject',
      cellClassName: 'text-xs text-gray-300',
    },
    {
      header: 'Status',
      render: (row) => <GlassBadge status={row.status} />,
    },
    {
      header: 'Attempt',
      accessor: 'attemptCount',
      cellClassName: 'text-xs font-mono text-gray-400',
    },
    {
      header: 'Sent At',
      render: (row) => (
        <span className="text-xs text-gray-400">
          {row.sentAt ? new Date(row.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <GlassButton size="sm" variant="outline" icon={ArrowLeftIcon} onClick={() => navigate('/campaigns')}>
            Campaigns
          </GlassButton>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{campaign.name}</h1>
            <p className="text-xs text-gray-400">{campaign.description || 'Automated recruitment communication campaign'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {campaign.status === 'Draft' && (
            <GlassButton size="sm" variant="gradient" icon={PlayIcon} onClick={handleSend}>
              Dispatch Campaign
            </GlassButton>
          )}
          {failed > 0 && (
            <GlassButton size="sm" variant="glass" icon={RotateCcwIcon} onClick={handleRetry}>
              Retry Failed ({failed})
            </GlassButton>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard animate={false} className="p-4 text-center space-y-1">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-xs text-gray-400">Total Recipients</div>
        </GlassCard>

        <GlassCard animate={false} className="p-4 text-center space-y-1">
          <div className="text-2xl font-bold text-emerald-400">{delivered}</div>
          <div className="text-xs text-gray-400">Delivered</div>
        </GlassCard>

        <GlassCard animate={false} className="p-4 text-center space-y-1">
          <div className="text-2xl font-bold text-rose-400">{failed}</div>
          <div className="text-xs text-gray-400">Failed</div>
        </GlassCard>

        <GlassCard animate={false} className="p-4 text-center space-y-1">
          <div className="text-2xl font-bold text-indigo-300">{progress}%</div>
          <div className="text-xs text-gray-400">Completion</div>
        </GlassCard>
      </div>

      {/* Progress & Template Info */}
      <GlassCard animate={false} className="p-5 space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-300">Campaign Execution Status</span>
          <GlassBadge status={campaign.status} />
        </div>

        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#D10A8A] via-[#8504B5] to-[#2E08CF] h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl glass bg-white/5 space-y-1">
            <div className="text-gray-400">Email Template:</div>
            <div className="font-semibold text-white">{campaign.emailTemplateId?.name || 'Selected Template'}</div>
          </div>
          <div className="p-3 rounded-xl glass bg-white/5 space-y-1">
            <div className="text-gray-400">Document Template:</div>
            <div className="font-semibold text-indigo-300">{campaign.documentTemplateId?.name || 'None (Email Only)'}</div>
          </div>
        </div>
      </GlassCard>

      {/* Live Email Log Records */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Delivery Log Records</h3>
        <GlassTable
          columns={logColumns}
          data={logs}
          emptyMessage="No transmission logs for this campaign yet."
        />
      </div>
    </div>
  );
}
