import React, { useState, useRef, useEffect } from 'react';
import { Music as LucideMusic, Music2 as LucideMusic2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SurpriseData } from '../types';
import { getDirectDriveLink } from '../utils/driveUtils';

interface AudioPlayerProps {
  isUnlocked: boolean;
  settings?: SurpriseData | null;
}

export default function AudioPlayer({ isUnlocked, settings }: AudioPlayerProps) {
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
  }, [isUnlocked, settings]);

  return (
    <div>
      <audio
        id="bg-music"
        key={isUnlocked ? 'birthday' : 'regular'}
        ref={audioRef}
        loop
        preload="auto"
      >
        <source
          src={isUnlocked
            ? getDirectDriveLink(settings?.birthdayMusic || "/audio/birthday.mp3", 'audio')
            : getDirectDriveLink(settings?.preBirthdayMusic || "/audio/love1.mp3", 'audio')
          }
          type="audio/mpeg"
        />
      </audio>


      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        className="w-12 h-12 rounded-full bg-rose-500/10 backdrop-blur-xl border border-rose-200 flex items-center justify-center text-rose-600 shadow-lg hover:bg-rose-500/20 transition-all group"
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

