import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { OpenWhenEnvelope } from '../types';
import { Mail, Plus, X, Check, Heart, Sparkles, Trash2, ExternalLink } from 'lucide-react';

interface OpenWhenProps {
  isAdmin?: boolean;
}

const CATEGORIES = [
  { id: 'miss me', label: 'Miss Me', icon: '🫂', color: 'bg-rose-100 text-rose-600' },
  { id: 'stressed', label: 'Stressed', icon: '🧘', color: 'bg-blue-100 text-blue-600' },
  { id: 'lonely', label: 'Lonely', icon: '🤝', color: 'bg-orange-100 text-orange-600' },
  { id: 'happy', label: 'Happy', icon: '✨', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'can\'t sleep', label: 'Can\'t Sleep', icon: '🌙', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'other', label: 'Other', icon: '💌', color: 'bg-gray-100 text-gray-600' },
];

export default function OpenWhen({ isAdmin }: OpenWhenProps) {
  const [envelopes, setEnvelopes] = useState<OpenWhenEnvelope[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEnvelope, setSelectedEnvelope] = useState<OpenWhenEnvelope | null>(null);
  
  const [newEnvelope, setNewEnvelope] = useState({
    title: '',
    message: '',
    category: 'miss me',
    type: 'text' as const
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEnvelopes();
  }, []);

  const fetchEnvelopes = async () => {
    try {
      const q = query(collection(db, 'open_when_envelopes'));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OpenWhenEnvelope[];
      setEnvelopes(fetched);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnvelope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvelope.title || !newEnvelope.message) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'open_when_envelopes'), {
        ...newEnvelope,
        unlocked: false
      });
      setShowAddModal(false);
      setNewEnvelope({ title: '', message: '', category: 'miss me', type: 'text' });
      fetchEnvelopes();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this envelope?')) return;
    try {
      await deleteDoc(doc(db, 'open_when_envelopes', id));
      setEnvelopes(prev => prev.filter(env => env.id !== id));
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
        <h2 className="text-4xl md:text-5xl font-serif italic text-[var(--rose-deep)] mb-4">Open When...</h2>
        <p className="text-[var(--ink)] opacity-60 font-sans tracking-[0.3em] uppercase text-[10px] font-black">Digital Envelopes for Every Moment</p>
        
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-8 mx-auto flex items-center gap-3 px-8 py-4 bg-[var(--rose-deep)] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--ink)] transition-all shadow-xl"
          >
            <Plus size={18} />
            Write New Envelope
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {envelopes.map((env) => {
          const catInfo = CATEGORIES.find(c => c.id === env.category) || CATEGORIES[5];
          return (
            <motion.div
              key={env.id}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedEnvelope(env)}
              className="bg-white rounded-[2rem] p-8 shadow-xl border border-[var(--rose-soft)]/20 cursor-pointer relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--rose-soft)]/10 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700" />
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 ${catInfo.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                  {catInfo.icon}
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(env.id, e)}
                    className="p-2 text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h3 className="text-xl font-serif italic text-[var(--ink)] mb-3 leading-tight">{env.title}</h3>
              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-[var(--rose-deep)] opacity-60 mb-8">Open When You Are {env.category}</p>
              
              <div className="flex items-center gap-2 text-[var(--ink)] opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold uppercase tracking-widest">Read Envelope</span>
                <ExternalLink size={12} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center p-20">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Heart className="text-[var(--rose-deep)]" size={32} />
          </motion.div>
        </div>
      )}

      {envelopes.length === 0 && !loading && (
        <div className="text-center p-20 opacity-40">
           <Mail size={48} className="mx-auto mb-4" />
           <p className="font-serif italic">No envelopes written yet...</p>
        </div>
      )}

      {/* Add Envelope Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md bg-[var(--ink)]/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl max-w-lg w-full relative border border-[var(--rose-deep)]/20 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">
                <X size={28} />
              </button>
              
              <h3 className="text-3xl font-serif italic text-[var(--ink)] mb-8 text-center">Prepare an Envelope</h3>
              
              <form onSubmit={handleAddEnvelope} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--rose-deep)] font-black mb-2 ml-2">Mood / Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewEnvelope(p => ({ ...p, category: cat.id }))}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          newEnvelope.category === cat.id 
                            ? 'border-[var(--rose-deep)] bg-[var(--rose-soft)]/20' 
                            : 'border-transparent bg-gray-50 opacity-60'
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-[8px] font-bold uppercase">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--rose-deep)] font-black mb-2 ml-2">Envelope Title</label>
                  <input
                    type="text"
                    required
                    value={newEnvelope.title}
                    onChange={e => setNewEnvelope(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--rose-soft)] transition-colors"
                    placeholder="e.g. For when you had a long day..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--rose-deep)] font-black mb-2 ml-2">The Hidden Message</label>
                  <textarea
                    required
                    value={newEnvelope.message}
                    onChange={e => setNewEnvelope(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--rose-soft)] transition-colors h-40 resize-none"
                    placeholder="Pour your heart out here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[var(--ink)] text-white rounded-[2rem] font-bold tracking-widest uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-[var(--rose-deep)] transition-all shadow-xl"
                >
                  {isSubmitting ? 'Sealing...' : <><Check size={18} /> Seal Envelope</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Envelope Modal */}
      <AnimatePresence>
        {selectedEnvelope && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-xl bg-[var(--ink)]/80">
              <motion.div
                layoutId={`env-${selectedEnvelope.id}`}
                 className="bg-[#fdfcfb] p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] max-w-xl w-full relative border border-white/20 text-center"
              >
                <button 
                  onClick={() => setSelectedEnvelope(null)}
                  className="absolute top-10 right-10 text-[var(--ink)]/40 hover:text-[var(--ink)]"
                >
                  <X size={32} />
                </button>

                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-10 shadow-inner">
                   {CATEGORIES.find(c => c.id === selectedEnvelope.category)?.icon || '💌'}
                </div>

                <h3 className="text-3xl md:text-4xl font-serif italic text-[var(--ink)] mb-2">{selectedEnvelope.title}</h3>
                <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--rose-deep)] mb-12 opacity-50">Heart-to-Heart Message</p>

                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg md:text-xl font-serif italic text-[var(--ink)]/80 leading-relaxed max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar"
                  >
                    {selectedEnvelope.message.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-4' : ''}>{line}</p>
                    ))}
                  </motion.div>
                </div>

                <div className="mt-16 pt-10 border-t border-[var(--rose-soft)] flex flex-col items-center">
                   <div className="flex gap-1 mb-4">
                      {[1,2,3].map(i => <Heart key={i} size={14} className="text-[var(--rose-deep)] fill-[var(--rose-deep)]" />)}
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)] opacity-30">I will always be right here</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
