import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Brain } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { ThinkingStatus as ThinkingStatusType } from '../types';

interface ThinkingStatusProps {
  isAdmin?: boolean;
}

export default function ThinkingStatus({ isAdmin }: ThinkingStatusProps) {
  const [status, setStatus] = useState<ThinkingStatusType>({ isThinking: false, timestamp: null });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Real-time listener for the status document
    const unsubscribe = onSnapshot(doc(db, 'settings', 'status'), (docSnap) => {
      if (docSnap.exists()) {
        setStatus(docSnap.data() as ThinkingStatusType);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleThinking = async () => {
    setIsUpdating(true);
    try {
      await setDoc(doc(db, 'settings', 'status'), {
        isThinking: !status.isThinking,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to update status", err);
    }
    setIsUpdating(false);
  };

  if (isAdmin) {
    return (
      <div className="flex flex-col items-center gap-4 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-xl max-w-sm mx-auto">
        <div className={`p-5 rounded-full ${status.isThinking ? 'bg-pink-100 text-pink-500 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
          <Brain size={40} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-serif italic text-gray-800">Thinking of Her?</h3>
          <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">Let her know in real-time</p>
        </div>
        <button
          onClick={toggleThinking}
          disabled={isUpdating}
          className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
            status.isThinking 
            ? 'bg-gray-800 text-white hover:bg-gray-900' 
            : 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-200'
          }`}
        >
          {status.isThinking ? 'Stop Telling Her' : <><Heart size={18} fill="currentColor" /> Send Love Vibes</>}
        </button>
      </div>
    );
  }

  // Partner View: Automatic notification badge
  return (
    <AnimatePresence>
      {status.isThinking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className="fixed top-20 md:top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-white/90 backdrop-blur-2xl px-6 py-3 rounded-full border border-pink-100 shadow-2xl pointer-events-none"
        >
          <div className="relative">
            <Heart size={20} className="text-pink-500 fill-pink-500 animate-pulse" />
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0"
            >
              <Sparkles size={20} className="text-pink-300" />
            </motion.div>
          </div>
          <span className="text-sm font-serif italic text-gray-700 font-bold whitespace-nowrap">
            He's thinking of you right now...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
