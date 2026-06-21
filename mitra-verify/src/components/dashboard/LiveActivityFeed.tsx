'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface FeedItem {
  id: string;
  timestamp: string;
  status: string;
  confidence: number;
  ip: string;
}

export default function LiveActivityFeed({ isDemoMode }: { isDemoMode?: boolean }) {
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (Array.isArray(data)) {
          setFeed(data.slice(0, 8)); // keep top 8
        }
      } catch (err) {
        console.error('Failed to fetch live events', err);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 3000); // Polling every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2 overflow-hidden h-[300px] relative mt-4">
      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0f1e] to-transparent z-10 pointer-events-none" />
      
      <AnimatePresence initial={false}>
        {feed.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-sm"
          >
            No verification activity yet
          </motion.div>
        ) : (
          feed.map((item) => {
            let color = '#00ff88';
            let bg = 'rgba(0, 255, 136, 0.05)';
            let border = 'rgba(0, 255, 136, 0.15)';
            let Icon = Shield;
            let label = 'VERIFIED';
            
            if (item.status === 'SPOOF ATTEMPT') { color = '#ffb800'; bg = 'rgba(255, 184, 0, 0.05)'; border = 'rgba(255, 184, 0, 0.15)'; Icon = AlertTriangle; label = 'SPOOF ATTACK'; }
            else if (item.status === 'FAILED') { color = '#ff3366'; bg = 'rgba(255, 51, 102, 0.05)'; border = 'rgba(255, 51, 102, 0.15)'; Icon = AlertTriangle; label = 'FAILED'; }
            else if (item.status === 'NO FACE DETECTED') { color = '#94a3b8'; bg = 'rgba(148, 163, 184, 0.05)'; border = 'rgba(148, 163, 184, 0.15)'; Icon = Eye; label = 'NO FACE'; }

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm"
                style={{ background: bg, borderColor: border }}
              >
                <div className="flex-shrink-0" style={{ color }}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                      <span className="text-xs font-bold tracking-wide" style={{ color }}>{label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono tracking-widest">{format(new Date(item.timestamp), 'HH:mm:ss')}</span>
                  </div>
                  <div className="flex justify-between items-baseline mt-0.5">
                    <span className="text-[10px] text-slate-400 font-mono">conf: {(item.confidence * 100).toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider">{item.ip}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}
