import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SendIcon,
  PlusIcon,
  SearchIcon,
  RefreshCwIcon,
  PlayIcon,
  XCircleIcon,
  RotateCcwIcon,
  Trash2Icon,
  EyeIcon,
  CalendarIcon,
  UsersIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassInput, GlassSelect } from '../components/ui/GlassInput';
import { useToast } from '../context/ToastContext';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Queued', label: 'Queued' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export function CampaignsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/campaigns', {
        params: { search, status: statusFilter },
      });
      if (res.success) {
        setCampaigns(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [search, statusFilter]);

  const handleSend = async (id) => {
    try {
      const res = await api.post(`/campaigns/${id}/send`);
      if (res.success) {
        success(res.message);
        fetchCampaigns();
      }
    } catch (err) {
      error(err.message || 'Failed to dispatch campaign');
    }
  };

  const handleCancel = async (id) => {
    try {
      const res = await api.post(`/campaigns/${id}/cancel`);
      if (res.success) {
        success(res.message);
        fetchCampaigns();
      }
    } catch (err) {
      error(err.message || 'Failed to cancel campaign');
    }
  };

  const handleRetry = async (id) => {
    try {
      const res = await api.post(`/campaigns/${id}/retry`);
      if (res.success) {
        success(res.message);
        fetchCampaigns();
      }
    } catch (err) {
      error(err.message || 'Retry dispatch failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const res = await api.delete(`/campaigns/${id}`);
      if (res.success) {
        success('Campaign deleted successfully');
        fetchCampaigns();
      }
    } catch (err) {
      error(err.message || 'Failed to delete campaign');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Recruitment Campaigns</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Monitor bulk automated email deliveries, track queue worker status, and analyze responses.
          </p>
        </div>

        <GlassButton size="sm" variant="gradient" icon={PlusIcon} onClick={() => navigate('/campaigns/create')}>
          Create Campaign
        </GlassButton>
      </div>

      {/* Filter Toolbar */}
      <GlassCard animate={false} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <GlassInput
              icon={SearchIcon}
              placeholder="Search campaigns by name..."
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

      {/* Campaign Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 glass rounded-2xl animate-pulse">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center text-gray-400 glass rounded-2xl space-y-4">
          <SendIcon className="size-10 text-gray-500 mx-auto" />
          <div className="text-base font-semibold text-white">No campaigns found</div>
          <p className="text-xs text-gray-400">Launch a new recruitment campaign to begin asynchronous email dispatch.</p>
          <GlassButton size="sm" variant="gradient" icon={PlusIcon} onClick={() => navigate('/campaigns/create')}>
            Launch First Campaign
          </GlassButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {campaigns.map((camp) => {
            const totalRecipients = camp.stats?.totalRecipients || camp.recipientCandidateIds?.length || 0;
            const sent = camp.stats?.sent || 0;
            const delivered = camp.stats?.delivered || 0;
            const failed = camp.stats?.failed || 0;
            const progress = totalRecipients > 0 ? Math.round((sent / totalRecipients) * 100) : 0;

            return (
              <GlassCard key={camp._id} className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3
                        onClick={() => navigate(`/campaigns/${camp._id}`)}
                        className="text-lg font-bold text-white hover:text-indigo-300 transition cursor-pointer"
                      >
                        {camp.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{camp.description || 'No description provided.'}</p>
                    </div>
                    <GlassBadge status={camp.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl glass bg-white/5">
                      <div className="text-gray-400">Email Template</div>
                      <div className="font-semibold text-white truncate mt-0.5">
                        {camp.emailTemplateId?.name || 'Direct Send'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl glass bg-white/5">
                      <div className="text-gray-400">Document PDF</div>
                      <div className="font-semibold text-indigo-300 truncate mt-0.5">
                        {camp.documentTemplateId?.name || 'None'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>Delivery Progress</span>
                      <span className="font-semibold text-white">{progress}% ({sent}/{totalRecipients})</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#D10A8A] via-[#8504B5] to-[#2E08CF] h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-[11px] text-gray-400">
                    {camp.createdAt ? new Date(camp.createdAt).toLocaleDateString() : ''}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate(`/campaigns/${camp._id}`)}
                      title="View Campaign Details"
                      className="p-1.5 rounded-lg glass text-gray-300 hover:text-white transition cursor-pointer"
                    >
                      <EyeIcon className="size-3.5" />
                    </button>

                    {(camp.status === 'Draft' || camp.status === 'Scheduled') && (
                      <button
                        onClick={() => handleSend(camp._id)}
                        title="Send Campaign"
                        className="p-1.5 rounded-lg glass text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                      >
                        <PlayIcon className="size-3.5" />
                      </button>
                    )}

                    {camp.status === 'Processing' && (
                      <button
                        onClick={() => handleCancel(camp._id)}
                        title="Cancel Campaign"
                        className="p-1.5 rounded-lg glass text-amber-400 hover:text-amber-300 transition cursor-pointer"
                      >
                        <XCircleIcon className="size-3.5" />
                      </button>
                    )}

                    {failed > 0 && (
                      <button
                        onClick={() => handleRetry(camp._id)}
                        title="Retry Failed Dispatches"
                        className="p-1.5 rounded-lg glass text-cyan-300 hover:text-cyan-200 transition cursor-pointer"
                      >
                        <RotateCcwIcon className="size-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(camp._id)}
                      title="Delete Campaign"
                      className="p-1.5 rounded-lg glass text-rose-400 hover:text-rose-300 transition cursor-pointer"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
