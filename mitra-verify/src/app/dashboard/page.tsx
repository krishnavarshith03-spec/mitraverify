'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Shield, Activity, Server, CheckCircle2, ShieldAlert, Fingerprint, 
  Eye, Clock, Key, Zap, Network, Layers, AlertTriangle, FileText, 
  Cpu, Webhook, Box, Lock, Code, Link as LinkIcon, Database, Terminal
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface TelemetryData {
  executive_overview: {
    total_verifications: number;
    successful_verifications: number;
    failed_verifications: number;
    spoof_attempts_blocked: number;
    identity_matches: number;
    avg_processing_time_ms: number;
    active_api_keys: number;
  };
  security_events: {
    deepfake: number;
    replay_attack: number;
    identity_mismatch: number;
    multiple_faces: number;
    face_not_found: number;
  };
}

interface VerificationEvent {
  id: string;
  timestamp: string;
  apiType: string;
  status: string;
  confidence: number;
  processingTimeMs: number;
  spoofFlag: boolean;
  identityMatchedFlag: boolean;
}

// ─── FRAMER VARIANTS ────────────────────────────────────────────────────────
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [events, setEvents] = useState<VerificationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [overviewRes, eventsRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/events')
      ]);
      const overviewData = await overviewRes.json();
      const eventsData = await eventsRes.json();
      
      setTelemetry(overviewData.data);
      setEvents(Array.isArray(eventsData) ? eventsData.slice(0, 15) : []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = telemetry && telemetry.executive_overview.total_verifications > 0;
  const hasThreats = telemetry && (
    telemetry.security_events.deepfake > 0 ||
    telemetry.security_events.replay_attack > 0 ||
    telemetry.security_events.identity_mismatch > 0 ||
    telemetry.security_events.multiple_faces > 0 ||
    telemetry.security_events.face_not_found > 0
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030712] font-sans selection:bg-[#00d4ff]/30 text-slate-300 overflow-x-hidden relative">
        <Navbar />

        {/* Global Dark Theme Backgrounds & Neon Glows */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[#00d4ff]/5 blur-[200px] rounded-full mix-blend-screen" />
           <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#0066ff]/5 blur-[200px] rounded-full mix-blend-screen" />
           <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)]" />
        </div>

        <main className="relative z-10 pt-28 pb-32 px-6 md:px-8 lg:px-12 max-w-[1800px] mx-auto space-y-12">
           
           {/* SECTION 1: Enterprise Header */}
           <motion.section 
             variants={containerVariants} initial="hidden" animate="visible"
             className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-[rgba(0,255,255,0.08)] pb-8"
           >
              <motion.div variants={itemVariants} className="max-w-2xl">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 flex items-center gap-4">
                   Enterprise Security Console
                 </h1>
                 <p className="text-base text-slate-400 leading-relaxed font-light">
                   Real-time biometric authentication, identity assurance, anti-spoof intelligence, and verification infrastructure monitoring.
                 </p>
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
                 <Link href="/developer" className="px-5 py-2.5 rounded-xl bg-[rgba(10,20,40,0.6)] border border-[rgba(0,255,255,0.08)] hover:bg-[rgba(10,20,40,0.8)] hover:border-[rgba(0,212,255,0.3)] transition-all text-sm font-medium text-white flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.05)]">
                   <FileText size={16} className="text-slate-400" /> API Documentation
                 </Link>
                 <button className="px-5 py-2.5 rounded-xl bg-[rgba(10,20,40,0.6)] border border-[rgba(0,255,255,0.08)] hover:bg-[rgba(10,20,40,0.8)] hover:border-[rgba(0,212,255,0.3)] transition-all text-sm font-medium text-white flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.05)]">
                   <Key size={16} className="text-slate-400" /> Generate API Key
                 </button>
                 <Link href="/demo/enterprise" className="px-6 py-2.5 rounded-xl bg-[#00d4ff] text-[#020610] hover:bg-white transition-all text-sm font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(0,212,255,0.2)] flex items-center gap-2">
                   <Activity size={16} /> Launch Verification
                 </Link>
              </motion.div>
           </motion.section>

           {/* SECTION 8: Live Verification Module (Centerpiece moved up for SOC feel) */}
           <motion.section variants={itemVariants} initial="hidden" animate="visible" className="relative w-full aspect-[21/9] md:aspect-[32/9] rounded-2xl bg-[rgba(5,10,25,0.8)] border border-[rgba(0,255,255,0.1)] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5)] group">
             {/* Scanner Scanner Animation Background */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen" />
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#00d4ff]/30 rounded-full animate-[spin_10s_linear_infinite]" />
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-[#00d4ff]/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
             <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#00d4ff]/50 shadow-[0_0_20px_#00d4ff] animate-[scan_3s_ease-in-out_infinite]" style={{ transformOrigin: 'center' }} />
             
             {/* Overlay UI */}
             <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center z-10 bg-gradient-to-t from-[#030712] to-transparent">
                <Shield size={48} className="text-[#00d4ff] mb-4 opacity-80 filter drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]" />
                <h2 className="text-2xl font-bold text-white mb-2">Live Biometric Scanning Engine</h2>
                <p className="text-slate-400 text-sm max-w-md mb-8">Deploy enterprise-grade liveness detection and facial recognition instantaneously via the MITRA global edge network.</p>
                <div className="flex gap-4">
                  <Link href="/demo/enterprise" className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00d4ff]/50 transition-all text-sm font-bold text-white flex items-center gap-2 backdrop-blur-md">
                    Start Verification <Eye size={16} />
                  </Link>
                  <button className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00d4ff]/50 transition-all text-sm font-bold text-white flex items-center gap-2 backdrop-blur-md">
                    Enroll Identity <Fingerprint size={16} />
                  </button>
                  <button className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00d4ff]/50 transition-all text-sm font-bold text-white flex items-center gap-2 backdrop-blur-md hidden sm:flex">
                    API Test <Terminal size={16} />
                  </button>
                </div>
             </div>
           </motion.section>

           {/* SECTION 2: System Status Grid */}
           <motion.section variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Face Detection Engine', icon: Eye },
                { label: 'MediaPipe Engine', icon: Cpu },
                { label: 'Liveness Analysis', icon: Activity },
                { label: 'Anti-Spoofing AI', icon: ShieldAlert },
                { label: 'Identity Matching', icon: Fingerprint },
                { label: 'API Gateway', icon: Server },
              ].map((sys, i) => (
                <div key={i} className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 blur-[30px] group-hover:bg-[#00ff88]/10 transition-colors" />
                  <div className="flex justify-between items-start z-10">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                       <sys.icon size={16} className="text-[#00d4ff]" />
                    </div>
                    <div className="flex items-center gap-2 bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-1 rounded-md">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_5px_#00ff88]" />
                       <span className="text-[9px] font-mono font-bold text-[#00ff88] uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                  <div className="z-10 mt-4">
                    <div className="text-xs font-bold text-white">{sys.label}</div>
                  </div>
                </div>
              ))}
           </motion.section>

           {/* SECTION 3: Verification Architecture */}
           <motion.section variants={itemVariants} initial="hidden" animate="visible" className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.03)_0%,transparent_100%)]" />
             <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-10 flex items-center gap-3">
               <Network size={16} className="text-[#00d4ff]" /> System Architecture Flow
             </h3>
             <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 w-full px-4 overflow-x-auto pb-4 hide-scrollbar">
                {/* Horizontal Line Connector */}
                <div className="absolute top-1/2 left-10 right-10 h-[1px] bg-white/10 -translate-y-1/2 hidden md:block z-0" />
                
                {/* Animated Particle on Line */}
                <div className="absolute top-1/2 left-10 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent -translate-y-1/2 hidden md:block z-0 animate-[shimmer_3s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />

                {[
                  { name: 'Client Device', type: 'Gateway' },
                  { name: 'Capture Layer', type: 'Processor' },
                  { name: 'Face Mesh Engine', type: 'Compute' },
                  { name: 'Liveness Engine', type: 'Heuristic' },
                  { name: 'Anti-Spoof Engine', type: 'Policy' },
                  { name: 'Identity Matching', type: 'Tensor' },
                  { name: 'Auth Decision', type: 'Service' },
                  { name: 'Response API', type: 'Output' },
                ].map((node, i) => (
                  <div key={i} className="flex flex-col items-center relative z-10 shrink-0">
                     <div className="w-12 h-12 rounded-full bg-[#050a17] border border-[#00d4ff]/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,212,255,0.1)] relative">
                        <div className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
                        <div className="absolute inset-0 rounded-full border border-[#00d4ff]/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                     </div>
                     <div className="text-[11px] font-bold text-white whitespace-nowrap">{node.name}</div>
                     <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{node.type}</div>
                  </div>
                ))}
             </div>
           </motion.section>

           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                 {/* SECTION 4: Real System Overview */}
                 <motion.section variants={itemVariants} initial="hidden" animate="visible" className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-6">
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                     <Database size={16} className="text-[#00d4ff]" /> Real System Overview
                   </h3>
                   
                   {!hasData ? (
                      <div className="w-full py-16 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center bg-white/[0.01]">
                        <Database size={32} className="text-slate-600 mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2">No Verification Data Available</h4>
                        <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Waiting For Verification Events</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <KpiCard label="Total Verifications" value={telemetry.executive_overview.total_verifications.toLocaleString()} />
                         <KpiCard label="Verified Sessions" value={telemetry.executive_overview.successful_verifications.toLocaleString()} color="text-[#00ff88]" />
                         <KpiCard label="Failed Sessions" value={telemetry.executive_overview.failed_verifications.toLocaleString()} color="text-[#ff3366]" />
                         <KpiCard label="Blocked Spoofs" value={telemetry.executive_overview.spoof_attempts_blocked.toLocaleString()} color="text-[#ffb800]" />
                         <KpiCard label="Identity Matches" value={telemetry.executive_overview.identity_matches.toLocaleString()} color="text-[#7c3aed]" />
                         <KpiCard label="Avg Verification Time" value={`${telemetry.executive_overview.avg_processing_time_ms}ms`} color="text-[#00d4ff]" />
                      </div>
                   )}
                 </motion.section>

                 {/* SECTION 5: Verification Activity */}
                 <motion.section variants={itemVariants} initial="hidden" animate="visible" className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-6 overflow-hidden">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
                        <Activity size={16} className="text-[#00d4ff]" /> Verification Activity Feed
                      </h3>
                   </div>

                   {!hasData ? (
                      <div className="w-full py-16 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center bg-white/[0.01]">
                        <Activity size={32} className="text-slate-600 mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2">Activity Stream Empty</h4>
                        <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Listening for incoming connections...</p>
                      </div>
                   ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                           <thead className="bg-white/[0.02] text-slate-400 font-mono border-b border-white/5">
                              <tr>
                                 <th className="px-4 py-3 font-medium tracking-widest">ID</th>
                                 <th className="px-4 py-3 font-medium tracking-widest">Timestamp</th>
                                 <th className="px-4 py-3 font-medium tracking-widest">API</th>
                                 <th className="px-4 py-3 font-medium tracking-widest">Result</th>
                                 <th className="px-4 py-3 font-medium tracking-widest">Liveness</th>
                                 <th className="px-4 py-3 font-medium tracking-widest">Identity</th>
                                 <th className="px-4 py-3 font-medium tracking-widest">Processing</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {events.map((ev) => (
                                 <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-4 font-mono text-slate-300">{ev.id}</td>
                                    <td className="px-4 py-4 text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-4 py-4">
                                       <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-slate-300">{ev.apiType}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                       <ResultBadge status={ev.status} />
                                    </td>
                                    <td className="px-4 py-4">
                                       <span className={ev.spoofFlag ? 'text-[#ff3366]' : 'text-[#00ff88]'}>{ev.spoofFlag ? 'FAIL' : 'PASS'}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                       {ev.apiType === 'Enterprise' ? (
                                          <span className={ev.identityMatchedFlag ? 'text-[#00ff88]' : 'text-slate-500'}>
                                             {ev.identityMatchedFlag ? 'MATCH' : 'N/A'}
                                          </span>
                                       ) : (
                                          <span className="text-slate-600">-</span>
                                       )}
                                    </td>
                                    <td className="px-4 py-4 font-mono text-slate-400">{ev.processingTimeMs}ms</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                   )}
                 </motion.section>
              </div>

              <div className="space-y-8">
                 {/* SECTION 6: Security Event Center */}
                 <motion.section variants={itemVariants} initial="hidden" animate="visible" className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-6">
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                     <ShieldAlert size={16} className="text-[#ff3366]" /> Security Event Center
                   </h3>

                   {!hasThreats ? (
                      <div className="w-full py-10 border border-dashed border-[#00ff88]/20 rounded-xl flex flex-col items-center justify-center text-center bg-[#00ff88]/5">
                        <CheckCircle2 size={32} className="text-[#00ff88] mb-3" />
                        <h4 className="text-sm font-bold text-white mb-1">Secure</h4>
                        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest max-w-[200px]">Security monitoring active. No threat events detected.</p>
                      </div>
                   ) : (
                      <div className="space-y-3">
                         <ThreatCard label="Deepfake Detection" count={telemetry.security_events.deepfake} color="#ff3366" />
                         <ThreatCard label="Replay Attack" count={telemetry.security_events.replay_attack} color="#ffb800" />
                         <ThreatCard label="Identity Mismatch" count={telemetry.security_events.identity_mismatch} color="#7c3aed" />
                         <ThreatCard label="Multiple Faces" count={telemetry.security_events.multiple_faces} color="#00d4ff" />
                         <ThreatCard label="Face Missing" count={telemetry.security_events.face_not_found} color="#64748b" />
                      </div>
                   )}
                 </motion.section>

                 {/* SECTION 7: Developer Infrastructure */}
                 <motion.section variants={itemVariants} initial="hidden" animate="visible" className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-6">
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                     <Terminal size={16} className="text-slate-400" /> Developer Infrastructure
                   </h3>
                   <div className="space-y-4">
                      <InfraRow icon={Key} label="API Keys" value="3 Active" status="ok" />
                      <InfraRow icon={Webhook} label="Webhook Status" value="Connected" status="ok" />
                      <InfraRow icon={Box} label="SDK Status" value="v3.0.4 (Latest)" status="info" />
                      <InfraRow icon={Code} label="API Version" value="v2 (Stable)" status="ok" />
                      <InfraRow icon={LinkIcon} label="Documentation Access" value="Public" status="info" />
                      <InfraRow icon={Activity} label="Rate Limits" value="0% Utilized" status="ok" />
                      <InfraRow icon={Lock} label="Authentication Status" value="Enforced" status="ok" />
                   </div>
                 </motion.section>
              </div>
           </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────

function KpiCard({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col justify-between shadow-xl">
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">{label}</div>
      <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
    </div>
  );
}

function ThreatCard({ label, count, color }: { label: string, count: number, color: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
       <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color }} />
          <span className="text-sm text-slate-300">{label}</span>
       </div>
       <span className="font-mono font-bold text-white">{count}</span>
    </div>
  );
}

function InfraRow({ icon: Icon, label, value, status }: { icon: any, label: string, value: string, status: 'ok' | 'info' }) {
  return (
    <div className="flex items-center justify-between">
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
             <Icon size={14} className="text-slate-400" />
          </div>
          <span className="text-sm text-slate-300">{label}</span>
       </div>
       <span className={`text-xs font-mono font-medium ${status === 'ok' ? 'text-[#00ff88]' : 'text-[#00d4ff]'}`}>{value}</span>
    </div>
  );
}

function ResultBadge({ status }: { status: string }) {
  if (status === 'VERIFIED' || status === 'IDENTITY MATCHED') {
    return <div className="flex items-center gap-1.5 text-[#00ff88] text-[11px] font-bold tracking-wider"><CheckCircle2 size={12}/> {status}</div>;
  }
  if (status === 'SPOOF ATTEMPT') {
    return <div className="flex items-center gap-1.5 text-[#ff3366] text-[11px] font-bold tracking-wider"><ShieldAlert size={12}/> {status}</div>;
  }
  return <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold tracking-wider"><AlertTriangle size={12}/> {status}</div>;
}
