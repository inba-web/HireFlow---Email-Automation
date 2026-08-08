import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-white/10 rounded-xl ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl glass border border-white/10 ${className}`}>
      {Icon && (
        <div className="p-4 rounded-2xl glass mb-4 text-gray-300">
          <Icon className="size-8 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
