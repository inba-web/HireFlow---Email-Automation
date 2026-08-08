import React from 'react';

const STATUS_CONFIGS = {
  // Candidate Statuses
  Applied: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  Shortlisted: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
  Interview: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  Selected: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  Rejected: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  'Offer Sent': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  'Offer Accepted': { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' },
  Joined: { bg: 'bg-emerald-500/20', text: 'text-emerald-200', border: 'border-emerald-400/40' },

  // Campaign / Email Statuses
  Draft: { bg: 'bg-gray-500/15', text: 'text-gray-300', border: 'border-gray-500/30' },
  Queued: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  Processing: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  Scheduled: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  Completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  'Partially Completed': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  Failed: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  Cancelled: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' },
  Sent: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  Delivered: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  Retrying: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },

  // Roles
  Admin: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  'HR Manager': { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
  'HR Executive': { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
};

export function GlassBadge({ status = 'Draft', variant, className = '' }) {
  const config = STATUS_CONFIGS[status] || {
    bg: 'bg-white/10',
    text: 'text-gray-200',
    border: 'border-white/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-md ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
