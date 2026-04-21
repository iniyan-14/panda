import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MailOpen, X, Plus, Trash2, Check, Pen, Lock, Unlock, RotateCcw } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { LoveLetter } from '../types';
import { TARGET_DATE } from '../constants';

interface LoveLettersProps {

  isAdmin?: boolean;
}

export default function LoveLetters({ isAdmin }: LoveLettersProps) {
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LoveLetter | null>(null);
  const [newLetter, setNewLetter] = useState({ title: '', content: '', unlockDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => {
    if (showAddModal || selectedLetter) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal, selectedLetter]);

  const isTodayOrPast = (dateStr: string) => {
    if (!dateStr) return true;
    const today = new Date();
    // Set to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    const unlockDate = new Date(dateStr);
    unlockDate.setHours(0, 0, 0, 0);
    return today >= unlockDate;
  };

  const handleOpenLetter = (letter: LoveLetter) => {
    if (!isAdmin && letter.unlockDate && !isTodayOrPast(letter.unlockDate)) {
      return;
    }
    setSelectedLetter(letter);
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'letters'));
      const fetchedLetters = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LoveLetter[];
      setLetters(fetchedLetters);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetter.title || !newLetter.content) return;
    setIsSubmitting(true);
    try {
      if (editingLetter) {
        await updateDoc(doc(db, 'letters', editingLetter.id), {
          title: newLetter.title,
          content: newLetter.content,
          unlockDate: newLetter.unlockDate
        });
      } else {
        await addDoc(collection(db, 'letters'), {
          ...newLetter,
          archived: false
        });
      }
      setNewLetter({ title: '', content: '', unlockDate: '' });
      setShowAddModal(false);
      setEditingLetter(null);
      fetchLetters();
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  const handleEdit = (letter: LoveLetter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLetter(letter);
    setNewLetter({
      title: letter.title,
      content: letter.content,
      unlockDate: letter.unlockDate || ''
    });
    setShowAddModal(true);
  };

  const handleArchiveLetter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Move this letter to Trash? You can restore it later.")) return;
    try {
      await updateDoc(doc(db, 'letters', id), {
        archived: true,
        archivedAt: serverTimestamp()
      });
      fetchLetters();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestoreLetter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'letters', id), {
        archived: false,
        archivedAt: null
      });
      fetchLetters();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePermanentDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("This will delete the letter FOREVER. Continue?")) return;
    try {
      await deleteDoc(doc(db, 'letters', id));
      fetchLetters();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <div className="text-center mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-serif italic text-[var(--rose-deep)] mb-4 leading-tight">Secret Love Letters</h2>
        <p className="text-[var(--ink)] opacity-60 font-sans tracking-widest uppercase text-xs font-bold">Unfolding the whispers of my heart</p>
        
        {isAdmin && (
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <button
              onClick={() => {
                setEditingLetter(null);
                setNewLetter({ title: '', content: '', unlockDate: '' });
                setShowAddModal(true);
              }}
              className="flex items-center gap-3 px-8 py-4 bg-[var(--rose-deep)] text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-[var(--ink)] transition-all shadow-xl hover:-translate-y-1"
            >
              <Pen size={16} /> Write a Letter
            </button>

            <button
              onClick={() => setShowTrash(!showTrash)}
              className={`flex items-center gap-3 px-8 py-4 ${showTrash ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'} border border-[var(--rose-deep)]/20 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-md hover:-translate-y-1`}
            >
              <Trash2 size={16} /> {showTrash ? 'Hide Trash' : 'Trash Bin'}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-10">
        {letters
          .filter(l => (showTrash ? l.archived : !l.archived))
          .map((letter) => {
            const isLocked = letter.unlockDate && !isTodayOrPast(letter.unlockDate);
            
            return (
              <motion.div
                key={letter.id}
                onClick={() => handleOpenLetter(letter)}
                whileHover={isLocked && !isAdmin ? {} : { scale: 1.05, rotate: 2 }}
                className={`group relative perspective-1000 ${isLocked && !isAdmin ? 'cursor-not-allowed grayscale' : 'cursor-pointer'}`}
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {letter.archived ? (
                      <>
                        <button
                          onClick={(e) => handleRestoreLetter(letter.id!, e)}
                          className="p-2 bg-white rounded-lg text-green-500 shadow-md hover:bg-green-50"
                          title="Restore"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={(e) => handlePermanentDelete(letter.id!, e)}
                          className="p-2 bg-white rounded-lg text-red-600 shadow-md hover:bg-red-50"
                          title="Delete Permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleEdit(letter, e)}
                          className="p-2 bg-white rounded-lg text-blue-500 shadow-md hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pen size={16} />
                        </button>
                        <button
                          onClick={(e) => handleArchiveLetter(letter.id!, e)}
                          className="p-2 bg-white rounded-lg text-red-500 shadow-md hover:bg-red-50"
                          title="Move to Trash"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              
              <div className={`w-64 h-80 bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center text-center relative border border-[var(--rose-deep)]/20 transition-all duration-500 ${!isLocked || isAdmin ? 'group-hover:shadow-[0_20px_50px_rgba(232,165,178,0.3)]' : ''}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 shadow-inner ${isLocked && !isAdmin ? 'bg-gray-100 text-gray-400' : 'bg-pink-50 text-[var(--rose-deep)] group-hover:scale-110'}`}>
                  {isLocked && !isAdmin ? <Lock size={30} /> : <Mail size={32} />}
                </div>
                
                <h3 className="text-xl font-serif italic text-[var(--ink)] mb-4">{letter.title}</h3>
                
                {isLocked && !isAdmin ? (
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Locked until {new Date(letter.unlockDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                ) : (
                  <p className="text-[10px] uppercase tracking-widest font-black text-pink-300">Open Envelope</p>
                )}
                
                {letter.unlockDate && (
                  <div className="absolute top-4 left-4">
                    <span className="text-[8px] uppercase font-black tracking-widest text-[var(--rose-deep)] opacity-40">
                      {letter.unlockDate === TARGET_DATE.split('T')[0] ? 'Birthday Special' : 'Scheduled'}
                    </span>

                  </div>
                )}
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 border-b border-[var(--rose-deep)]/10 bg-gradient-to-b from-pink-50/10 to-transparent rounded-t-xl" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex flex-col items-center justify-start p-6 backdrop-blur-md bg-[var(--ink)]/40 overflow-y-auto pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-xl w-full relative border border-[var(--rose-deep)]/20"
            >
              <button onClick={() => { setShowAddModal(false); setEditingLetter(null); }} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">
                <X size={28} />
              </button>
              
              <h3 className="text-3xl font-serif italic text-[var(--ink)] mb-10 text-center">{editingLetter ? 'Revise Your Whispers' : 'Write to Her Soul'}</h3>
              
              <form onSubmit={handleAddLetter} className="space-y-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--rose-deep)] font-black mb-3 ml-2">Letter Title</label>
                  <input
                    type="text"
                    required
                    value={newLetter.title}
                    onChange={e => setNewLetter(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-6 py-4 bg-[var(--rose-soft)]/20 border-2 border-[var(--rose-soft)]/50 rounded-2xl focus:outline-none focus:border-[var(--rose-deep)]/30 font-serif italic text-lg shadow-inner"
                    placeholder="e.g., To My Everything"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--rose-deep)] font-black mb-3 ml-2">Unlock Date (Optional)</label>
                  <input
                    type="date"
                    value={newLetter.unlockDate}
                    onChange={e => setNewLetter(p => ({ ...p, unlockDate: e.target.value }))}
                    className="w-full px-6 py-4 bg-[var(--rose-soft)]/20 border-2 border-[var(--rose-soft)]/50 rounded-2xl focus:outline-none focus:border-[var(--rose-deep)]/30 font-sans text-sm"
                  />
                  <p className="mt-2 text-[10px] text-gray-400 italic ml-2">Leave blank for "Advance Wishes" to be opened instantly. Set to 2026-05-10 for the Birthday Wish!</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--rose-deep)] font-black mb-3 ml-2">The Message</label>
                  <textarea
                    required
                    value={newLetter.content}
                    onChange={e => setNewLetter(p => ({ ...p, content: e.target.value }))}
                    className="w-full px-6 py-4 bg-[var(--rose-soft)]/20 border-2 border-[var(--rose-soft)]/50 rounded-2xl focus:outline-none focus:border-[var(--rose-deep)]/30 resize-none h-64 font-romantic text-2xl leading-relaxed"
                    placeholder="Write from the heart..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[var(--ink)] text-white rounded-[2.5rem] font-bold tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 hover:bg-[var(--rose-deep)] transition-all shadow-xl"
                >
                  {isSubmitting ? 'Sealing...' : <><Check size={20} /> {editingLetter ? 'Update Letter' : 'Seal & Send'}</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-start p-4 backdrop-blur-md bg-[var(--ink)]/40 overflow-y-auto pointer-events-auto">
            <motion.div 
              className="fixed inset-0 bg-[var(--ink)]/40 backdrop-blur-md"
              onClick={() => setSelectedLetter(null)}
            />
            
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl bg-[#fffcf5] p-8 md:p-16 rounded-lg shadow-2xl border-t-[12px] border-[var(--rose-deep)] max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setSelectedLetter(null)}
                className="absolute top-4 right-4 text-[var(--rose-deep)] hover:rotate-90 transition-transform duration-500 z-50"
              >
                <X size={28} />
              </button>

              <div className="flex justify-center mb-8">
                <div className="text-[var(--rose-deep)] animate-pulse">
                  <MailOpen size={48} />
                </div>
              </div>

              <h3 className="text-2xl md:text-5xl font-serif italic text-[var(--ink)] mb-8 text-center border-b border-[var(--rose-deep)]/20 pb-8 tracking-tight">
                {selectedLetter.title}
              </h3>
              
              <div className="font-romantic text-2xl md:text-4xl text-gray-700 leading-[1.6] whitespace-pre-wrap px-2 md:px-4">
                {selectedLetter.content}
              </div>

              <div className="mt-16 text-right pr-4">
                <p className="font-serif italic text-base md:text-lg text-[var(--ink)] opacity-60">With all my love,</p>
                <p className="font-romantic text-3xl md:text-4xl text-[var(--rose-deep)] mt-4">Always Yours</p>
              </div>

              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] rounded-lg z-[-1]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
