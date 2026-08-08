import React, { useState, useEffect } from 'react';
import {
  SettingsIcon,
  Building2Icon,
  MailIcon,
  ShieldCheckIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  SaveIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { useToast } from '../context/ToastContext';

export function SettingsPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyName: 'HireFlow Technologies Inc.',
    companyEmail: 'talent@hireflow.dev',
    companyAddress: '500 Howard Street, Suite 300, San Francisco, CA 94105',
    companyWebsite: 'https://hireflow.dev',
    hrName: 'Sarah Jenkins (Director of Talent Acquisition)',
    hrContact: '+1 (415) 890-1234',
    defaultSmtpFrom: '"HireFlow Talent" <talent@hireflow.dev>',
    rateLimitPerMinute: 60,
  });

  const [systemStatus, setSystemStatus] = useState({
    smtpConfigured: true,
    smtpHost: 'smtp.ethereal.email',
    smtpPort: 587,
    clerkConfigured: true,
    dbConnected: true,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.success) {
          setFormData({
            companyName: res.data.companyName || '',
            companyEmail: res.data.companyEmail || '',
            companyAddress: res.data.companyAddress || '',
            companyWebsite: res.data.companyWebsite || '',
            hrName: res.data.hrName || '',
            hrContact: res.data.hrContact || '',
            defaultSmtpFrom: res.data.defaultSmtpFrom || '',
            rateLimitPerMinute: res.data.rateLimitPerMinute || 60,
          });

          setSystemStatus({
            smtpConfigured: res.data.smtpConfigured,
            smtpHost: res.data.smtpHost,
            smtpPort: res.data.smtpPort,
            clerkConfigured: res.data.clerkConfigured,
            dbConnected: res.data.dbConnected,
          });
        }
      } catch (err) {
        console.warn('Settings load error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.patch('/settings', formData);
      if (res.success) {
        success('Company settings saved successfully');
      }
    } catch (err) {
      error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">System & Organization Settings</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Configure default company branding, HR signatory details, and email delivery pipeline.
          </p>
        </div>
      </div>

      {/* System Health Diagnostics */}
      <GlassCard animate={false} className="p-5 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">System Pipeline Status</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl glass bg-white/5 flex items-center gap-3">
            <CheckCircle2Icon className="size-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Database Engine</div>
              <div className="text-[11px] text-gray-400">MongoDB Atlas Cluster</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl glass bg-white/5 flex items-center gap-3">
            <CheckCircle2Icon className="size-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Email Provider</div>
              <div className="text-[11px] text-gray-400">{systemStatus.smtpHost}:{systemStatus.smtpPort}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl glass bg-white/5 flex items-center gap-3">
            <CheckCircle2Icon className="size-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Queue Architecture</div>
              <div className="text-[11px] text-gray-400">BullMQ Async Worker</div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Form */}
      <GlassCard animate={false} className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Company Branding & Defaults</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              These variables automatically populate dynamic tags like <code className="text-indigo-300">{"{{companyName}}"}</code> and <code className="text-indigo-300">{"{{companyAddress}}"}</code> in documents and email templates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Company Name"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <GlassInput
              label="Company Recruitment Email"
              type="email"
              required
              value={formData.companyEmail}
              onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
            />
          </div>

          <GlassInput
            label="Corporate Headquarters Address"
            value={formData.companyAddress}
            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Website URL"
              value={formData.companyWebsite}
              onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
            />
            <GlassInput
              label="Default Sender Header (FROM)"
              value={formData.defaultSmtpFrom}
              onChange={(e) => setFormData({ ...formData, defaultSmtpFrom: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-white/10 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Authorized HR Signatory</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Official signatory details rendered onto generated Offer Letters and Certificates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput
                label="Signatory Name & Title"
                required
                value={formData.hrName}
                onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
              />
              <GlassInput
                label="Signatory Contact Phone"
                value={formData.hrContact}
                onChange={(e) => setFormData({ ...formData, hrContact: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <GlassButton type="submit" variant="gradient" icon={SaveIcon} loading={saving}>
              Save Settings
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
