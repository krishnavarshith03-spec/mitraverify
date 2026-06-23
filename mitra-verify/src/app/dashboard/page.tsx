'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Shield, Activity, Server, BarChart3, 
  HelpCircle, FileText, ShieldAlert, Globe, Clock, CheckCircle2, XCircle, AlertTriangle, Eye, Zap, RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface VerificationEvent {
  id: string;
  timestamp: string;
  apiType: string;
  status: string;
  confidence: number;
  processingTimeMs: number;
  spoofFlag: boolean;
  faceDetectedFlag: boolean;
  identityMatchedFlag: boolean;
  attentionScore: number;
  ip: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const [events, setEvents] = useState<VerificationEvent[]>([]);
  const [overview, setOverview] = useState({
    total: 0,
    successful: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchData();
    // Refresh every 5 seconds to show live updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, overviewRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/analytics/overview')
      ]);
      
      const eventsData = await eventsRes.json();
      const overviewData = await overviewRes.json();
      
      if (eventsData && eventsData.events) {
        setEvents(eventsData.events);
      }
      
      if (overviewData) {
        setOverview({
          total: overviewData.total_verifications || 0,
          successful: overviewData.successful_verifications || 0,
          failed: overviewData.failed_verifications || 0,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const hasData = overview.total > 0;

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-[#020813] flex flex-col relative overflow-hidden pt-20">
        
        {/* Global Dashboard Background Layers */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#00d4ff]/10 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#7c3aed]/10 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 w-full relative z-10">
          <div className="p-6 md:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  Enterprise Security Command Center
                </h1>
                
                {/* System Health Indicators */}
                <div className="flex flex-wrap items-center gap-3 mt-4 mb-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00ff88]/10 border border-[#00ff88]/20 shadow-[0_0_10px_rgba(0,255,136,0.1)]">
                    <CheckCircle2 size={12} className="text-[#00ff88]" />
                    <span className="text-[10px] uppercase tracking-widest text-[#00ff88] font-bold">System Operational</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10">
                    <Activity size={12} className="text-[#00d4ff]" />
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">99.99% Uptime</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10">
                    <Globe size={12} className="text-[#7c3aed]" />
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">12 Active Regions</span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mt-3 font-light max-w-2xl">
                  Real-time threat monitoring and biometric telemetry across global edge nodes.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link href="/developer" className="px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl text-[13px] font-semibold text-white transition-all flex items-center gap-2">
                  <FileText size={16} /> API Docs
                </Link>
                <Link href="/demo/enterprise" className="px-5 py-2.5 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] hover:brightness-110 rounded-xl text-[13px] font-bold text-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                  <Activity size={16} /> Live Demo
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                 <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !hasData ? (
              <div className="flex flex-col items-center justify-center py-16">
                {/* Premium Empty State: Architecture & Engine Status */}
                <div className="w-20 h-20 bg-[#00d4ff]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                  <Activity size={32} className="text-[#00d4ff]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">System Ready & Awaiting Telemetry</h2>
                <p className="text-slate-400 max-w-lg text-center mb-10 text-sm">
                  The MITRA VERIFY enterprise engines are fully operational. Connect your application via the API, or run a test verification to start generating real-time liveness data.
                </p>

                {/* Architecture Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                  {/* Engine 1 */}
                  <div className="bg-[#050a17]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4"><span className="flex items-center gap-1.5 text-[#00ff88] text-[10px] font-bold uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></span> Online</span></div>
                     <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/30 flex items-center justify-center mb-4"><Eye size={18} className="text-[#7c3aed]" /></div>
                     <h3 className="text-white font-bold text-[15px] mb-2">MediaPipe Face Mesh</h3>
                     <p className="text-slate-500 text-xs leading-relaxed">478-point 3D facial landmark detection engine. Processing node active.</p>
                  </div>

                  {/* Engine 2 */}
                  <div className="bg-[#050a17]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4"><span className="flex items-center gap-1.5 text-[#00ff88] text-[10px] font-bold uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></span> Online</span></div>
                     <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center mb-4"><Zap size={18} className="text-[#00d4ff]" /></div>
                     <h3 className="text-white font-bold text-[15px] mb-2">Liveness Detection</h3>
                     <p className="text-slate-500 text-xs leading-relaxed">Real-time heuristic evaluation including blink rate, head pose, and micro-expressions.</p>
                  </div>

                  {/* Engine 3 */}
                  <div className="bg-[#050a17]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4"><span className="flex items-center gap-1.5 text-[#00ff88] text-[10px] font-bold uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></span> Online</span></div>
                     <div className="w-10 h-10 rounded-lg bg-[#ff3366]/10 border border-[#ff3366]/30 flex items-center justify-center mb-4"><ShieldAlert size={18} className="text-[#ff3366]" /></div>
                     <h3 className="text-white font-bold text-[15px] mb-2">Anti-Spoofing AI</h3>
                     <p className="text-slate-500 text-xs leading-relaxed">Deepfake and presentation attack detection models initialized and ready.</p>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                   <Link href="/demo/enterprise" className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm transition-all hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                     Run Test Verification
                   </Link>
                   <Link href="/developer" className="px-6 py-3 bg-white/[0.05] border border-white/10 text-white font-bold rounded-xl text-sm transition-all hover:bg-white/[0.1]">
                     View API Integration
                   </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Real KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative p-5 rounded-2xl bg-[#050a17]/60 backdrop-blur-md border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00d4ff]/10 border border-[#00d4ff]/30">
                        <Activity size={18} className="text-[#00d4ff]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white tracking-tight mb-1">{overview.total.toLocaleString()}</div>
                      <div className="text-[12px] text-slate-400 uppercase tracking-wider font-semibold">Total Verifications</div>
                    </div>
                  </div>

                  <div className="relative p-5 rounded-2xl bg-[#050a17]/60 backdrop-blur-md border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00ff88]/10 border border-[#00ff88]/30">
                        <CheckCircle2 size={18} className="text-[#00ff88]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white tracking-tight mb-1">{overview.successful.toLocaleString()}</div>
                      <div className="text-[12px] text-slate-400 uppercase tracking-wider font-semibold">Successful</div>
                    </div>
                  </div>

                  <div className="relative p-5 rounded-2xl bg-[#050a17]/60 backdrop-blur-md border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#ff3366]/10 border border-[#ff3366]/30">
                        <ShieldAlert size={18} className="text-[#ff3366]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white tracking-tight mb-1">{overview.failed.toLocaleString()}</div>
                      <div className="text-[12px] text-slate-400 uppercase tracking-wider font-semibold">Spoofs Blocked</div>
                    </div>
                  </div>
                </div>

                {/* Real Live Operations Feed */}
                <div className="rounded-2xl bg-[#050a17]/60 backdrop-blur-md border border-white/5 overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Server size={16} className="text-[#00d4ff]" /> Real-Time Telemetry Feed
                    </h3>
                    <div className="flex items-center gap-3">
                      <button onClick={fetchData} className="text-slate-400 hover:text-white transition-colors" title="Force Refresh">
                        <RefreshCw size={14} />
                      </button>
                      <span className="flex items-center gap-2 text-[11px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded border border-[#00ff88]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" /> Live Polling
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#050a17] z-10 shadow-md">
                        <tr className="border-b border-white/5 text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
                          <th className="p-4 font-medium">Session ID</th>
                          <th className="p-4 font-medium">Time</th>
                          <th className="p-4 font-medium">IP Address</th>
                          <th className="p-4 font-medium">Liveness Score</th>
                          <th className="p-4 font-medium">Processing Time</th>
                          <th className="p-4 font-medium text-right">Verification Result</th>
                        </tr>
                      </thead>
                      <tbody className="text-[13px]">
                        {events.map((event) => {
                          const isSuccess = event.status === 'VERIFIED' || event.status === 'IDENTITY MATCHED';
                          const isSpoof = event.spoofFlag || event.status.includes('SPOOF');
                          return (
                            <tr key={event.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                              <td className="p-4 font-mono text-slate-300">{event.id}</td>
                              <td className="p-4 text-slate-400 flex items-center gap-1.5">
                                <Clock size={14} className="opacity-50" /> 
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="p-4">
                                <div className="text-[12px] font-mono text-slate-400">{event.ip}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-white">{(event.confidence * 100).toFixed(1)}%</span>
                                  <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full" 
                                      style={{ 
                                        width: `${event.confidence * 100}%`, 
                                        backgroundColor: isSuccess ? '#00d4ff' : '#ff3366' 
                                      }} 
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-mono text-slate-400">{event.processingTimeMs.toFixed(0)}ms</td>
                              <td className="p-4 text-right">
                                {isSuccess ? (
                                  <span className="inline-flex items-center gap-1.5 bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">
                                    <CheckCircle2 size={12} /> {event.status}
                                  </span>
                                ) : (
                                  <span className="inline-flex flex-col items-end gap-0.5">
                                    <span className="inline-flex items-center gap-1.5 bg-[#ff3366]/10 text-[#ff3366] border border-[#ff3366]/20 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">
                                      <XCircle size={12} /> {event.status}
                                    </span>
                                    {isSpoof && <span className="text-[10px] text-slate-500 tracking-wider uppercase mt-1">Spoof Detected</span>}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {events.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                              No events found in the database.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
