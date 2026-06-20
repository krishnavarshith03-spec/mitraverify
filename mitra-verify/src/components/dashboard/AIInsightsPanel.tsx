'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AIInsightsPanel({ overview }: { overview: any }) {
  const [insightIndex, setInsightIndex] = useState(0);

  const insights = [
    {
      title: "Global Threat Level: Low",
      description: "Spoof attempts have decreased by 12% in the last 24 hours. Verification success rate remains highly stable at >98%.",
      action: "View Threat Logs",
      color: "#00ff88"
    },
    {
      title: "Performance Anomaly",
      description: "Average processing time dropped to 142ms. Edge caching optimization successfully deployed across all regional nodes.",
      action: "Check Latency",
      color: "#00d4ff"
    },
    {
      title: "API Usage Spike",
      description: "Advanced Liveness endpoint usage increased by 45% in the AP-South region. Scaling automated workers.",
      action: "Manage API Keys",
      color: "#7c3aed"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [insights.length]);

  const current = insights[insightIndex];

  return (
    <div className="relative overflow-hidden p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent h-full flex flex-col justify-center">
      {/* Glow effect based on current insight */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 blur-3xl rounded-full opacity-20 transition-colors duration-1000"
        style={{ background: current.color }}
      />
      
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} color={current.color} className="animate-pulse" />
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase">AI Intelligence</h3>
      </div>
      
      <motion.div
        key={insightIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2 relative z-10"
      >
        <h4 className="text-base font-medium" style={{ color: current.color }}>{current.title}</h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          {current.description}
        </p>
        <button className="flex items-center gap-1 text-xs font-semibold mt-2 hover:opacity-80 transition-opacity w-fit" style={{ color: current.color }}>
          {current.action} <ArrowRight size={12} />
        </button>
      </motion.div>
    </div>
  );
}
