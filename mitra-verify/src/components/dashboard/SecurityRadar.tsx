'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SecurityRadar() {
  const [blips, setBlips] = useState<{ id: number; x: number; y: number; type: string }[]>([]);

  useEffect(() => {
    // Simulate random threat blips
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newBlip = {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          type: Math.random() > 0.8 ? 'high' : 'low'
        };
        setBlips(prev => [...prev.slice(-4), newBlip]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-full border border-white/10 bg-black/20 overflow-hidden flex items-center justify-center" style={{ boxShadow: 'inset 0 0 40px rgba(0, 212, 255, 0.1)' }}>
      {/* Concentric rings */}
      <div className="absolute inset-4 rounded-full border border-white/5"></div>
      <div className="absolute inset-12 rounded-full border border-white/5"></div>
      <div className="absolute inset-20 rounded-full border border-white/5"></div>
      
      {/* Crosshairs */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-[1px] bg-white/5"></div>
        <div className="absolute h-full w-[1px] bg-white/5"></div>
      </div>

      {/* Radar sweep */}
      <div 
        className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left"
        style={{
          background: 'conic-gradient(from 90deg at 0% 100%, transparent 0deg, rgba(0, 212, 255, 0.4) 90deg)',
          animation: 'radar-sweep 4s infinite linear'
        }}
      ></div>

      {/* Blips */}
      {blips.map(blip => (
        <motion.div
          key={blip.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 2] }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${blip.x}%`,
            top: `${blip.y}%`,
            background: blip.type === 'high' ? '#ff3366' : '#00ff88',
            boxShadow: `0 0 10px ${blip.type === 'high' ? '#ff3366' : '#00ff88'}`
          }}
        />
      ))}
    </div>
  );
}
