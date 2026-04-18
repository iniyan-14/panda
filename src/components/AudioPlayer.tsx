import React, { useState, useRef, useEffect } from 'react';
import { Music as LucideMusic, Music2 as LucideMusic2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SurpriseData } from '../types';

interface AudioPlayerProps {
  isUnlocked: boolean;
}

export default function AudioPlayer({ isUnlocked }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'surprise'));
        if (docSnap.exists()) {
          const data = docSnap.data() as SurpriseData;
          const selectedUrl = isUnlocked ? data.birthdayMusic : data.preBirthdayMusic;
          if (selectedUrl) {
            setMusicUrl(selectedUrl);
          }
        }
      } catch (err) {
        console.error("Failed to fetch music settings", err);
      }
    };
    fetchMusic();
  }, [isUnlocked]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Handle autoplay block
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    // Attempt autoplay when component mounts or music URL changes
    const timer = setTimeout(() => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [musicUrl]);

  return (
    <div className="fixed top-6 right-6 z-50">
      {musicUrl && (
        <audio 
          ref={audioRef} 
          src={musicUrl} 
          loop 
          onError={(e) => console.error("Audio playback error:", e)}
        />
      )}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        className="w-11 h-11 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 flex items-center justify-center text-[var(--rose-deep)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:bg-white/60 transition-all group"
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
              className="relative"
            >
              <LucideMusic2 size={20} className="animate-pulse" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-[var(--rose-deep)] rounded-full blur-md -z-10"
              />
            </motion.div>
          ) : (
            <motion.div
              key="paused"
              initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
            >
              <LucideMusic size={20} className="opacity-60" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
