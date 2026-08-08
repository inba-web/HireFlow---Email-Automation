import React from 'react';
import { Loader2Icon } from 'lucide-react';

export function GlassButton({
  children,
  variant = 'glass',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base font-semibold',
  }[size] || 'px-5 py-2.5 text-sm';

  const variantClasses = {
    glass: 'glass text-white hover:bg-white/20 active:bg-white/10',
    primary: 'bg-white text-gray-950 font-semibold hover:bg-gray-200 active:scale-98 shadow-lg shadow-white/10',
    gradient: 'bg-gradient-to-r from-[#D10A8A] via-[#8504B5] to-[#2E08CF] text-white shadow-lg hover:opacity-95 active:scale-98',
    danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 active:scale-98',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 active:scale-98',
    outline: 'border border-white/30 text-white hover:bg-white/10 active:scale-98',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/10',
  }[variant] || 'glass text-white';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn inline-flex items-center justify-center gap-2 rounded-full cursor-pointer transition-all duration-200 select-none ${sizeClasses} ${variantClasses} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2Icon className="size-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="size-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
