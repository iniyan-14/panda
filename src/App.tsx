import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { useAuth, AuthProvider } from './hooks/useAuth';
import FloatingHearts from './components/FloatingHearts';
import HeartCursor from './components/HeartCursor';
import AudioPlayer from './components/AudioPlayer';
import { 
  Heart as LucideHeart, 
  Calendar as LucideCalendar, 
  Image as LucideImage, 
  Mail as LucideMail, 
  Gift as LucideGift, 
  Sparkles as LucideSparkles,
  Lock as LucideLock, 
  LogOut as LucideLogOut,
  Coffee as LucideCoffee,
  X as LucideX,
  Play as LucidePlay
} from 'lucide-react';
import Countdown from './components/Countdown';
import GeminiGreeting from './components/GeminiGreeting';
import MemoryGallery from './components/MemoryGallery';
import LoveLetters from './components/LoveLetters';
import Surprise from './components/Surprise';
import JarOfHearts from './components/JarOfHearts';
import ThinkingStatus from './components/ThinkingStatus';
import OpenWhen from './components/OpenWhen';

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { SurpriseData } from './types';
import { ADMIN_CODE, TARGET_DATE, START_DATE, PARTNER_CODE } from './constants';

const BIRTHDAY_DATE = new Date(TARGET_DATE);


import { STATIC_SURPRISE } from './data/staticData';

function MainApp() {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('countdown');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [settings] = useState<SurpriseData>(STATIC_SURPRISE);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [showWaitModal, setShowWaitModal] = useState(false);
   const [appSettings, setAppSettings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setAppSettings(doc.data().locks || {});
      }
    });
    return () => unsub();
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    if (profile && showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [profile, showWelcome]);

  useEffect(() => {
    const checkUnlock = () => {
      const now = new Date();
      if (now >= BIRTHDAY_DATE) {
        setIsUnlocked(true);
      }
    };
    checkUnlock();
    const timer = setInterval(checkUnlock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // No Firestore listeners needed for Option B (Full Static)
    // Countdown and Whispers are now managed via staticData.ts and constants.ts
  }, [user]);

  const isAdmin = profile?.role === 'admin' || profile?.code === ADMIN_CODE || profile?.code === '1677' || profile?.code === '9585';
  const isPartner = profile?.role === 'partner';
  const isUnlockedDate = isAdmin || (new Date() >= BIRTHDAY_DATE);

  const startExperience = () => {
    const audio = document.getElementById("bg-music") as HTMLAudioElement;
    if (audio) {
      audio.play().catch(() => {});
    }
    setHasInteracted(true);
  };

  if (!hasInteracted) {
    return (
      <div className="min-h-screen bg-[var(--ink)] flex flex-col items-center justify-center relative overflow-hidden">
        <FloatingHearts />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10 px-6"
        >
          <LucideHeart size={80} className="text-rose-400 fill-rose-400 mx-auto mb-8 animate-pulse shadow-rose-500/50" />
          <h1 className="text-4xl md:text-6xl font-serif italic text-white mb-10 leading-tight">
            Our Private Sanctuary
          </h1>
          <button
            onClick={startExperience}
            className="group relative px-12 py-5 bg-white text-[var(--ink)] rounded-full font-bold uppercase tracking-[0.3em] text-xs hover:bg-rose-400 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              Tap to Enter <LucideHeart size={16} className="group-hover:fill-current" />
            </span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ink)]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <LucideHeart className="text-rose-400 fill-rose-400" size={60} />
        </motion.div>
      </div>
    );
  }

  const audioEl = <AudioPlayer isUnlocked={isUnlocked} settings={settings} />;

  if (!profile) {
    return (
      <>
        {audioEl}
        <LoginView />
      </>
    );
  }

  if (showWelcome) {
    return (
      <>
        {audioEl}
        <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center relative overflow-hidden">
          <FloatingHearts />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-8"
            >
              <LucideHeart size={80} className="text-rose-400 fill-rose-400 mx-auto" />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-4">
              Welcome back, My Love
            </h2>
            <p className="text-rose-300 opacity-60 uppercase tracking-[0.5em] text-[10px] font-black">
              Opening the gates of our love
            </p>
          </motion.div>
        </div>
      </>
    );
  }


  const tabs = [
    { id: 'countdown', label: 'Countdown', icon: LucideCalendar, locked: false },
    { id: 'daily', label: 'Daily Whisper', icon: LucideHeart, locked: false },
    { id: 'open_when', label: 'When...', icon: LucideSparkles, locked: !isAdmin && !isUnlocked && (appSettings['open_when'] ?? isPartner) },
    { id: 'gallery', label: 'Memories', icon: LucideImage, locked: !isAdmin && !isUnlocked && (appSettings['gallery'] ?? isPartner) },
    { id: 'letters', label: 'Letters', icon: LucideMail, locked: false },
    { id: 'jar', label: 'Motivation', icon: LucideCoffee, locked: !isAdmin && !isUnlocked && (appSettings['jar'] ?? false) },
    { id: 'surprise', label: 'Surprise', icon: LucideGift, locked: !isAdmin && !isUnlocked && (appSettings['surprise'] ?? isPartner) },
  ];

  return (
    <div className="min-h-screen pb-32 pt-20 md:pt-6 overflow-x-hidden bg-[#faf7f7]">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 z-[100] origin-left"
        style={{ scaleX }}
      />
      <FloatingHearts />
      <HeartCursor />
      
      <header className="fixed top-0 left-0 right-0 z-[100] p-4 flex justify-between items-center pointer-events-none bg-gradient-to-b from-white/20 to-transparent">
        <div className="pointer-events-auto">
          {audioEl}
        </div>
        <div className="pointer-events-auto">
          {profile && (
            <button
              onClick={() => {
                if (window.confirm("Logout panna koodadhu da! Sry, logout panna poriya?")) {
                  signOut();
                  window.location.reload();
                }
              }}
              className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-xl border border-white/40 flex items-center justify-center text-[var(--rose-deep)] shadow-lg hover:bg-rose-500 hover:text-white transition-all"
              title="Logout"
            >
              <LucideLogOut size={20} />
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10 pt-20">
        <AnimatePresence mode="wait">
          {activeTab === 'countdown' && <Countdown birthdayDate={BIRTHDAY_DATE} isUnlocked={isUnlocked} />}
          {activeTab === 'daily' && <GeminiGreeting />}
          {activeTab === 'open_when' && <OpenWhen isAdmin={isAdmin} />}
          {activeTab === 'gallery' && <MemoryGallery isAdmin={isAdmin} />}
          {activeTab === 'letters' && (
            <LoveLetters 
              isAdmin={isAdmin} 
              onLockedClick={() => setShowWaitModal(true)} 
            />
          )}
          {activeTab === 'jar' && <JarOfHearts isAdmin={isAdmin} />}
          {activeTab === 'surprise' && <Surprise isAdmin={isAdmin} sharedSettings={STATIC_SURPRISE} />}
        </AnimatePresence>

        <AnimatePresence>
          {showWaitModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white/90 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-sm w-full text-center relative border border-white/50"
              >
                <div className="w-20 h-20 bg-rose-50 rounded-3xl mx-auto mb-6 flex items-center justify-center text-rose-400">
                  <LucideHeart size={40} />
                </div>
                <h3 className="text-2xl font-serif italic text-[var(--ink)] mb-4">Patience, My Love ❤️</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 italic font-serif">
                  "may 10 varaium wiat pannu thangooo myluuuu 🤍🧿🤍🧿"
                </p>
                <button
                  onClick={() => setShowWaitModal(false)}
                  className="w-full py-4 bg-[var(--ink)] text-white rounded-2xl font-bold tracking-widest uppercase text-xs hover:bg-rose-500 transition-colors"
                >
                  I Will Wait 🤍
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/60 backdrop-blur-2xl border border-white/40 p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex gap-2 max-w-[95vw] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.locked && !isUnlocked) {
                setShowWaitModal(true);
                return;
              }
              setActiveTab(tab.id);
            }}
            className={`flex items-center gap-3 px-5 py-3 rounded-full transition-all relative shrink-0 ${
              activeTab === tab.id 
                ? 'text-white' 
                : 'text-gray-500 hover:text-gray-800'
            } ${(tab.locked && !isUnlocked) ? 'opacity-40' : ''}`}
          >
            <tab.icon size={18} />
            <span className="hidden md:inline font-bold text-[10px] uppercase tracking-[0.3em]">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-gradient-to-r from-rose-400 to-rose-300 rounded-full -z-10 shadow-lg shadow-rose-200"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </nav>

    </div>
  );
}

function LoginView() {
  const { signInWithCode } = useAuth();
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) return;
    
    setIsVerifying(true);
    setError('');
    
    const cleanCode = accessCode.trim().toLowerCase();
    
    // Custom Password Hack for Nandhu
    if (cleanCode === 'june8') {
      try {
        localStorage.setItem('partner_access', 'true');
        window.location.reload(); 
        return;
      } catch (err) {
        setError('Something went wrong. Try again.');
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    try {
      await signInWithCode(cleanCode);
    } catch (err: any) {
      setError(err.message || 'Invalid access code');
    } finally {
      setIsVerifying(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative font-sans overflow-hidden bg-[var(--ink)]">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=2000" 
          alt="Background" 
          className="w-full h-full object-cover opacity-40 blur-sm scale-110"
        />
      </div>

      <FloatingHearts />
      
      <div className="relative z-10 w-full max-w-lg px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 p-10 md:p-14 rounded-[4rem] shadow-2xl text-center"
        >
          <LucideHeart size={48} className="text-rose-400 fill-rose-400 mx-auto mb-8" />
          <h2 className="text-4xl font-serif italic text-white mb-4">Verification</h2>
          <p className="text-white/60 text-sm mb-10 leading-relaxed">
            Enter our secret code to unlock the garden of our memories.
          </p>

          <form onSubmit={handleVerifyCode} className="space-y-8">
            <div className="space-y-3">
              <input
                type="password"
                placeholder="SECRET CODE"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl focus:outline-none focus:border-rose-400 focus:bg-white/10 transition-all text-center tracking-[0.8em] font-mono text-2xl text-white placeholder:text-white/20"
                disabled={isVerifying}
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 justify-center">
                <LucideX size={16} /> {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isVerifying || !accessCode}
              className="w-full py-5 bg-white text-[var(--ink)] hover:bg-rose-400 hover:text-white rounded-3xl flex items-center justify-center gap-4 transition-all shadow-xl font-black uppercase tracking-[0.3em] text-xs disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Memories'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

