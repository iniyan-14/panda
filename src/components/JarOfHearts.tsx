import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Plus, Trash2, Send } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { JarData } from '../types';

import { STATIC_JAR_MESSAGES } from '../data/staticData';

interface JarOfHeartsProps {
  isAdmin?: boolean;
}

const DEFAULT_MESSAGES = STATIC_JAR_MESSAGES;

export default function JarOfHearts({ isAdmin }: JarOfHeartsProps) {
  const [data, setData] = useState<JarData>({ messages: DEFAULT_MESSAGES });
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Motivation messages are now 100% static to save Firebase quota.
    // Edit them in src/data/staticData.ts
    setData({ messages: STATIC_JAR_MESSAGES });
  }, []);

  const drawHeart = () => {
    if (isOpening) return;
    setIsOpening(true);
    const randomIndex = Math.floor(Math.random() * data.messages.length);
    setTimeout(() => {
      setCurrentMessage(data.messages[randomIndex]);
      setIsOpening(false);
    }, 800);
  };

  return (
    <div className="py-12 flex flex-col items-center">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-serif italic text-[var(--rose-deep)] mb-4">sweet messages from Appu</h2>
        <p className="text-[var(--ink)] opacity-60 font-sans tracking-[0.3em] uppercase text-[10px] font-black italic">Open for a boost of strength</p>
      </div>

      <div className="relative group cursor-pointer" onClick={drawHeart}>
        {/* The Mason Jar Rendering */}
        <motion.div
          animate={isOpening ? { rotate: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="relative w-64 h-80 bg-white/20 backdrop-blur-md border-4 border-white/60 rounded-[3rem] shadow-2xl overflow-hidden"
        >
          {/* Jar Lid */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-gray-200/50 border-b-2 border-gray-300 rounded-b-xl z-10" />

          {/* Glass Gloss */}
          <div className="absolute inset-y-0 left-4 w-4 bg-white/30 skew-x-12 z-0" />

          {/* Floating Hearts in Jar */}
          <div className="absolute inset-0 flex flex-wrap items-end justify-center gap-2 p-8 pt-12">
            {data.messages.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              >
                <Heart
                  size={24 + Math.random() * 12}
                  className={`${i % 2 === 0 ? 'text-pink-300' : 'text-rose-300'} fill-current opacity-70`}
                />
              </motion.div>
            ))}
          </div>

          {/* Label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 bg-amber-50/90 border border-amber-200 rounded-lg shadow-inner flex items-center justify-center p-2 text-center rotate-1">
            <p className="font-serif italic text-[var(--ink)] text-xs font-bold leading-tight">Motivation from Appu</p>
          </div>
        </motion.div>

        {/* Interaction Hint */}
        <AnimatePresence>
          {!currentMessage && !isOpening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--rose-deep)] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap"
            >
              Tap to pick a heart ❤️
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {currentMessage && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-[var(--ink)]/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              className="relative max-w-sm w-full outline-none"
            >
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-pink-100 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-[100px] -mr-8 -mt-8 -z-10" />
                <Heart className="mx-auto text-pink-500 mb-6 fill-pink-500" size={48} />
                <p className="text-2xl md:text-3xl font-serif italic text-gray-800 leading-relaxed mb-8">
                  "{currentMessage}"
                </p>
                <button
                  onClick={() => setCurrentMessage(null)}
                  className="px-10 py-4 bg-[var(--ink)] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[var(--rose-deep)] transition-all shadow-lg"
                >
                  Keep it Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
