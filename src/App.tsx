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
  ChevronRight as LucideChevronRight,
  LogOut as LucideLogOut,
  Phone as LucidePhone,
  Chrome as LucideChrome,
  Coffee as LucideCoffee,
  X as LucideX
} from 'lucide-react';
import Countdown from './components/Countdown';
import DailyMessage from './components/DailyMessage';
import MemoryGallery from './components/MemoryGallery';
import LoveLetters from './components/LoveLetters';
import Surprise from './components/Surprise';
import JarOfHearts from './components/JarOfHearts';
import ThinkingStatus from './components/ThinkingStatus';
import OpenWhen from './components/OpenWhen';

import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { db } from './firebase';
import { SurpriseData } from './types';

const BIRTHDAY_DATE = new Date('2026-05-10T00:00:00+05:30'); // IST

function MainApp() {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('countdown');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [settings, setSettings] = useState<SurpriseData | null>(null);
  const [isFirebaseOnline, setIsFirebaseOnline] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  const [showWaitModal, setShowWaitModal] = useState(false);
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
    if (user && showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to fetch a non-existent doc from server to verify health
        await getDocFromServer(doc(db, 'health', 'check'));
        setIsFirebaseOnline(true);
      } catch (error: any) {
        if (error?.message?.includes('offline') || error?.code === 'unavailable') {
          setIsFirebaseOnline(false);
          console.error("Firestore is offline. Check your internet or Firebase config.");
        }
      }
    };
    testConnection();
  }, []);

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
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'surprise'));
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SurpriseData);
        }
      } catch (err) {
        console.error("App: Settings load failed", err);
      }
    };
    fetchSettings();
  }, []);

  const isAdmin = profile?.role === 'admin';
  const isPartner = profile?.role === 'partner';

  // Strict enforcement: if partner tries to bypass or is on a locked tab, force back to allowed ones
  useEffect(() => {
    if (isPartner && !isUnlocked) {
      const allowedTabs = ['countdown', 'daily'];
      // Check if current tab is manually unlocked
      const isManuallyUnlocked = settings?.manualUnlocks?.[activeTab];
      
      if (!allowedTabs.includes(activeTab) && !isManuallyUnlocked) {
        setActiveTab('countdown');
      }
    }
  }, [activeTab, isPartner, isUnlocked, settings]);

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <LucideHeart className="text-pink-500 fill-pink-500" size={60} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LoginView signInWithGoogle={signInWithGoogle} landingImageUrl={settings?.landingImageUrl} />;
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          <FloatingHearts />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center z-10"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <LucideHeart size={80} className="text-[var(--rose-soft)] fill-[var(--rose-soft)] mx-auto drop-shadow-[0_0_30px_rgba(232,165,178,0.4)]" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-3xl md:text-5xl font-serif italic text-white mb-4"
          >
            Welcome to Our Garden
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-[var(--rose-soft)] opacity-60 uppercase tracking-[0.5em] text-[10px] font-black"
          >
            Preparing the magic for you
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin && !isPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--rose-soft)] text-center relative overflow-hidden">
        <FloatingHearts />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(232,165,178,0.3)] border border-white/50 relative z-10"
        >
          <div className="w-20 h-20 bg-[var(--rose-soft)] rounded-[2rem] mx-auto mb-8 flex items-center justify-center text-[var(--rose-deep)] shadow-inner">
            <LucideLock size={32} />
          </div>
          <h1 className="text-4xl font-serif italic text-[var(--ink)] mb-4">A Secret Garden</h1>
          <p className="text-gray-500 mb-10 leading-relaxed text-sm italic">
            This digital sanctuary is reserved for two specific hearts. If you believe you belong here, verify your code or contact your partner. ❤️
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={signOut}
              className="w-full py-4 bg-[var(--ink)] text-white rounded-2xl font-bold tracking-widest uppercase text-[10px] hover:bg-[var(--rose-deep)] transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <LucideLogOut size={14} />
              Switch Account / Logout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'countdown', label: 'Countdown', icon: LucideCalendar, locked: false },
    { id: 'daily', label: 'Daily Heart', icon: LucideHeart, locked: false },
    { id: 'open_when', label: 'When...', icon: LucideSparkles, locked: isPartner && !isUnlocked && !settings?.manualUnlocks?.['open_when'] },
    { id: 'gallery', label: 'Memories', icon: LucideImage, locked: isPartner && !isUnlocked && !settings?.manualUnlocks?.['gallery'] },
    { id: 'letters', label: 'Letters', icon: LucideMail, locked: isPartner && !isUnlocked && !settings?.manualUnlocks?.['letters'] },
    { id: 'jar', label: 'Motivation', icon: LucideCoffee, locked: isPartner && !isUnlocked && !settings?.manualUnlocks?.['jar'] },
    { id: 'surprise', label: 'Surprise', icon: LucideGift, locked: isPartner && !isUnlocked && !settings?.manualUnlocks?.['surprise'] },
  ];

  return (
    <div className="min-h-screen pb-32 pt-20 md:pt-6 overflow-x-hidden">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--rose-deep)] via-[var(--rose-soft)] to-[var(--gold)] z-[100] origin-left"
        style={{ scaleX }}
      />
      <FloatingHearts />
      <HeartCursor />
      
      {!isFirebaseOnline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center shadow-lg backdrop-blur-md">
          Offline Mode • Some memories might be hiding
        </div>
      )}

      <AudioPlayer isUnlocked={isUnlocked} />
      {!isAdmin && <ThinkingStatus isAdmin={false} />}

      <AnimatePresence>
        {showWaitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-[var(--ink)]/40 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative border border-[var(--rose-deep)]/20"
            >
              <div className="w-20 h-20 bg-[var(--rose-soft)] rounded-3xl mx-auto mb-6 flex items-center justify-center text-[var(--rose-deep)]">
                <LucideGift size={40} className="animate-bounce" />
              </div>
              <h3 className="text-2xl font-serif italic text-[var(--ink)] mb-4">Patience, My Love ❤️</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Wait for that wonderful day, <span className="font-bold text-[var(--rose-deep)]">May 10</span>. The absolute surprise is worth the wait.
              </p>
              <button
                onClick={() => setShowWaitModal(false)}
                className="w-full py-4 bg-[var(--ink)] text-white rounded-2xl font-bold tracking-widest uppercase text-xs"
              >
                I Will Wait ❤️
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-40 px-5 py-3 flex justify-between items-center md:hidden backdrop-blur-md bg-[var(--rose-soft)]/90 border-b border-[var(--rose-deep)]/20 shadow-sm">
        <h1 className="font-serif italic text-lg text-[var(--ink)] font-bold">Eternal Love</h1>
        <button 
          onClick={signOut} 
          className="flex items-center gap-2 bg-[var(--rose-deep)]/10 text-[var(--rose-deep)] px-3 py-1.5 rounded-full border border-[var(--rose-deep)]/20 hover:bg-[var(--rose-deep)] hover:text-white transition-all"
        >
          <span className="text-[10px] uppercase font-black tracking-widest">Logout</span>
          <LucideLogOut size={14} />
        </button>
      </header>

      <main className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10 transition-all">
        <AnimatePresence mode="wait">
          {activeTab === 'countdown' && <Countdown birthdayDate={BIRTHDAY_DATE} isUnlocked={isUnlocked} />}
          {activeTab === 'daily' && <DailyMessage isAdmin={isAdmin} />}
          {activeTab === 'open_when' && <OpenWhen isAdmin={isAdmin} />}
          {activeTab === 'gallery' && <MemoryGallery isAdmin={isAdmin} />}
          {activeTab === 'letters' && <LoveLetters isAdmin={isAdmin} />}
          {activeTab === 'jar' && <JarOfHearts isAdmin={isAdmin} />}
          {activeTab === 'surprise' && <Surprise isAdmin={isAdmin} />}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/40 backdrop-blur-2xl border border-white/40 p-1.5 md:p-2.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex gap-1 md:gap-3 max-w-[95vw] overflow-x-auto no-scrollbar card-shadow snap-x snap-mandatory">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.locked) {
                setShowWaitModal(true);
                return;
              }
              setActiveTab(tab.id);
            }}
            className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-full transition-all relative shrink-0 snap-center ${
              activeTab === tab.id 
                ? 'text-white' 
                : 'text-[var(--ink)] opacity-60 hover:opacity-100'
            } ${tab.locked ? 'opacity-30' : ''}`}
          >
            <tab.icon size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden md:inline font-bold text-[10px] uppercase tracking-[0.4em]">{tab.label}</span>
            {tab.locked && (
              <LucideLock size={8} className="absolute -top-0.5 -right-0.5 bg-[var(--ink)] text-white rounded-full p-0.5" />
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-gradient-to-tr from-[var(--rose-deep)] to-[var(--gold)] rounded-full -z-10 shadow-lg shadow-[var(--rose-deep)]/20"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="hidden md:flex fixed top-8 left-8 z-50 items-center gap-4">
        <div className="bg-white/40 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--rose-soft)] to-[var(--rose-deep)] flex items-center justify-center text-white capitalize font-bold border-2 border-white shadow-sm">
            {user.email?.[0] || (user.isAnonymous ? 'S' : '?') }
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--rose-deep)] font-black leading-none mb-1">Beloved One</p>
            <p className="text-[11px] font-bold text-[var(--ink)] opacity-70">{user.email || user.phoneNumber || 'Secret Access'}</p>
          </div>
        </div>
        <button 
          onClick={signOut}
          className="w-11 h-11 rounded-full bg-white/40 backdrop-blur-2xl border border-white/40 flex items-center justify-center text-[var(--rose-deep)] hover:text-[var(--ink)] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:bg-white/60"
          title="Logout"
        >
          <LucideLogOut size={18} />
        </button>
      </div>
    </div>
  );
}

function LoginView({ signInWithGoogle, landingImageUrl }: { signInWithGoogle: () => void, landingImageUrl?: string }) {
  const { signInWithCode } = useAuth();
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) return;
    setIsVerifying(true);
    setError('');
    try {
      await signInWithCode(accessCode);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getDirectLink = (url: string) => {
    if (!url) return url;
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/file\/d\/([^\/]+)\//) || url.match(/\/file\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
      if (idMatch) return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w2000`;
    }
    return url;
  };

  const currentLandingImage = getDirectLink(landingImageUrl) || "https://drive.google.com/thumbnail?id=1GXfbZqr-TORVlvQHOBEi8nm3oS4TBZ4f&sz=w2000";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative font-sans overflow-hidden">
      {/* Absolute Full Screen Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          key={currentLandingImage}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="w-full h-full"
        >
          <img 
            src={currentLandingImage} 
            alt="Romantic Gallery Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      <FloatingHearts />
      
      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Side: Poetry/Welcome */}
        <div className="w-full md:w-1/2 text-white text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] font-black mb-6 drop-shadow-lg opacity-80">EST. 2024</p>
            <h1 className="text-5xl md:text-8xl font-serif italic mb-6 leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
              Our Journey of<br/>
              <span className="text-[var(--rose-soft)]">Beautiful Hearts</span>
            </h1>
            <p className="text-sm md:text-lg font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] max-w-md mx-auto md:mx-0">
              Dedicated to the one who makes every single moment feel like magic. ❤️
            </p>
          </motion.div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full md:w-[450px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 md:p-12 rounded-[3rem] shadow-2xl overflow-hidden relative group"
          >
            {/* Subtle glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--rose-soft)]/20 blur-[80px] rounded-full group-hover:bg-[var(--rose-soft)]/30 transition-all duration-1000" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 text-white mb-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <LucideHeart size={16} className="text-[var(--rose-soft)] fill-current" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Secret Garden Gateway</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-4">Welcome Back,<br/>My Love</h2>
              <p className="text-white/70 mb-10 text-xs leading-relaxed">
                Unlock the memories we've shared and the surprises yet to come. 
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[9px] uppercase tracking-[0.4em] text-white/60 font-black ml-1">Access Passcode</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[var(--rose-soft)] focus:bg-white/10 transition-all text-center tracking-[0.5em] font-mono text-xl shadow-sm text-white placeholder:text-white/20"
                      disabled={isVerifying}
                    />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--rose-soft)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 justify-center">
                    <LucideX size={14} /> {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || !accessCode}
                  className="w-full py-5 bg-white text-[var(--ink)] hover:bg-[var(--rose-soft)] hover:text-white rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl disabled:opacity-50 group font-bold uppercase tracking-widest text-[10px]"
                >
                  {isVerifying ? 'Verifying...' : (
                    <>
                      <span>Unlock Memories</span>
                      <LucideHeart size={14} className="group-hover:fill-current transition-all" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Or</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <button
                onClick={signInWithGoogle}
                className="mt-6 w-full py-4 bg-transparent border border-white/20 text-white rounded-2xl flex items-center justify-center gap-4 hover:bg-white/5 transition-all font-bold text-[10px] uppercase tracking-widest"
              >
                <LucideChrome size={18} />
                Google Access
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">Designed with love for our eternity</p>
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
