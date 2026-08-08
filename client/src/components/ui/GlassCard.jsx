import React from 'react';
import { motion } from 'framer-motion';

export function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  animate = true,
  delay = 0,
  onClick,
  ...props
}) {
  const baseClasses = `glass rounded-2xl p-6 transition-all duration-300 ${
    hoverEffect ? 'hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]' : ''
  } ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, duration: 0.4, ease: 'easeOut' }}
        className={baseClasses}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
}
