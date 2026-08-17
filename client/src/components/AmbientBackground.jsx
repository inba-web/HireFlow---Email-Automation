import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function AmbientBackground() {
  const shouldReduceMotion = useReducedMotion();

  // On low-end / reduced motion systems, we use static values to save GPU/CPU cycles
  const orb1Animation = shouldReduceMotion
    ? { x: 0, y: 0, scale: 1, opacity: 0.9 }
    : {
        x: [-30, 30, -30],
        y: [-20, 25, -20],
        scale: [1, 1.12, 1],
        opacity: [0.85, 1, 0.85],
      };

  const orb2Animation = shouldReduceMotion
    ? { x: 0, y: 0, scale: 1, opacity: 0.85 }
    : {
        x: [25, -35, 25],
        y: [20, -25, 20],
        scale: [1.08, 0.95, 1.08],
        opacity: [0.8, 1, 0.8],
      };

  const orb3Animation = shouldReduceMotion
    ? { y: 0, scale: 1, opacity: 0.85 }
    : {
        y: [-15, 20, -15],
        scale: [0.95, 1.15, 0.95],
        opacity: [0.75, 0.95, 0.75],
      };

  return (
    <div className="fixed inset-0 overflow-hidden -z-20 pointer-events-none select-none bg-black">
      {/* Orb 1: Magenta / Pink (#D10A8A) with organic floating loop */}
      <motion.div
        className="absolute rounded-full top-80 left-2/5 -translate-x-1/2 size-130 bg-[#D10A8A] blur-[110px]"
        style={{ willChange: 'transform, opacity' }}
        animate={orb1Animation}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orb 2: Deep Electric Blue / Purple (#2E08CF) with counter-balance loop */}
      <motion.div
        className="absolute rounded-full top-80 right-0 -translate-x-1/2 size-130 bg-[#2E08CF] blur-[120px]"
        style={{ willChange: 'transform, opacity' }}
        animate={orb2Animation}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orb 3: Radiant Sunrise Orange (#F26A06) pulsing at the top */}
      <motion.div
        className="absolute rounded-full top-0 left-1/2 -translate-x-1/2 size-130 bg-[#F26A06] blur-[110px]"
        style={{ willChange: 'transform, opacity' }}
        animate={orb3Animation}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Subtle Bottom Ambient Reflector */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
    </div>
  );
}
