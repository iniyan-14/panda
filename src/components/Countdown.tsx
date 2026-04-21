import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import GeminiGreeting from './GeminiGreeting';
import { PartyPopper, Heart, Sparkles, Clock } from 'lucide-react';

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
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mb-10 text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]"
        >
          <PartyPopper size={100} />
        </motion.div>
        
        <h1 className="text-5xl md:text-8xl font-serif italic text-rose-500 mb-10 leading-tight">
          Happy Birthday,<br/>My Love!
        </h1>

        <div className="max-w-2xl bg-white/40 backdrop-blur-2xl p-10 md:p-16 rounded-[4rem] border border-white shadow-[0_32px_64px_rgba(0,0,0,0.05)] relative overflow-hidden mb-12">
          <div className="absolute -top-10 -right-10 opacity-5">
            <Heart size={200} fill="currentColor" className="text-rose-500" />
          </div>
          <p className="text-2xl md:text-4xl font-serif italic text-gray-800 leading-relaxed relative z-10">
            "Today marks the anniversary of the most beautiful gift the universe ever gave me. You are my forever and always."
          </p>
          <div className="mt-10 flex justify-center gap-6 text-rose-300">
            <Sparkles size={24} className="animate-pulse" />
            <Heart size={24} className="fill-rose-300" />
            <Sparkles size={24} className="animate-pulse" />
          </div>
        </div>

        <p className="text-xl font-serif text-gray-500 italic max-w-sm">
          A new chapter begins today. All your physical and digital surprises are now ready for you. ❤️
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center py-12"
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 inline-flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/40 shadow-sm">
          <Clock size={16} className="text-rose-400" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-rose-400">Current Moment</p>
        </div>
        <p className="text-3xl md:text-4xl font-serif italic text-gray-800 mt-4 leading-none">
          {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 opacity-60">
          {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </motion.div>

      <h2 className="text-4xl md:text-6xl font-serif italic text-gray-800 mb-16 px-4 leading-tight">
        "Counting every heartbeat<br/>until your day ❤️"
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-3xl w-full px-4 mb-20">
        {units.map((unit) => (
          <motion.div
            key={unit.label}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.03)] group"
          >
            <div className="text-5xl md:text-6xl font-serif font-black text-gray-800 mb-2 group-hover:text-rose-500 transition-colors">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-black text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity">
              {unit.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-xl w-full px-4">
        <GeminiGreeting partnerName="My Love" />
      </div>

      <p className="mt-16 text-gray-400 text-sm italic max-w-sm px-6 leading-relaxed">
        "Time flies, but my love for you stands still, growing deeper with every passing second."
      </p>
    </motion.div>
  );
}

