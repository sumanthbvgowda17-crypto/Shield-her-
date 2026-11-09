import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SOSButton({ onTrigger, size = 'default' }) {
  const [isPressing, setIsPressing] = useState(false);
  
  const handlePressStart = () => setIsPressing(true);
  const handlePressEnd = () => setIsPressing(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (onTrigger) onTrigger();
  };

  const dimensions = size === 'large' ? 'w-64 h-64' : 'w-48 h-48';

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.25, 0.6, 0.25],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute ${dimensions} bg-danger rounded-full blur-3xl pointer-events-none`}
        />
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleClick}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          y: [0, -10, 0] // Floating animation
        }}
        transition={{
          y: {
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className={`relative ${dimensions} rounded-full bg-gradient-to-b from-red-500 to-danger shadow-[0_20px_50px_rgba(220,38,38,0.6)] border-4 border-danger/60 flex items-center justify-center overflow-hidden cursor-pointer select-none group`}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
        <div className="absolute inset-0 rounded-full border-8 border-white/15 scale-90"></div>
        
        <span className="relative z-10 text-white font-black text-6xl tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          SOS
        </span>

        {isPressing && (
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-white rounded-full pointer-events-none"
          />
        )}
      </motion.button>
    </div>
  );
}
