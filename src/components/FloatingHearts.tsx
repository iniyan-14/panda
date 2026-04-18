import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number; left: string; duration: number; size: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts((prev) => [
        ...prev.slice(-20), // Keep max 20 hearts
        {
          id: Date.now(),
          left: `${Math.random() * 100}%`,
          duration: Math.random() * 10 + 10,
          size: Math.random() * 20 + 10
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ y: '110vh', opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ 
            y: '-10vh', 
            opacity: [0, 0.4, 0],
            scale: [0.5, 1.2, 0.8],
            rotate: [0, 45, -45]
          }}
          transition={{ duration: heart.duration, ease: 'linear' }}
          className="absolute"
          style={{ left: heart.left }}
        >
          <Heart 
            size={heart.size} 
            className="text-[var(--rose-deep)] fill-[var(--rose-deep)]" 
            style={{ 
              filter: `blur(${heart.size / 15}px) drop-shadow(0 0 10px rgba(219, 145, 159, 0.3))` 
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
