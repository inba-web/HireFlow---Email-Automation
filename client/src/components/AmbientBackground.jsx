import React from 'react';
import { motion } from 'framer-motion';

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-20 pointer-events-none select-none bg-black">
      {/* Orb 1: Glowing Rose / Magenta (#D10A8A) on the left-center */}
      <motion.div
        className="absolute rounded-full top-[15%] left-[15%] -translate-x-1/2 w-[620px] h-[620px] bg-[#D10A8A] blur-[140px] opacity-85"
        animate={{
          x: [-35, 35, -35],
          y: [-25, 30, -25],
          scale: [1, 1.15, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orb 2: Radiant Warm Sunset Orange (#F26A06) top-center aura */}
      <motion.div
        className="absolute rounded-full -top-[120px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-[#F26A06] blur-[150px] opacity-85"
        animate={{
          y: [-20, 25, -20],
          scale: [0.95, 1.18, 0.95],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orb 3: Deep Electric Blue / Indigo (#2E08CF) on the right */}
      <motion.div
        className="absolute rounded-full top-[18%] right-[-5%] w-[680px] h-[680px] bg-[#2E08CF] blur-[150px] opacity-85"
        animate={{
          x: [30, -40, 30],
          y: [20, -30, 20],
          scale: [1.1, 0.95, 1.1],
          opacity: [0.75, 0.95, 0.75],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Subtle Bottom Ambient Reflector */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
    </div>
  );
}
