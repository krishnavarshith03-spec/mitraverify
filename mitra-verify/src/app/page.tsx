'use client';

import { 
  Shield, Activity, Server, CheckCircle2, ShieldAlert, Fingerprint, 
  Eye, Key, Network, FileText, Cpu, Webhook, Box, Lock, Code, 
  Database, Terminal, Globe, ChevronRight, Zap, Layers, Users, Building, Scale
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
}

// ─── FRAMER VARIANTS ────────────────────────────────────────────────────────
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/analytics/overview');
      const data = await res.json();
      setTelemetry(data.data);
    } catch (err) {
      console.error('Failed to fetch telemetry data', err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10s for homepage
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const hasData = telemetry && telemetry.executive_overview.total_verifications > 0;

  return (
    <div className="min-h-screen bg-[#030712] font-sans selection:bg-[#00d4ff]/30 text-slate-300 overflow-x-hidden relative">
      <Navbar />

      {/* Global Animated Grid & Cyber Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#00d4ff]/5 blur-[250px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-0 left-[-10%] w-[50vw] h-[50vw] bg-[#0066ff]/5 blur-[250px] rounded-full mix-blend-screen" />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_30%,transparent_100%)]" />
      </div>

      <main className="relative z-10">
         
         {/* SECTION 1: Enterprise Hero */}
         <section className="pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto min-h-[85vh] flex flex-col justify-center border-b border-[rgba(0,255,255,0.05)]">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
               
               {/* LEFT SIDE: Typography & Actions */}
               <motion.div variants={itemVariants} className="flex flex-col items-start text-left z-10">
                  <div className="flex flex-wrap items-center gap-3 mb-8">
                     <span className="px-3 py-1 rounded bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] text-[10px] font-bold uppercase tracking-widest">Enterprise Edition</span>
                     <span className="px-3 py-1 rounded bg-white/[0.03] border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">World-Class Biometric Authentication</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
                    Secure Identity<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#0066ff] filter drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">Verification</span><br />
                    Infrastructure
                  </h1>
                  
                  <p className="text-base md:text-lg text-slate-400 font-light mb-10 max-w-xl leading-relaxed">
                    Deploy military-grade liveness detection, anti-spoofing, and continuous authentication with just a few lines of code. Built for mission-critical applications.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
                    <Link href="/demo/enterprise" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00d4ff] text-[#020610] hover:bg-white transition-all text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(0,212,255,0.25)] flex items-center justify-center gap-2 group">
                      Start Building Free <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/demo/enterprise" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[rgba(10,20,40,0.6)] border border-[rgba(0,255,255,0.08)] hover:bg-[rgba(10,20,40,0.8)] hover:border-[#00d4ff]/30 transition-all text-sm font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 backdrop-blur-md">
                      <Activity size={16} className="text-[#00d4ff]" /> Try Live Demo
                    </Link>
                  </div>

                  {/* Metrics Row */}
                  <div className="flex flex-wrap items-center gap-6 md:gap-10 pt-8 border-t border-white/5 w-full">
                     <div className="flex flex-col gap-1">
                        <span className="text-white font-bold text-lg">478</span>
                        <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Facial Landmarks</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-white font-bold text-lg">&lt;1s</span>
                        <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Verification</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-white font-bold text-lg">3</span>
                        <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Verification APIs</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-white font-bold text-lg flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" /> 24/7</span>
                        <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Monitoring</span>
                     </div>
                  </div>
               </motion.div>

               {/* RIGHT SIDE: 3D Biometric Sphere */}
               <motion.div variants={itemVariants} className="relative w-full aspect-square max-w-[500px] mx-auto lg:ml-auto flex items-center justify-center mt-8 lg:mt-0">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.08)_0%,transparent_60%)] mix-blend-screen" />
                  
                  {/* Holographic Sphere */}
                  <div className="relative w-full h-full rounded-full flex items-center justify-center perspective-[1000px]">
                     {/* Outer Rings */}
                     <div className="absolute w-[90%] h-[90%] rounded-full border border-dashed border-[#00d4ff]/20 animate-[spin_20s_linear_infinite]" />
                     <div className="absolute w-[80%] h-[80%] rounded-full border border-dotted border-[#00ff88]/20 animate-[spin_15s_linear_infinite_reverse]" />
                     
                     {/* Core Sphere (Wireframe representation) */}
                     <motion.div 
                        animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="relative w-[60%] h-[60%] rounded-full border-2 border-[#00d4ff]/30 shadow-[inset_0_0_50px_rgba(0,212,255,0.2)]"
                        style={{ transformStyle: 'preserve-3d' }}
                     >
                        {/* 3D Wireframe Equators */}
                        <div className="absolute inset-0 rounded-full border border-[#00d4ff]/20" style={{transform: 'rotateX(45deg)'}} />
                        <div className="absolute inset-0 rounded-full border border-[#00d4ff]/20" style={{transform: 'rotateX(-45deg)'}} />
                        <div className="absolute inset-0 rounded-full border border-[#00d4ff]/20" style={{transform: 'rotateY(45deg)'}} />
                        <div className="absolute inset-0 rounded-full border border-[#00d4ff]/20" style={{transform: 'rotateY(-45deg)'}} />
                        
                        {/* Animated Landmark Dots */}
                        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-[#00ff88] rounded-full shadow-[0_0_10px_#00ff88] animate-pulse" />
                        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-[#00d4ff] rounded-full shadow-[0_0_10px_#00d4ff] animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-[#00ff88] rounded-full shadow-[0_0_10px_#00ff88] animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-[#00d4ff] rounded-full shadow-[0_0_10px_#00d4ff] animate-pulse" style={{ animationDelay: '1.5s' }} />
                     </motion.div>

                     {/* Floating Status Card */}
                     <motion.div 
                       animate={{ y: [0, -10, 0] }} 
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute top-1/4 -right-2 md:-right-8 bg-[rgba(5,10,20,0.8)] backdrop-blur-md border border-[rgba(0,255,255,0.15)] rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20"
                     >
                        <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                           <Shield size={14} className="text-[#00d4ff]" />
                           <span className="text-xs font-bold text-white">Verification Engine</span>
                        </div>
                        <div className="space-y-2 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                           <div className="flex items-center justify-between gap-6">
                              <span>Liveness:</span>
                              <span className="text-[#00ff88] font-bold">PASS</span>
                           </div>
                           <div className="flex items-center justify-between gap-6">
                              <span>Landmarks:</span>
                              <span className="text-white">478</span>
                           </div>
                           <div className="flex items-center justify-between gap-6">
                              <span>Confidence:</span>
                              <span className="text-[#00d4ff] animate-pulse">Pending...</span>
                           </div>
                        </div>
                     </motion.div>

                     {/* Bottom Floating Badge */}
                     <motion.div 
                       animate={{ y: [0, 10, 0] }} 
                       transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                       className="absolute bottom-1/4 -left-2 md:-left-6 bg-[rgba(5,10,20,0.8)] backdrop-blur-md border border-[rgba(0,255,136,0.15)] rounded-full px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 flex items-center gap-2"
                     >
                        <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_#00ff88]" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Liveness Check</span>
                     </motion.div>
                  </div>
               </motion.div>

            </motion.div>
         </section>

         {/* SECTION 2 & 8: Live Verification Center & AI Engine Cluster */}
         <section className="px-6 md:px-12 py-20 max-w-[1400px] mx-auto border-t border-[rgba(0,255,255,0.05)]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               
               {/* Centerpiece: Biometric Core */}
               <motion.div variants={itemVariants} className="lg:col-span-8 relative rounded-2xl bg-[rgba(5,10,25,0.8)] border border-[rgba(0,255,255,0.1)] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)] aspect-[16/9] md:aspect-[21/9] flex flex-col items-center justify-center group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen" />
                 
                 {/* Animated Rings & Core */}
                 <div className="absolute w-64 h-64 border border-[#00d4ff]/20 rounded-full animate-[spin_10s_linear_infinite]" />
                 <div className="absolute w-96 h-96 border border-[#00d4ff]/10 rounded-full animate-[spin_15s_linear_infinite_reverse] border-dashed" />
                 <div className="absolute w-[500px] h-[500px] border border-[#00ff88]/5 rounded-full animate-[spin_20s_linear_infinite]" />
                 <div className="absolute w-2 h-2 bg-[#00d4ff] rounded-full shadow-[0_0_20px_#00d4ff] animate-pulse" />
                 
                 {/* Scanning Laser */}
                 <div className="absolute inset-x-0 h-[1px] bg-[#00d4ff]/50 shadow-[0_0_30px_#00d4ff] animate-[scan_3s_ease-in-out_infinite]" style={{ transformOrigin: 'center' }} />
                 
                 <div className="relative z-10 flex flex-col items-center text-center mt-12 bg-gradient-to-t from-[#030712] p-8 rounded-xl backdrop-blur-sm border border-white/5">
                    <Shield size={32} className="text-[#00d4ff] mb-3 opacity-80" />
                    <h3 className="text-xl font-bold text-white mb-1 tracking-tight">Mission Control: Biometric Core</h3>
                    <p className="text-slate-400 text-xs font-light max-w-sm mb-6">Global edge network active. Ready to process extreme-volume identity verification requests with sub-50ms latency.</p>
                    <div className="flex gap-3">
                       <Link href="/demo/enterprise" className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00d4ff]/50 transition-all text-xs font-bold text-white flex items-center gap-2">
                         Initialize Scanner <Zap size={14} />
                       </Link>
                    </div>
                 </div>
               </motion.div>

               {/* Right Side: Developer Infrastructure & Trust Center */}
               <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-6 flex-1">
                     <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Terminal size={16} className="text-slate-400" /> Developer Infrastructure
                     </h3>
                     <div className="space-y-4">
                        <InfraRow icon={Key} label="API Endpoints" status="Operational" />
                        <InfraRow icon={Webhook} label="Webhook Delivery" status="Operational" />
                        <InfraRow icon={Box} label="SDK Distribution" status="v3.0.4 Active" />
                        <InfraRow icon={Code} label="Tensor Engines" status="Optimized" />
                        <InfraRow icon={Lock} label="Auth Gateway" status="Enforced" />
                     </div>
                  </div>
                  
                  <div className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-6 relative overflow-hidden">
                     <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#00ff88]/10 blur-[30px] rounded-full" />
                     <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Globe size={16} className="text-[#00ff88]" /> Global Trust Center
                     </h3>
                     <p className="text-xs text-slate-400 mb-4 font-light">Certified compliant for enterprise and government deployments.</p>
                     <div className="flex flex-col gap-2 text-[10px] font-mono text-slate-300">
                        <span className="flex items-center justify-between"><span className="flex items-center gap-2"><Shield size={12}/> SOC2 TYPE II</span> <CheckCircle2 size={12} className="text-[#00ff88]" /></span>
                        <span className="flex items-center justify-between"><span className="flex items-center gap-2"><Lock size={12}/> GDPR COMPLIANT</span> <CheckCircle2 size={12} className="text-[#00ff88]" /></span>
                        <span className="flex items-center justify-between"><span className="flex items-center gap-2"><Database size={12}/> AES-256 ENCRYPTION</span> <CheckCircle2 size={12} className="text-[#00ff88]" /></span>
                     </div>
                  </div>
               </motion.div>
               
            </motion.div>
         </section>

         {/* SECTION 4: Live Platform Status Center */}
         <section className="px-6 md:px-12 py-10 max-w-[1400px] mx-auto border-t border-[rgba(0,255,255,0.05)]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}>
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                     <Database className="text-[#00d4ff]" /> Platform Status Center
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#00ff88] uppercase tracking-widest bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" /> Live Telemetry
                  </div>
               </div>

               {!hasData ? (
                  <div className="w-full py-16 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center bg-white/[0.01]">
                     <Activity size={32} className="text-slate-600 mb-4" />
                     <h3 className="text-lg font-bold text-white mb-2">System Operational</h3>
                     <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Waiting for verification telemetry...</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                     <TelemetryCard label="Total Verifications" value={telemetry.executive_overview.total_verifications.toLocaleString()} />
                     <TelemetryCard label="Avg Latency" value={`${telemetry.executive_overview.avg_processing_time_ms}ms`} color="text-[#00d4ff]" />
                     <TelemetryCard label="Verified Sessions" value={telemetry.executive_overview.successful_verifications.toLocaleString()} color="text-[#00ff88]" />
                     <TelemetryCard label="Blocked Spoofs" value={telemetry.executive_overview.spoof_attempts_blocked.toLocaleString()} color="text-[#ffb800]" />
                     <TelemetryCard label="Failed Sessions" value={telemetry.executive_overview.failed_verifications.toLocaleString()} color="text-[#ff3366]" />
                     <TelemetryCard label="Identity Matches" value={telemetry.executive_overview.identity_matches.toLocaleString()} color="text-[#7c3aed]" />
                  </div>
               )}
            </motion.div>
         </section>

         {/* SECTION 3: Enterprise Verification Pipeline (Architecture) */}
         <section className="px-6 md:px-12 py-20 max-w-[1400px] mx-auto border-t border-[rgba(0,255,255,0.05)] overflow-hidden">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-8 relative">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.05)_0%,transparent_100%)] pointer-events-none" />
               <div className="text-center mb-12 relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-3">Enterprise Verification Pipeline</h2>
                  <p className="text-slate-400 text-sm font-light">Sub-second biometric analysis routed through 6 distinct AI tensors.</p>
               </div>

               <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 w-full px-4 overflow-x-auto pb-4 hide-scrollbar">
                  {/* SVG Animated Flow Line */}
                  <svg className="absolute top-1/2 left-16 right-16 h-4 -translate-y-1/2 hidden lg:block z-0 overflow-visible" preserveAspectRatio="none">
                     <path d="M0,8 L2000,8" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                     {/* Multiple glowing packets */}
                     <circle r="3" fill="#00d4ff" className="animate-[slide_4s_linear_infinite] drop-shadow-[0_0_10px_#00d4ff]" />
                     <circle r="3" fill="#00ff88" className="animate-[slide_4s_linear_infinite_1.5s] drop-shadow-[0_0_10px_#00ff88]" />
                     <circle r="3" fill="#7c3aed" className="animate-[slide_4s_linear_infinite_3s] drop-shadow-[0_0_10px_#7c3aed]" />
                  </svg>

                  {[
                    { name: 'Client Payload', icon: Code, type: 'Ingress' },
                    { name: 'Face Mesh', icon: Eye, type: 'MediaPipe' },
                    { name: 'Liveness', icon: Activity, type: 'Heuristic' },
                    { name: 'Anti-Spoof', icon: ShieldAlert, type: 'Policy' },
                    { name: 'Identity', icon: Fingerprint, type: 'Matching' },
                    { name: 'Auth Decision', icon: Server, type: 'Gateway' },
                  ].map((node, i) => (
                    <motion.div variants={itemVariants} key={i} className="flex flex-col items-center relative z-10 shrink-0 px-4 group">
                       <div className="w-16 h-16 rounded-2xl bg-[#050a17] border border-[#00d4ff]/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,212,255,0.05)] group-hover:border-[#00d4ff]/80 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] transition-all relative">
                          <node.icon size={24} className="text-[#00d4ff] group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 rounded-2xl border border-[#00d4ff]/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: `${i * 0.5}s`}} />
                       </div>
                       <div className="text-sm font-bold text-white whitespace-nowrap mb-1">{node.name}</div>
                       <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{node.type}</div>
                    </motion.div>
                  ))}
               </div>
            </motion.div>
         </section>

         {/* SECTION 5 & 6: Advanced API Platform Cards & Integrations */}
         <section className="px-6 md:px-12 py-20 max-w-[1400px] mx-auto border-t border-[rgba(0,255,255,0.05)]">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">Enterprise Integration Platform</h2>
               <p className="text-slate-400 text-base font-light max-w-2xl mx-auto">Drop-in biometric security for any stack. Integrates seamlessly with existing identity providers and custom workflows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(0,212,255,0.3)] transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-[#00d4ff]/50 transition-colors">
                     <Layers className="text-[#00d4ff]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Liveness API</h3>
                  <p className="text-slate-400 text-sm font-light mb-6 leading-relaxed">
                     Prevent presentation attacks (printed photos, screen replays, 3D masks) with our deep-learning liveness engine. Returns a boolean spoof flag and confidence score in &lt;50ms.
                  </p>
                  <div className="bg-[#020408] rounded-xl p-4 border border-white/5 font-mono text-xs text-[#00ff88]">
                     POST /api/verify/liveness
                  </div>
               </motion.div>

               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(0,212,255,0.3)] transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-[#7c3aed]/50 transition-colors">
                     <Fingerprint className="text-[#7c3aed]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Enterprise Identity API</h3>
                  <p className="text-slate-400 text-sm font-light mb-6 leading-relaxed">
                     Continuous authentication and 1:1 face matching against enrolled databases. Instantly verifies if the person at the keyboard is the authorized account holder.
                  </p>
                  <div className="bg-[#020408] rounded-xl p-4 border border-white/5 font-mono text-xs text-[#7c3aed]">
                     POST /api/verify/enterprise
                  </div>
               </motion.div>
            </div>

            {/* Seamless Integrations Strip */}
            <div className="border border-white/5 rounded-2xl p-8 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="text-center md:text-left">
                  <h4 className="text-white font-bold mb-2">Seamless IAM Integrations</h4>
                  <p className="text-slate-500 text-xs font-light">Plug into your existing Identity and Access Management flow.</p>
               </div>
               <div className="flex flex-wrap justify-center gap-6 text-sm font-mono text-slate-400 font-bold uppercase tracking-widest">
                  <span className="px-4 py-2 bg-white/5 rounded hover:text-white transition-colors cursor-pointer">Okta</span>
                  <span className="px-4 py-2 bg-white/5 rounded hover:text-white transition-colors cursor-pointer">Auth0</span>
                  <span className="px-4 py-2 bg-white/5 rounded hover:text-white transition-colors cursor-pointer">Microsoft Entra</span>
                  <span className="px-4 py-2 bg-white/5 rounded hover:text-white transition-colors cursor-pointer">Ping Identity</span>
               </div>
            </div>
         </section>

         {/* SECTION 7: Verification Use Cases */}
         <section className="px-6 md:px-12 py-20 max-w-[1400px] mx-auto border-t border-[rgba(0,255,255,0.05)]">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">Built for Critical Infrastructure</h2>
               <p className="text-slate-400 text-base font-light max-w-2xl mx-auto">MITRA VERIFY is designed to secure high-stakes environments where identity fraud is unacceptable.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <UseCaseCard 
                  icon={Building} 
                  title="Financial Services KYC" 
                  description="Automate Know Your Customer onboarding with unbreakable face liveness detection to prevent deepfake account creation." 
               />
               <UseCaseCard 
                  icon={Scale} 
                  title="Government Identity" 
                  description="Secure citizen portals and benefit distribution systems with enterprise-grade 1:1 facial matching and spoof protection." 
               />
               <UseCaseCard 
                  icon={Users} 
                  title="Remote Examination" 
                  description="Ensure academic integrity with continuous background authentication to verify the enrolled student is taking the test." 
               />
            </div>
         </section>

         {/* SECTION 9: Enterprise Footer */}
         <footer className="border-t border-[rgba(0,255,255,0.08)] bg-[#010308] pt-20 pb-10 px-6 md:px-12">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
               <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                     <Shield className="text-[#00d4ff]" size={24} />
                     <span className="text-xl font-bold text-white tracking-tight">MITRA VERIFY</span>
                  </div>
                  <p className="text-slate-500 text-xs font-light leading-relaxed mb-6">
                     Enterprise biometric security and identity infrastructure. Zero-trust architecture for a world of deepfakes.
                  </p>
                  <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                     <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">All Systems Operational</span>
                  </div>
               </div>

               <div>
                  <h4 className="text-white font-bold text-sm mb-4">Platform</h4>
                  <ul className="space-y-2 text-sm text-slate-400 font-light">
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">Liveness API</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">Identity API</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">Anti-Spoofing SDK</Link></li>
                     <li><Link href="/dashboard" className="hover:text-[#00d4ff] transition-colors">Security Console</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold text-sm mb-4">Developers</h4>
                  <ul className="space-y-2 text-sm text-slate-400 font-light">
                     <li><Link href="/developer" className="hover:text-[#00d4ff] transition-colors">Documentation</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">API Reference</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">Status Page</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">GitHub</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold text-sm mb-4">Trust Center</h4>
                  <ul className="space-y-2 text-sm text-slate-400 font-light">
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">Security & Compliance</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">Privacy Policy</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">SOC2 Report</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">Terms of Service</Link></li>
                  </ul>
               </div>
            </div>

            <div className="max-w-[1400px] mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
               <p>© 2026 MITRA SECURITY INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
               <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><Shield size={12} /> SOC2 TYPE II</span>
                  <span className="flex items-center gap-1.5"><Globe size={12} /> GDPR</span>
                  <span className="flex items-center gap-1.5"><Lock size={12} /> AES-256</span>
               </div>
            </div>
         </footer>

      </main>
    </div>
  );
}

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────

function TelemetryCard({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
  return (
    <motion.div variants={itemVariants} className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-[rgba(0,212,255,0.3)] transition-colors">
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">{label}</div>
      <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
    </motion.div>
  );
}

function InfraRow({ icon: Icon, label, status }: { icon: any, label: string, status: string }) {
  return (
    <div className="flex items-center justify-between">
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-white/5 flex items-center justify-center bg-white/[0.02]">
             <Icon size={14} className="text-slate-400" />
          </div>
          <span className="text-xs text-slate-300 font-medium">{label}</span>
       </div>
       <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded border border-[#00d4ff]/20">
          <CheckCircle2 size={10} /> {status}
       </span>
    </div>
  );
}

function UseCaseCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
       <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center mb-6">
          <Icon className="text-[#00d4ff]" />
       </div>
       <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
       <p className="text-slate-400 text-sm font-light leading-relaxed">{description}</p>
    </motion.div>
  );
}
