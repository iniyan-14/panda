import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactConfetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { 
  Sparkles as LucideSparkles, 
  Heart as LucideHeart, 
  Edit2 as LucideEdit2, 
  X as LucideX, 
  Check as LucideCheck, 
  Video as LucideVideo, 
  Music as LucideMusic, 
  Trash2 as LucideTrash2, 
  Image as LucideImage, 
  Mail as LucideMail, 
  Coffee as LucideCoffee, 
  Gift as LucideGift, 
  Lock as LucideLock,
  Settings as LucideSettings 
} from 'lucide-react';
import Typewriter from 'typewriter-effect';
import { SurpriseData } from '../types';
import ThinkingStatus from './ThinkingStatus';
import { getDirectDriveLink } from '../utils/driveUtils';

interface SurpriseProps {
  isAdmin?: boolean;
  sharedSettings: SurpriseData | null;
}

const DEFAULT_SURPRISE: SurpriseData = {
  heading: "Happy birthday my Nandhuu!",
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-happy-birthday-background-with-balloons-and-confetti-3001-large.mp4",
  promiseTitle: "My Promise to You",
  promiseText: "I promise to love you more each day, to support every dream you have, and to always be the hand you hold.",
  magicalTitle: "You are Magical",
  magicalText: "Never forget how much light you bring into this world just by being yourself. You are my greatest miracle.",
  typewriterMessages: [
    "Today is the day the world became a billion times brighter.",
    "Happy birthday my Nandhuu!",
    "You are my absolute everything, my star, my heart.",
    "I hope this year brings you as much joy as you give me."
  ],
  preBirthdayMusic: "https://drive.google.com/file/d/1WMtBsqJ2DRvZrB5xH05RZy6lO3p1BdfN/view?usp=sharing",
  birthdayMusic: "https://drive.google.com/file/d/194upUxOd8RsJn-YJkocnJYUENGrcWpj7/view?usp=sharing"
};

export default function Surprise({ isAdmin, sharedSettings }: SurpriseProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [data, setData] = useState<SurpriseData>(DEFAULT_SURPRISE);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SurpriseData>(DEFAULT_SURPRISE);
  const [musicUploadLoading, setMusicUploadLoading] = useState<'pre' | 'bday' | null>(null);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [landingUploadLoading, setLandingUploadLoading] = useState(false);

  const [appLocks, setAppLocks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setAppLocks(doc.data().locks || {});
      }
    });
    return () => unsub();
  }, []);

  const toggleLock = async (tabId: string) => {
    const newLocks = { ...appLocks, [tabId]: !appLocks[tabId] };
    await setDoc(doc(db, 'settings', 'global'), { locks: newLocks }, { merge: true });
  };


  const handleLandingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert("This image is too large. Please use a URL or a smaller image (under 800KB) for the landing! ❤️");
        return;
      }
      setLandingUploadLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData(p => ({ ...p, landingImageUrl: reader.result as string }));
        setLandingUploadLoading(false);
      };
      reader.onerror = () => {
        setLandingUploadLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { // ~800KB hard limit for Firestore base64
        alert("This video file is too large to save directly. To keep the app fast, please paste a direct video URL instead! ❤️");
        return;
      }
      setVideoUploadLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData(p => ({ ...p, videoUrl: reader.result as string }));
        setVideoUploadLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pre' | 'bday') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { // ~800KB hard limit for Firestore base64
        alert("This song is too large to save directly. Please use a direct MP3 URL for long songs so they play perfectly! ❤️");
        return;
      }
      setMusicUploadLoading(type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setEditData(p => ({
          ...p,
          [type === 'pre' ? 'preBirthdayMusic' : 'birthdayMusic']: base64
        }));
        setMusicUploadLoading(null);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (sharedSettings) {
      setData(sharedSettings);
      setEditData(sharedSettings);
      setLoading(false);
    }
  }, [sharedSettings]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'surprise'), editData);
      setData(editData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    }
  };

  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditing]);

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12 flex flex-col items-center relative w-full"
    >
      {showConfetti && <ReactConfetti width={width} height={height} colors={['#fdf2f4', '#e8a5b2', '#d4af37']} />}

      {isAdmin && (
        <div className="absolute top-0 right-0 p-4 flex gap-2 z-20">
          <button
            onClick={() => setIsEditing(true)}
            className="w-12 h-12 bg-white rounded-full shadow-lg border border-[var(--rose-soft)] text-[var(--ink)] hover:scale-110 transition-all flex items-center justify-center group"
            title="Edit Surprise Content"
          >
            <LucideEdit2 size={22} />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-[var(--rose-soft)] text-[var(--rose-deep)] hover:bg-[var(--rose-deep)] hover:text-white transition-all flex items-center gap-2"
          >
            <LucideImage size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Change Login Background</span>
          </button>
        </div>
      )}

      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl mx-auto mb-16 bg-white/40 backdrop-blur-xl border border-white/40 p-8 rounded-[3rem] shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <LucideSettings size={100} className="text-[var(--rose-deep)]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-500">
                <LucideSettings size={20} />
              </div>
              <div>
                <h3 className="text-xl font-serif italic text-[var(--ink)]">App Control Center</h3>
                <p className="text-[8px] text-rose-400 font-black uppercase tracking-widest mt-0.5">Real-time Override</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'gallery', label: 'Memories', icon: LucideImage },
                { id: 'letters_advance', label: 'Advance Letters', icon: LucideMail },
                { id: 'letters_birthday', label: 'Birthday Letters', icon: LucideMail },
                { id: 'jar', label: 'Motivation Jar', icon: LucideCoffee },
                { id: 'open_when', label: 'When...', icon: LucideSparkles },
                { id: 'surprise', label: 'Surprise Tab', icon: LucideGift },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleLock(item.id)}
                  className={`flex items-center justify-between px-6 py-3 rounded-2xl border transition-all ${
                    appLocks[item.id] 
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md' 
                      : 'bg-white/60 text-[var(--ink)] border-white/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={14} className={appLocks[item.id] ? 'text-white' : 'text-rose-400'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${appLocks[item.id] ? 'bg-white animate-pulse' : 'bg-green-400'}`} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="text-center mb-16 relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block mb-6 text-[var(--gold)]"
        >
          <LucideSparkles size={64} />
        </motion.div>
        
        <h2 className="text-4xl md:text-7xl font-romantic text-[var(--rose-deep)] mb-6 drop-shadow-sm px-4 leading-tight">
          {data.heading}
        </h2>
        
        <div className="text-lg md:text-2xl font-serif italic text-[var(--ink)] opacity-80 max-w-2xl mx-auto px-6 h-28 md:h-24">
          <Typewriter
            options={{
              strings: data.typewriterMessages,
              autoStart: true,
              loop: true,
              delay: 40,
              cursor: '|'
            }}
          />
        </div>
      </div>

      <div className="w-full max-w-4xl aspect-video rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-8 border-white/50 relative group mb-16 backdrop-blur-sm">
        <div className="absolute inset-0 bg-[var(--ink)] flex items-center justify-center">
            {data.videoUrl ? (
              <video 
                key={data.videoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                muted
                src={getDirectDriveLink(data.videoUrl)}
              />
            ) : (

              <div className="flex flex-col items-center gap-4 text-white/40">
                <LucideVideo size={48} />
                <p className="font-serif italic text-sm">Waiting for your magical video...</p>
              </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl px-4">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl card-shadow text-center relative overflow-hidden border border-white/50"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--rose-soft)]/20 rounded-bl-[100px] -mr-8 -mt-8 -z-10" />
          <LucideHeart className="mx-auto text-[var(--rose-deep)] mb-6 fill-[var(--rose-deep)]" size={32} />
          <h3 className="text-xl md:text-2xl font-serif italic text-[var(--ink)] mb-4">{data.promiseTitle}</h3>
          <p className="text-base md:text-lg text-[var(--ink)] opacity-70 leading-relaxed italic font-serif">
            {data.promiseText}
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl card-shadow text-center relative overflow-hidden border border-white/50"
        >
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--rose-soft)]/20 rounded-tr-[100px] -ml-8 -mb-8 -z-10" />
          <LucideSparkles className="mx-auto text-[var(--gold)] mb-6" size={32} />
          <h3 className="text-xl md:text-2xl font-serif italic text-[var(--ink)] mb-4">{data.magicalTitle}</h3>
          <p className="text-base md:text-lg text-[var(--ink)] opacity-70 leading-relaxed italic font-serif">
            {data.magicalText}
          </p>
        </motion.div>
      </div>

      {isAdmin && (
        <div className="mt-16 w-full max-w-md">
          <ThinkingStatus isAdmin={true} />
        </div>
      )}

      <p className="mt-24 text-[var(--rose-deep)] font-romantic text-4xl opacity-40 uppercase tracking-[0.2em] font-black">Forever & Always ❤️</p>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[110] flex justify-center items-start p-4 md:p-8 backdrop-blur-md bg-[var(--ink)]/80 overflow-y-auto pointer-events-auto custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl max-w-3xl w-full relative border border-white/20 my-auto"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 px-8 py-6 border-b border-gray-100 flex justify-between items-center rounded-t-[2.5rem] md:rounded-t-[4rem]">
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif italic text-[var(--ink)]">Surprise Curation</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--rose-deep)] font-black opacity-60">Master Control Panel</p>
                </div>
                <button onClick={() => setIsEditing(false)} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                  <LucideX size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 md:p-12 space-y-12">
                {/* Section 1: Visual Identity */}
                <section className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-10 h-10 bg-[var(--rose-soft)] rounded-xl flex items-center justify-center text-[var(--rose-deep)]">
                      <LucideImage size={20} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">Global Atmosphere</h4>
                  </div>

                  <div className="bg-[var(--rose-soft)]/10 p-6 rounded-3xl border border-[var(--rose-soft)]/30">
                    <label className="block text-[11px] uppercase tracking-widest text-[var(--rose-deep)] font-black mb-3 ml-1">Login Page Wallpaper (The First Impression)</label>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={editData.landingImageUrl?.startsWith('data:image') ? '--- Local Image Uploaded ---' : editData.landingImageUrl}
                          onChange={e => setEditData(p => ({ ...p, landingImageUrl: e.target.value }))}
                          className="w-full px-6 py-4 bg-white border-2 border-white rounded-2xl focus:outline-none focus:border-[var(--rose-soft)] shadow-sm text-sm"
                          placeholder="Paste image URL here..."
                        />
                        <p className="text-[9px] text-[var(--ink)] opacity-40 ml-1 font-medium italic">
                          This is the image your partner will see on the login screen.
                        </p>
                      </div>
                      <label className="md:w-32 h-20 md:h-24 bg-white rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--rose-soft)]/20 transition-all border-2 border-dashed border-[var(--rose-soft)]/50 shrink-0 gap-2 group shadow-sm">
                        {landingUploadLoading ? <LucideSparkles className="animate-spin text-[var(--rose-deep)]" /> : (
                          <>
                            <LucideImage size={24} className="text-[var(--rose-deep)] group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-tighter text-[var(--rose-deep)]">Upload PC</span>
                          </>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLandingUpload} />
                      </label>
                    </div>
                    
                    {editData.landingImageUrl && (
                      <div className="mt-6 flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-white/80">
                         <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-100">
                           <img src={editData.landingImageUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Landing wallpaper preview" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-[var(--ink)] uppercase">Current Preview</p>
                            <p className="text-[9px] text-gray-400">Login background update active</p>
                         </div>
                      </div>
                    )}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="w-10 h-10 bg-[var(--rose-soft)] rounded-xl flex items-center justify-center text-[var(--rose-deep)]">
                        <LucideVideo size={20} />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">Main Surprise</h4>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[var(--rose-deep)] font-black mb-2 ml-2">Main Heading</label>
                        <input
                          type="text"
                          value={editData.heading}
                          onChange={e => setEditData(p => ({ ...p, heading: e.target.value }))}
                          className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--rose-soft)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[var(--rose-deep)] font-black mb-2 ml-2">Birthday Video URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={editData.videoUrl}
                            onChange={e => setEditData(p => ({ ...p, videoUrl: e.target.value }))}
                            className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--rose-soft)]"
                            placeholder="https://..."
                          />
                          <label className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-200 shrink-0">
                            {videoUploadLoading ? <LucideVideo className="animate-spin text-[var(--rose-deep)]" /> : <LucideVideo size={20} className="text-[var(--rose-deep)]" />}
                            <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="w-10 h-10 bg-[var(--gold)]/20 rounded-xl flex items-center justify-center text-[var(--gold)]">
                        <LucideMusic size={20} />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">Magic Audio</h4>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[var(--rose-deep)] font-black mb-2 ml-2">Current Background Music</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={editData.preBirthdayMusic?.startsWith('data:audio') ? '--- Local File Uploaded ---' : editData.preBirthdayMusic}
                            onChange={e => setEditData(p => ({ ...p, preBirthdayMusic: e.target.value }))}
                            className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--rose-soft)]"
                            placeholder="Pre-Birthday Music URL"
                          />
                          <label className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-200 shrink-0">
                            {musicUploadLoading === 'pre' ? <LucideMusic className="animate-spin text-[var(--rose-deep)]" /> : <LucideMusic size={20} className="text-[var(--rose-deep)]" />}
                            <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleMusicUpload(e, 'pre')} />
                          </label>
                          {(editData.preBirthdayMusic?.startsWith('data:audio')) && (
                            <button 
                              type="button"
                              onClick={() => setEditData(p => ({ ...p, preBirthdayMusic: '' }))}
                              className="p-2 text-red-400"
                            >
                              <LucideTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[var(--gold)] font-black mb-2 ml-2">May 10 Birthday Anthem</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editData.birthdayMusic?.startsWith('data:audio') ? '--- Local File Uploaded ---' : editData.birthdayMusic}
                            onChange={e => setEditData(p => ({ ...p, birthdayMusic: e.target.value }))}
                            className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--gold)]/30"
                            placeholder="Birthday Music URL"
                          />
                          <label className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-[var(--gold)]/20 shrink-0">
                            {musicUploadLoading === 'bday' ? <LucideMusic className="animate-spin text-[var(--gold)]" /> : <LucideMusic size={20} className="text-[var(--gold)]" />}
                            <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleMusicUpload(e, 'bday')} />
                          </label>
                          {(editData.birthdayMusic?.startsWith('data:audio')) && (
                            <button 
                              type="button"
                              onClick={() => setEditData(p => ({ ...p, birthdayMusic: '' }))}
                              className="p-2 text-red-400"
                            >
                              <LucideTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-10 h-10 bg-[var(--rose-deep)]/10 rounded-xl flex items-center justify-center text-[var(--rose-deep)]">
                      <LucideLock size={20} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">Feature Access Center</h4>
                  </div>
                  
                  <div className="p-8 bg-[var(--rose-soft)]/5 rounded-[3rem] border-2 border-dashed border-[var(--rose-soft)]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {[
                        { id: 'open_when', label: 'When...', icon: LucideSparkles },
                        { id: 'gallery', label: 'Gallery', icon: LucideImage },
                        { id: 'letters', label: 'Letters', icon: LucideMail },
                        { id: 'jar', label: 'Motivation', icon: LucideCoffee },
                        { id: 'surprise', label: 'Surprise', icon: LucideGift },
                      ].map(feat => (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => setEditData(p => ({
                            ...p,
                            manualUnlocks: {
                              ...(p.manualUnlocks || {}),
                              [feat.id]: !(p.manualUnlocks?.[feat.id])
                            }
                          }))}
                          className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${
                            editData.manualUnlocks?.[feat.id] 
                              ? 'bg-[var(--rose-deep)] text-white border-[var(--rose-deep)] shadow-lg' 
                              : 'bg-white text-[var(--ink)] opacity-40 border-[var(--rose-soft)]/20 hover:opacity-80'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${editData.manualUnlocks?.[feat.id] ? 'bg-white/20' : 'bg-gray-50'}`}>
                            <feat.icon size={16} />
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">{feat.label}</span>
                          {editData.manualUnlocks?.[feat.id] ? <LucideCheck size={10} /> : <LucideLock size={10} />}
                        </button>
                      ))}
                    </div>
                    <p className="mt-6 text-[10px] text-center opacity-40 font-bold italic tracking-wider">Unlocking a feature makes it instantly available to your partner.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-10 h-10 bg-[var(--rose-soft)] rounded-xl flex items-center justify-center text-[var(--rose-deep)]">
                      <LucideMail size={20} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">Daily Notes</h4>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--rose-deep)] font-black mb-3 ml-2">Typewriter Carousel (CSV)</label>
                    <textarea
                      value={editData.typewriterMessages.join(',')}
                      onChange={e => setEditData(p => ({ ...p, typewriterMessages: e.target.value.split(',') }))}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--rose-soft)] h-32 resize-none text-sm font-medium"
                      placeholder="Message 1, Message 2, Message 3..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-[var(--rose-deep)] tracking-[0.3em] flex items-center gap-2">
                       Promise Card
                    </h4>
                    <input
                      type="text"
                      placeholder="Title"
                      value={editData.promiseTitle}
                      onChange={e => setEditData(p => ({ ...p, promiseTitle: e.target.value }))}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--rose-soft)] text-sm font-bold"
                    />
                    <textarea
                      placeholder="Message"
                      value={editData.promiseText}
                      onChange={e => setEditData(p => ({ ...p, promiseText: e.target.value }))}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--rose-soft)] h-32 resize-none text-sm leading-relaxed"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-[var(--gold)] tracking-[0.3em] flex items-center gap-2">
                       Magical Card
                    </h4>
                    <input
                      type="text"
                      placeholder="Title"
                      value={editData.magicalTitle}
                      onChange={e => setEditData(p => ({ ...p, magicalTitle: e.target.value }))}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--gold)]/30 text-sm font-bold"
                    />
                    <textarea
                      placeholder="Message"
                      value={editData.magicalText}
                      onChange={e => setEditData(p => ({ ...p, magicalText: e.target.value }))}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[var(--gold)]/30 h-32 resize-none text-sm leading-relaxed"
                    />
                  </div>
                </div>

                {/* Submit Container */}
                <div className="sticky bottom-0 bg-white/90 backdrop-blur-md z-30 pt-6 pb-2 mt-12 flex gap-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-6 bg-gray-50 text-[var(--ink)] rounded-[2rem] font-black tracking-[0.2em] uppercase text-[10px] hover:bg-gray-100 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-6 bg-[var(--ink)] text-white rounded-[2rem] font-black tracking-[0.2em] uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-[var(--rose-deep)] transition-all shadow-xl hover:shadow-[0_15px_30px_rgba(74,55,59,0.3)]"
                  >
                    <LucideCheck size={18} /> Update Content & Wallpaper
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
