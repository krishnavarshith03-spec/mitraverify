'use client';

import React from 'react';

const statuses = [
  { label: 'System Online', color: '#00d4ff' },
  { label: 'Face Detection Active', color: '#00d4ff' },
  { label: 'Anti-Spoof Enabled', color: '#00ff9d' },
  { label: 'Identity Match Engine Running', color: '#007BFF' },
];

export default function LiveStatusIndicators() {
  return (
    <div className="flex flex-wrap gap-3 mt-4 animate-fade-up animate-delay-1">
      {statuses.map((status, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <div 
            className="w-1.5 h-1.5 rounded-full animate-pulse" 
            style={{ 
              backgroundColor: status.color, 
              boxShadow: `0 0 8px ${status.color}`,
              animationDelay: `${i * 0.2}s`
            }} 
          />
          <span className="text-xs font-mono text-slate-300 tracking-wide uppercase">{status.label}</span>
        </div>
      ))}
    </div>
  );
}
