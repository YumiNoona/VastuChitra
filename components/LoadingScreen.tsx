"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 2500; // 2.5s for a punchy feel

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const nextProgress = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => onComplete?.(), 500); // Small buffer at 100%
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
    >
      <div className="relative flex flex-col items-center">
        {/* Progress Number */}
        <motion.span 
          className="absolute -top-8 text-[10px] font-mono text-white/40 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {progress}%
        </motion.span>

        {/* Text Container */}
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-sweep select-none">
            IPDS
          </h1>
          
          {/* Sweeping Line Beam */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className="w-[1px] bg-white h-12 md:h-16 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              style={{
                left: `${progress}%`,
                position: 'absolute'
              }}
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-[11px] uppercase tracking-[0.4em] text-white/20 font-mono"
        >
          Architectural Real-Time Visualization
        </motion.p>
      </div>

      {/* Decorative radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(226,255,175,0.03)_0%,transparent_70%)] pointer-events-none" />
    </motion.div>
  );
}
