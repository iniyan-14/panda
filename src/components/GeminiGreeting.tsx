import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { DAILY_WISHES } from '../constants';
import { STATIC_DAILY_WHISPERS } from '../data/staticData';

export default function GeminiGreeting() {
  const [wish, setWish] = useState<string>("");

  useEffect(() => {
    // Priority 1: Static Whispers based on today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    if (STATIC_DAILY_WHISPERS[today]) {
      setWish(STATIC_DAILY_WHISPERS[today]);
      return;
    }

    // Priority 2: Fallback to a random wish from constants
    const randomIndex = Math.floor(Math.random() * DAILY_WISHES.length);
    setWish(DAILY_WISHES[randomIndex]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-8 rounded-[2rem] bg-white/30 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(255,255,255,0.1)] group overflow-hidden"
    >
      {/* Premium Glassmorphism Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200/20 blur-3xl -ml-16 -mt-16 rounded-full" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-200/20 blur-3xl -mr-16 -mb-16 rounded-full" />
      
      <div className="flex flex-col items-center text-center relative z-10">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-4"
        >
          <Heart className="text-rose-400 fill-rose-400/20" size={32} />
        </motion.div>
        
        <h3 className="text-[10px] uppercase tracking-[0.4em] text-rose-400 font-black mb-4 opacity-70">
          A Daily Whisper For You
        </h3>
        
        <p className="text-2xl md:text-3xl font-serif italic text-gray-800 leading-tight">
          "{wish}"
        </p>
        
        <div className="flex items-center gap-2 mt-6">
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">
            Loving you more every day
          </span>
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

