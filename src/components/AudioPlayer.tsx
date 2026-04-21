import React, { useState, useRef, useEffect } from 'react';
import { Music as LucideMusic, Music2 as LucideMusic2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioPlayerProps {
  isUnlocked: boolean;
}

export default function AudioPlayer({ isUnlocked }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [isUnlocked]);

  return (
    <div className="fixed top-6 right-6 z-50">
      <audio 
        id="bg-music"
        key={isUnlocked ? 'birthday' : 'regular'}
        ref={audioRef} 
        loop 
        preload="auto"
      >
        <source src={isUnlocked ? "/audio/birthday.mp3" : "/audio/love1.mp3"} type="audio/mpeg" />
      </audio>


      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-[0_8px_32px_rgba(255,182,193,0.3)] hover:bg-white/30 transition-all group"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading">
              <LucideMusic2 size={20} className="animate-spin opacity-50" />
            </motion.div>
          ) : isPlaying ? (
            <motion.div
              key="playing"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <LucideMusic2 size={20} className="text-rose-300" />
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-rose-400 rounded-full blur-md -z-10"
              />
            </motion.div>
          ) : (
            <motion.div key="paused">
              <LucideMusic size={20} className="opacity-70" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

