import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import GeminiGreeting from './GeminiGreeting';
import { PartyPopper, Heart, Sparkles } from 'lucide-react';

interface Props {
  birthdayDate: Date;
  isUnlocked: boolean;
}

export default function Countdown({ birthdayDate, isUnlocked }: Props) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);
      const difference = birthdayDate.getTime() - current.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [birthdayDate]);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  if (isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-8 text-pink-500"
        >
          <PartyPopper size={80} />
        </motion.div>
        
        <h1 className="text-4xl md:text-7xl font-romantic text-[var(--rose-deep)] mb-8 leading-tight">
          Happy Birthday, Nandhuu!
        </h1>

        <div className="max-w-2xl bg-white/60 backdrop-blur-lg p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Heart size={100} fill="currentColor" />
          </div>
          <p className="text-2xl md:text-3xl font-serif italic text-[var(--ink)] leading-relaxed relative z-10">
            "Today, the universe celebrates the most beautiful person I know. May your day be as radiant and magical as your heart. Happy Birthday, my absolute everything!"
          </p>
          <div className="mt-8 flex justify-center gap-4 text-pink-400">
            <Sparkles />
            <Heart className="fill-pink-400" />
            <Sparkles />
          </div>
        </div>

        <p className="text-xl font-serif text-[var(--ink)] opacity-60">
          All your surprises are now unlocked below. Explore them, my love. 💖
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="mb-8">
        <p className="text-[var(--rose-deep)] font-bold tracking-[0.3em] uppercase text-xs mb-2">Today is</p>
        <p className="text-2xl font-serif text-[var(--ink)]">
          {now.toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-4xl font-serif text-[var(--ink)] font-bold mt-1">
          {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>

      <h2 className="text-3xl md:text-5xl font-serif italic text-[var(--rose-deep)] mb-12 px-4 leading-tight">
        "Counting every second until your special day ❤️"
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-2xl w-full px-4 mb-16">
        {units.map((unit) => (
          <motion.div
            key={unit.label}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 md:p-8 border border-[var(--rose-deep)]/20 shadow-xl card-shadow"
          >
            <div className="text-4xl md:text-5xl font-serif font-black text-[var(--ink)] mb-1">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-[var(--rose-deep)] opacity-60">
              {unit.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-xl w-full px-4">
        <GeminiGreeting partnerName="Nandhuu" birthdayDate={birthdayDate} />
      </div>

      <p className="mt-12 text-[var(--ink)] opacity-60 italic max-w-sm px-6">
        Every heartbeat is a reminder of how much closer we are to celebrating you.
      </p>
    </motion.div>
  );
}
