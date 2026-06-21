'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Shield, Activity, Server, Key, RefreshCw, Settings, BarChart3, BookOpen, Plus, Search, HelpCircle, FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Currently, we don't have a backend returning real verifications.
  // The system must never show fake data.
  const verifications: any[] = []; 

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030712] flex flex-col md:flex-row pt-16">
        
        {/* SIDEBAR (Desktop) */}
        <div className="w-full md:w-64 bg-[#0a0f1e] border-r border-white/5 flex-shrink-0 flex flex-col h-[calc(100vh-64px)] sticky top-16 hidden md:flex">
          <div className="p-6 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20 border border-[#00d4ff]/30 flex items-center justify-center mb-3">
              <Shield size={20} color="#00d4ff" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">Production Environment</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">ID: env_prd_9x81b</p>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-2">Platform</div>
            {[
              { id: 'overview', label: 'Live Verification', icon: Activity },
              { id: 'logs', label: 'Verification Logs', icon: Server },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors \${activeTab === item.id ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                <item.icon size={16} /> {item.label}
              </button>
            ))}

            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-6">Developer</div>
            {[
              { id: 'keys', label: 'API Keys', icon: Key },
              { id: 'webhooks', label: 'Webhooks', icon: RefreshCw },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors \${activeTab === item.id ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                <item.icon size={16} /> {item.label}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#00d4ff] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium text-white truncate">{user?.email || 'admin@company.com'}</div>
                <div className="text-xs text-slate-500 truncate">Developer Account</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#030712] relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00d4ff]/5 rounded-full blur-[150px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto space-y-8 relative z-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Live Verification Dashboard</h1>
                <p className="text-sm text-slate-400 mt-1">Real-time telemetry and analysis from your verification endpoints.</p>
              </div>
              <div className="flex gap-3">
                <Link href="/developer" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2">
                  <FileText size={16} /> API Reference
                </Link>
                <Link href="/demo/basic" className="px-4 py-2 bg-[#00d4ff] hover:bg-[#00b8e6] rounded-lg text-sm font-bold text-[#030712] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                  <Plus size={16} /> Run Verification
                </Link>
              </div>
            </div>

            {/* Content Area */}
            {mounted && verifications.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-32 px-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                  <Search size={28} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No verification data available yet</h3>
                <p className="text-slate-400 text-center max-w-md mb-8">
                  Run a live verification from one of our demo pages or through the API to populate analytics.
                </p>
                <div className="flex gap-4">
                  <Link href="/demo/basic" className="px-6 py-3 bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 rounded-xl font-medium hover:bg-[#00d4ff]/20 transition-colors">
                    Try Fast Liveness Demo
                  </Link>
                  <Link href="/demo/advanced" className="px-6 py-3 bg-white/5 text-white border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors">
                    Try Anti-Spoof Demo
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Structure for when data exists - currently unreachable as verifications is always empty */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0a0f1e] p-5 rounded-xl border border-white/10">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Face Detected</div>
                    <div className="text-2xl font-bold text-white">-</div>
                  </div>
                  <div className="bg-[#0a0f1e] p-5 rounded-xl border border-white/10">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Faces Found</div>
                    <div className="text-2xl font-bold text-white">-</div>
                  </div>
                  <div className="bg-[#0a0f1e] p-5 rounded-xl border border-white/10">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Blink Score</div>
                    <div className="text-2xl font-bold text-white">-</div>
                  </div>
                  <div className="bg-[#0a0f1e] p-5 rounded-xl border border-white/10">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Liveness Score</div>
                    <div className="text-2xl font-bold text-white">-</div>
                  </div>
                  <div className="bg-[#0a0f1e] p-5 rounded-xl border border-white/10">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Response Time</div>
                    <div className="text-2xl font-bold text-white">-</div>
                  </div>
                  <div className="bg-[#0a0f1e] p-5 rounded-xl border border-white/10">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Verification Result</div>
                    <div className="text-2xl font-bold text-white">-</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex items-start gap-3 p-4 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-xl text-sm text-[#d4b3ff]">
              <HelpCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p>
                <strong>Hackathon Prototype Mode:</strong> Metrics shown here will only be derived from real database records or live MediaPipe execution. Synthetic, simulated, or placeholder analytics are strictly disabled to ensure data integrity.
              </p>
            </div>

          </div>
        </main>

        {/* Mobile Navigation (Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0f1e] border-t border-white/10 flex justify-around p-3 z-50">
          {[
            { id: 'overview', icon: Activity },
            { id: 'logs', icon: Server },
            { id: 'analytics', icon: BarChart3 },
            { id: 'settings', icon: Settings },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-3 rounded-xl transition-colors \${activeTab === item.id ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'text-slate-400 hover:text-white'}`}>
              <item.icon size={20} />
            </button>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
