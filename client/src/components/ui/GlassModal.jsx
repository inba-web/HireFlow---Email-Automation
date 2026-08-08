import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';

export function GlassModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative w-full ${maxWidth} glass bg-black/90 border border-white/20 rounded-2xl p-6 shadow-2xl z-10 my-8 overflow-hidden`}
          >
            {/* Ambient subtle glow inside modal */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-60 bg-[#D10A8A]/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 size-60 bg-[#2E08CF]/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 glass text-gray-400 hover:text-white transition cursor-pointer"
              >
                <XIcon className="size-4.5" />
              </button>
            </div>

            <div className="relative z-10 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
