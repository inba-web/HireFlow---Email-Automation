import React from 'react';

export function GlassInput({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  required,
  ...props
}) {
  const inputId = id || `input_${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-gray-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-gray-400">
            <Icon className="size-4" />
          </div>
        )}
        <input
          id={inputId}
          required={required}
          className={`w-full glass bg-white/5 border border-white/15 focus:border-white/40 focus:bg-white/10 rounded-xl py-2.5 text-sm text-white placeholder-gray-500 outline-none transition duration-200 ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } ${error ? 'border-rose-500/60 focus:border-rose-400' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400">{helperText}</p>}
    </div>
  );
}

export function GlassTextarea({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  required,
  ...props
}) {
  const textareaId = id || `textarea_${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-gray-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={`w-full glass bg-white/5 border border-white/15 focus:border-white/40 focus:bg-white/10 rounded-xl p-3.5 text-sm text-white placeholder-gray-500 outline-none transition duration-200 resize-y ${
          error ? 'border-rose-500/60 focus:border-rose-400' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400">{helperText}</p>}
    </div>
  );
}

export function GlassSelect({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  required,
  ...props
}) {
  const selectId = id || `select_${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-gray-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`w-full glass bg-zinc-900 border border-white/15 focus:border-white/40 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition duration-200 cursor-pointer ${
          error ? 'border-rose-500/60' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white py-1">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400">{helperText}</p>}
    </div>
  );
}
