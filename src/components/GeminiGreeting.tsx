import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface GeminiGreetingProps {
  partnerName: string;
  birthdayDate: Date;
}

export default function GeminiGreeting({ partnerName, birthdayDate }: GeminiGreetingProps) {
  const [wish, setWish] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWish = async () => {
      const today = new Date().toISOString().split('T')[0];
      const cached = localStorage.getItem(`daily_wish_${today}`);
      
      if (cached) {
        setWish(cached);
        setLoading(false);
        return;
      }

      try {
        // Robust key extraction - try both process.env (handled by Vite define) and import.meta.env
        const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                       (import.meta.env?.VITE_GEMINI_API_KEY) ||
                       (import.meta.env?.GEMINI_API_KEY);

        if (!apiKey) {
          throw new Error("Missing API Key");
        }
        
        const ai = new GoogleGenAI({ apiKey });
        const daysLeft = Math.ceil((birthdayDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: `Generate a short, sweet, romantic "Advance Happy Birthday" wish for my love, ${partnerName}. 
                     Her birthday is May 10th. Today is ${new Date().toDateString()}.
                     There are ${daysLeft} days remaining. 
                     Make it charming, intimate, and a bit poetic. Keep it under 20 words. No emojis except maybe one heart at the end.`,
        });

        // The new SDK (@google/genai) returns text directly in response
        const generatedWish = response.text || "Advance Happy Birthday, my love!";
        setWish(generatedWish);
        localStorage.setItem(`daily_wish_${today}`, generatedWish);
      } catch (err) {
        console.error("Gemini failed:", err);
        setWish(`Every day with you is a gift. Advance Happy Birthday, my absolute everything! ❤️`);
      }
      setLoading(false);
    };

    fetchWish();
  }, [partnerName, birthdayDate]);


  if (loading) return (
    <div className="flex items-center justify-center gap-2 text-pink-400 font-serif italic py-4">
      <Sparkles className="animate-spin" size={16} />
      <span>Creating a magical wish...</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-inner group overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-20 h-20 bg-pink-100/30 rounded-br-[100px] -ml-8 -mt-8 -z-10 group-hover:scale-110 transition-transform" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-pink-100/30 rounded-tl-[100px] -mr-8 -mb-8 -z-10 group-hover:scale-110 transition-transform" />
      
      <div className="flex flex-col items-center text-center">
        <Heart className="text-pink-500 mb-3 fill-pink-500/10 animate-pulse" size={24} />
        <p className="text-xl md:text-2xl font-serif italic text-gray-800 leading-relaxed font-medium">
          "{wish}"
        </p>
        <p className="text-[10px] uppercase tracking-[0.3em] text-pink-400 font-black mt-4 opacity-60">
          A whisper for today
        </p>
      </div>
    </motion.div>
  );
}
