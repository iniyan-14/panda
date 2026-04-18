import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Typewriter from 'typewriter-effect';
import { Heart, Sparkles, Edit2, Check, X } from 'lucide-react';

interface DailyMessageProps {
  isAdmin?: boolean;
}

export default function DailyMessage({ isAdmin }: DailyMessageProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTodayMessage();
  }, []);

  const fetchTodayMessage = async () => {
    try {
      const docRef = doc(db, 'daily_messages', today);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const msg = docSnap.data().message;
        setMessage(msg);
        setEditedMessage(msg);
      } else {
        const defaultMsg = "You fill my heart with so much joy every single day. I can't wait to celebrate you. ❤️";
        setMessage(defaultMsg);
        setEditedMessage(defaultMsg);
      }
    } catch (error) {
      console.error(error);
      const fallback = "Loving you is my favorite thing to do. ❤️";
      setMessage(fallback);
      setEditedMessage(fallback);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'daily_messages', today), { message: editedMessage });
      setMessage(editedMessage);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save message.");
    }
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12"
    >
      <div className="relative w-full max-w-lg">
        {/* Decorations */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -top-12 -left-8 text-pink-200"
        >
          <Sparkles size={48} />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-10 -right-6 text-pink-200"
        >
          <Heart size={40} className="fill-pink-200" />
        </motion.div>

        <div className="bg-white border-l-4 border-[var(--rose-deep)] p-7 md:p-14 rounded-2xl shadow-xl card-shadow relative z-10 overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <p className="text-[var(--rose-deep)] font-bold uppercase tracking-[0.3em] text-[10px] underline underline-offset-8">Today's Message ❤️</p>
            {isAdmin && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-[var(--rose-deep)] hover:scale-110 transition-transform"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>
          
          <div className="text-xl md:text-2xl font-serif italic text-[var(--ink)] leading-relaxed text-center min-h-[120px] flex items-center justify-center">
            {isEditing ? (
              <div className="w-full space-y-4">
                <textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="w-full p-4 bg-[var(--rose-soft)]/20 border-2 border-[var(--rose-soft)] rounded-xl focus:outline-none focus:border-[var(--rose-deep)] resize-none h-32 text-lg text-center"
                />
                <div className="flex justify-center gap-3">
                  <button
                    disabled={isSaving}
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--ink)] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[var(--rose-deep)] transition-colors"
                  >
                    <Check size={14} /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-200"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              !loading && message && (
                <Typewriter
                  key={message}
                  options={{
                    strings: [message],
                    autoStart: true,
                    loop: false,
                    delay: 50,
                    cursor: '❤️'
                  }}
                />
              )
            )}
          </div>

          <div className="mt-12 flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                className="w-1.5 h-1.5 rounded-full bg-[var(--rose-deep)]"
              />
            ))}
          </div>
        </div>
      </div>

      {!isEditing && (
        <p className="mt-10 text-pink-300 text-sm font-medium animate-pulse">
          Come back tomorrow for another piece of my heart.
        </p>
      )}
    </motion.div>
  );
}
