import React, { useState, useEffect } from 'react';
import {
  BarChart3Icon,
  TrendingUpIcon,
  UsersIcon,
  MailCheckIcon,
  FileSignatureIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  SparklesIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useToast } from '../context/ToastContext';

export function AnalyticsPage() {
  const { error } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const metrics = data?.metrics || {
    totalCandidates: 0,
    selectedCandidates: 0,
    emailsSent: 0,
    emailsDelivered: 0,
    emailsFailed: 0,
    deliveryRate: 100,
  };

  const statusDistribution = data?.statusDistribution || [
    { status: 'Applied', count: 12 },
    { status: 'Shortlisted', count: 8 },
    { status: 'Interview', count: 6 },
    { status: 'Selected', count: 4 },
    { status: 'Offer Sent', count: 3 },
    { status: 'Joined', count: 2 },
  ];

  const maxCount = Math.max(...statusDistribution.map((s) => s.count), 1);

  return (
    <div className="space-y-8">
      {/* Centered Hero Header - Matching Theme */}
      <section className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="flex items-center gap-2.5 glass px-4 py-1.5 rounded-full text-xs font-medium text-gray-200 shadow-xl border-white/20">
          <SparklesIcon className="size-3.5 text-amber-400" />
          <span>Enterprise Recruitment Email &amp; Document Automation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Recruitment{' '}
          <span className="bg-gradient-to-r from-[#D10A8A] via-[#F26A06] to-[#2E08CF] bg-clip-text text-transparent">
            Analytics &amp; Conversion
          </span>
        </h1>

        <p className="text-gray-300 text-sm max-w-xl">
          Delivery reliability, candidate pipeline funnel velocity, and conversion telemetry.
        </p>
      </section>

      <div className="flex justify-center">
        <GlassButton size="sm" variant="outline" icon={RefreshCwIcon} onClick={fetchAnalytics} loading={loading}>
          Refresh Analytics
        </GlassButton>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard animate={false} className="p-5 space-y-2">
          <div className="text-xs uppercase tracking-wider text-gray-400">Total Applicants</div>
          <div className="text-3xl font-bold text-white">{metrics.totalCandidates}</div>
          <div className="text-xs text-indigo-300">Across all roles</div>
        </GlassCard>

        <GlassCard animate={false} className="p-5 space-y-2">
          <div className="text-xs uppercase tracking-wider text-gray-400">Total Dispatched</div>
          <div className="text-3xl font-bold text-white">{metrics.emailsSent}</div>
          <div className="text-xs text-emerald-400">{metrics.emailsDelivered} confirmed delivered</div>
        </GlassCard>

        <GlassCard animate={false} className="p-5 space-y-2">
          <div className="text-xs uppercase tracking-wider text-gray-400">Delivery Success</div>
          <div className="text-3xl font-bold text-teal-400">{metrics.deliveryRate}%</div>
          <div className="text-xs text-gray-400">{metrics.emailsFailed} bounces / failures</div>
        </GlassCard>

        <GlassCard animate={false} className="p-5 space-y-2">
          <div className="text-xs uppercase tracking-wider text-gray-400">Generated Offers</div>
          <div className="text-3xl font-bold text-fuchsia-400">{metrics.documentsGenerated}</div>
          <div className="text-xs text-gray-400">PDF documents attached</div>
        </GlassCard>
      </div>

      {/* Recruitment Funnel Chart */}
      <GlassCard animate={false} className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white">Recruitment Conversion Pipeline</h3>
          <p className="text-xs text-gray-400 mt-0.5">Candidate distribution by recruitment workflow stage.</p>
        </div>

        <div className="space-y-4">
          {statusDistribution.map((item, idx) => {
            const percentage = Math.round((item.count / maxCount) * 100);
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">{item.status}</span>
                  <span className="text-gray-400">{item.count} Candidates</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D10A8A] via-[#8504B5] to-[#2E08CF] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 8)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
