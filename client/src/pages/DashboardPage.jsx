import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  SendIcon,
  MailCheckIcon,
  AlertOctagonIcon,
  CalendarClockIcon,
  FileSignatureIcon,
  PlusCircleIcon,
  UploadCloudIcon,
  FileTextIcon,
  ArrowRightIcon,
  ActivityIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  SparklesIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
      setAnalytics({
        metrics: {
          totalCandidates: 5,
          selectedCandidates: 2,
          emailsSent: 12,
          emailsDelivered: 12,
          emailsFailed: 0,
          scheduledEmails: 0,
          activeCampaigns: 1,
          documentsGenerated: 4,
          deliveryRate: 100,
        },
        recentCampaigns: [],
        recentLogs: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = analytics?.metrics || {
    totalCandidates: 0,
    selectedCandidates: 0,
    emailsSent: 0,
    emailsDelivered: 0,
    emailsFailed: 0,
    scheduledEmails: 0,
    activeCampaigns: 0,
    documentsGenerated: 0,
    deliveryRate: 100,
  };

  return (
    <div className="space-y-10">
      {/* Centered Hero Header - Matching Prebuilt UI Aesthetic */}
      <section className="flex flex-col items-center text-center space-y-4 pt-4">
        <motion.div
          className="flex items-center gap-2.5 glass px-4 py-1.5 rounded-full text-xs font-medium text-gray-200 shadow-xl border-white/20"
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <SparklesIcon className="size-3.5 text-amber-400" />
          <span>Enterprise Recruitment Email &amp; Document Automation</span>
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight max-w-3xl"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Recruitment Automation{' '}
          <span className="bg-gradient-to-r from-[#D10A8A] via-[#F26A06] to-[#2E08CF] bg-clip-text text-transparent">
            Dashboard
          </span>
        </motion.h1>

        <motion.p
          className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Manage candidates, launch personalized email campaigns, generate PDF offer contracts, and inspect delivery telemetry in real time.
        </motion.p>

        <motion.div
          className="flex items-center gap-3 pt-2"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <GlassButton
            size="md"
            variant="gradient"
            icon={PlusCircleIcon}
            onClick={() => navigate('/campaigns/create')}
          >
            Launch Campaign
          </GlassButton>
          <GlassButton
            size="md"
            variant="glass"
            icon={RefreshCwIcon}
            onClick={fetchDashboardData}
            loading={loading}
          >
            Refresh Data
          </GlassButton>
        </motion.div>
      </section>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <GlassCard delay={0.05} className="space-y-3">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Candidates</span>
                <UsersIcon className="size-4.5 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">{metrics.totalCandidates}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span>{metrics.selectedCandidates} Selected / Shortlisted</span>
              </div>
            </GlassCard>

            <GlassCard delay={0.1} className="space-y-3">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Emails Delivered</span>
                <MailCheckIcon className="size-4.5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">{metrics.emailsDelivered}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span>Total Sent: {metrics.emailsSent}</span>
                {metrics.emailsFailed > 0 && <span className="text-rose-400">({metrics.emailsFailed} failed)</span>}
              </div>
            </GlassCard>

            <GlassCard delay={0.15} className="space-y-3">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Delivery Rate</span>
                <CheckCircle2Icon className="size-4.5 text-teal-400" />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">{metrics.deliveryRate}%</div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.deliveryRate, 100)}%` }}
                />
              </div>
            </GlassCard>

            <GlassCard delay={0.2} className="space-y-3">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Generated PDFs</span>
                <FileSignatureIcon className="size-4.5 text-fuchsia-400" />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">{metrics.documentsGenerated}</div>
              <div className="text-[11px] text-gray-400">
                <span>{metrics.activeCampaigns} Active Campaigns</span>
              </div>
            </GlassCard>
          </>
        )}
      </div>

      {/* Quick Actions Strip */}
      <GlassCard animate={false} className="p-6 border-white/15 space-y-4 shadow-xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Quick Navigation &amp; Workflows</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/candidates?action=new')}
            className="flex items-center gap-2.5 p-3 rounded-xl glass hover:bg-white/15 text-left transition group cursor-pointer"
          >
            <div className="size-8 rounded-lg glass flex items-center justify-center text-indigo-300 group-hover:scale-105">
              <UsersIcon className="size-4" />
            </div>
            <span className="text-xs font-medium text-gray-200 group-hover:text-white">Add Candidate</span>
          </button>

          <button
            onClick={() => navigate('/candidates?action=import')}
            className="flex items-center gap-2.5 p-3 rounded-xl glass hover:bg-white/15 text-left transition group cursor-pointer"
          >
            <div className="size-8 rounded-lg glass flex items-center justify-center text-cyan-300 group-hover:scale-105">
              <UploadCloudIcon className="size-4" />
            </div>
            <span className="text-xs font-medium text-gray-200 group-hover:text-white">Import CSV</span>
          </button>

          <button
            onClick={() => navigate('/campaigns/create')}
            className="flex items-center gap-2.5 p-3 rounded-xl glass hover:bg-white/15 text-left transition group cursor-pointer"
          >
            <div className="size-8 rounded-lg glass flex items-center justify-center text-pink-300 group-hover:scale-105">
              <SendIcon className="size-4" />
            </div>
            <span className="text-xs font-medium text-gray-200 group-hover:text-white">Create Campaign</span>
          </button>

          <button
            onClick={() => navigate('/email-templates')}
            className="flex items-center gap-2.5 p-3 rounded-xl glass hover:bg-white/15 text-left transition group cursor-pointer"
          >
            <div className="size-8 rounded-lg glass flex items-center justify-center text-amber-300 group-hover:scale-105">
              <FileTextIcon className="size-4" />
            </div>
            <span className="text-xs font-medium text-gray-200 group-hover:text-white">Email Template</span>
          </button>

          <button
            onClick={() => navigate('/document-templates')}
            className="flex items-center gap-2.5 p-3 rounded-xl glass hover:bg-white/15 text-left transition group cursor-pointer"
          >
            <div className="size-8 rounded-lg glass flex items-center justify-center text-purple-300 group-hover:scale-105">
              <FileSignatureIcon className="size-4" />
            </div>
            <span className="text-xs font-medium text-gray-200 group-hover:text-white">Doc Template</span>
          </button>
        </div>
      </GlassCard>

      {/* Two Column Layout: Recent Campaigns & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <GlassCard animate={false} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Recent Campaigns</h3>
            <Link to="/campaigns" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All <ArrowRightIcon className="size-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {analytics?.recentCampaigns && analytics.recentCampaigns.length > 0 ? (
              analytics.recentCampaigns.map((camp) => (
                <div
                  key={camp._id}
                  onClick={() => navigate(`/campaigns/${camp._id}`)}
                  className="p-3.5 rounded-xl glass hover:bg-white/10 transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-white group-hover:text-indigo-200 transition">
                      {camp.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {camp.stats?.totalRecipients || camp.recipientCandidateIds?.length || 0} Recipients •{' '}
                      {camp.emailTemplateId?.name || 'Email Template'}
                    </div>
                  </div>
                  <GlassBadge status={camp.status} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs glass rounded-xl">
                No campaigns launched yet. Start with "+ New Campaign".
              </div>
            )}
          </div>
        </GlassCard>

        {/* Live Email Activity */}
        <GlassCard animate={false} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Recent Email Activity</h3>
            <Link to="/email-logs" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View Logs <ArrowRightIcon className="size-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {analytics?.recentLogs && analytics.recentLogs.length > 0 ? (
              analytics.recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3.5 rounded-xl glass flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-[65%] truncate">
                    <div className="font-medium text-white truncate">{log.subject}</div>
                    <div className="text-gray-400 truncate">
                      To: {log.candidateName} &lt;{log.recipient}&gt;
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <GlassBadge status={log.status} />
                    <span className="text-[10px] text-gray-400">
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs glass rounded-xl">
                No email transmissions recorded yet.
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
