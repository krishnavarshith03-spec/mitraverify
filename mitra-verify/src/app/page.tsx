'use client';

import { 
  Shield, Activity, Server, CheckCircle2, ShieldAlert, Fingerprint, 
  Eye, Key, Network, Code, Database, Globe, ChevronRight, Layers, Users, Building, Scale,
  Camera, Lock, HardDrive, Smartphone, FileText, HeartPulse
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Simulation State
  const [simStep, setSimStep] = useState(0);

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
    const interval = setInterval(fetchData, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cycle through simulation steps 0 to 5
    const simInterval = setInterval(() => {
       setSimStep(prev => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(simInterval);
  }, []);

  if (!mounted) return null;

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
         
         {/* SECTION 1: Restored Left/Right Split Hero */}
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
                    <Link href="/developer" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00d4ff] text-[#020610] hover:bg-white transition-all text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(0,212,255,0.25)] flex items-center justify-center gap-2 group">
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

         {/* SECTION 2: Real-Time Verification Simulation */}
         <section className="px-6 md:px-12 py-24 max-w-[1400px] mx-auto border-b border-[rgba(0,255,255,0.05)]">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">Real-Time Threat Analysis</h2>
               <p className="text-slate-400 text-base font-light max-w-2xl mx-auto">See how MITRA VERIFY actively processes raw camera feeds, isolating presentation attacks from genuine users with sub-millisecond precision.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
               {/* Panel A: Camera Feed Simulation */}
               <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#050a14] border border-[rgba(0,255,255,0.1)] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex flex-col">
                  <div className="bg-[#02040a] px-4 py-3 border-b border-[rgba(0,255,255,0.05)] flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff3366]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffb800]" />
                        <div className="w-3 h-3 rounded-full bg-[#00ff88]" />
                     </div>
                     <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Camera Interface</span>
                  </div>
                  
                  <div className="relative flex-1 min-h-[300px] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-opacity-20 flex items-center justify-center">
                     {/* Frame Outline */}
                     <div className="absolute inset-8 border border-[#00d4ff]/20 rounded-xl">
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00d4ff]" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00d4ff]" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00d4ff]" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00d4ff]" />
                     </div>

                     <div className="relative z-10 text-center flex flex-col items-center">
                        <Camera size={48} className="text-[#00d4ff]/50 mb-4 animate-pulse" />
                        <span className="text-[#00ff88] font-mono text-xs uppercase tracking-widest animate-[pulse_1s_infinite]">Rec: Active</span>
                     </div>

                     {/* Scanning laser effect */}
                     <div className="absolute top-8 bottom-8 left-8 right-8 overflow-hidden rounded-xl">
                        <motion.div 
                           animate={{ y: ['0%', '100%', '0%'] }} 
                           transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                           className="w-full h-[2px] bg-[#00d4ff] shadow-[0_0_20px_#00d4ff] opacity-50"
                        />
                     </div>
                  </div>
               </motion.div>

               {/* Panel B: Data Readout Readout */}
               <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                       <Activity size={16} className="text-[#00d4ff]" /> Live Diagnostics
                     </h3>
                     <span className="text-[10px] font-mono text-[#00ff88] border border-[#00ff88]/30 bg-[#00ff88]/10 px-2 py-1 rounded">PROCESSING</span>
                  </div>

                  <div className="space-y-6">
                     <SimRow label="Face Detection" stepLimit={1} simStep={simStep} value="Active" color="text-[#00d4ff]" />
                     <SimRow label="Liveness Score" stepLimit={2} simStep={simStep} value="99.4%" color="text-[#00ff88]" />
                     <SimRow label="Blink Detection" stepLimit={3} simStep={simStep} value="True" color="text-white" />
                     <SimRow label="Head Rotation (Yaw/Pitch/Roll)" stepLimit={4} simStep={simStep} value="0.12 / -0.05 / 0.01" color="text-slate-300" />
                     <SimRow label="Anti-Spoof Detection" stepLimit={5} simStep={simStep} value="Clear" color="text-[#00ff88]" />
                     <SimRow label="Identity Match" stepLimit={6} simStep={simStep} value="Verified" color="text-[#7c3aed]" />
                  </div>
               </motion.div>
            </div>
         </section>

         {/* SECTION 3: Real-Time Infrastructure Monitoring */}
         <section className="px-6 md:px-12 py-24 max-w-[1400px] mx-auto border-b border-[rgba(0,255,255,0.05)]">
            <div className="mb-12">
               <h2 className="text-3xl font-bold text-white mb-4">Infrastructure Status</h2>
               <p className="text-slate-400 text-sm font-light">Global edge network health and service availability.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <ServiceNode name="Face Detection Engine" uptime="99.99%" latency="12ms" />
               <ServiceNode name="MediaPipe Processing" uptime="99.98%" latency="8ms" />
               <ServiceNode name="Liveness Engine AI" uptime="100%" latency="24ms" />
               <ServiceNode name="Anti-Spoofing Policy" uptime="100%" latency="15ms" />
               <ServiceNode name="Identity Matching" uptime="99.99%" latency="45ms" />
               <ServiceNode name="API Gateway Network" uptime="100%" latency="5ms" />
            </div>
         </section>

         {/* SECTION 4: Animated Enterprise Verification Pipeline */}
         <section className="px-6 md:px-12 py-24 max-w-[1400px] mx-auto border-b border-[rgba(0,255,255,0.05)] overflow-hidden">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">Enterprise Architecture Pipeline</h2>
               <p className="text-slate-400 text-base font-light max-w-2xl mx-auto">A seamless flow of cryptographic data packets routed through 6 localized edge nodes.</p>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="relative bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-8 lg:p-16">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.05)_0%,transparent_100%)] pointer-events-none" />
               
               <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 w-full relative z-10">
                  {/* SVG Animated Flow Line */}
                  <svg className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 hidden lg:block z-0 overflow-visible" preserveAspectRatio="none">
                     <path d="M50,8 L2000,8" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="6 6" className="animate-[slide_1s_linear_infinite]" />
                     {/* Packets */}
                     <circle r="4" fill="#00d4ff" className="animate-[slide_3s_linear_infinite] drop-shadow-[0_0_10px_#00d4ff]" />
                     <circle r="4" fill="#00ff88" className="animate-[slide_3s_linear_infinite_1s] drop-shadow-[0_0_10px_#00ff88]" />
                     <circle r="4" fill="#7c3aed" className="animate-[slide_3s_linear_infinite_2s] drop-shadow-[0_0_10px_#7c3aed]" />
                  </svg>

                  {[
                    { name: 'Client Camera', icon: Camera, type: 'Ingress' },
                    { name: 'Face Mesh', icon: Eye, type: 'Tensor' },
                    { name: 'Liveness', icon: HeartPulse, type: 'Heuristic' },
                    { name: 'Anti-Spoof', icon: ShieldAlert, type: 'Policy' },
                    { name: 'Identity Match', icon: Fingerprint, type: 'Database' },
                    { name: 'Decision Engine', icon: Server, type: 'Response' },
                  ].map((node, i) => (
                    <motion.div variants={itemVariants} key={i} className="flex flex-col items-center relative z-10 shrink-0 bg-[#030712] p-2 rounded-xl group">
                       <div className="w-16 h-16 rounded-xl bg-[rgba(5,10,25,0.8)] border border-[#00d4ff]/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,212,255,0.05)] group-hover:border-[#00d4ff]/80 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] transition-all">
                          <node.icon size={24} className="text-[#00d4ff] group-hover:scale-110 transition-transform" />
                       </div>
                       <div className="text-sm font-bold text-white whitespace-nowrap mb-1">{node.name}</div>
                       <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{node.type}</div>
                    </motion.div>
                  ))}
               </div>
            </motion.div>
         </section>

         {/* SECTION 5: Advanced API Platform Cards */}
         <section className="px-6 md:px-12 py-24 max-w-[1400px] mx-auto border-b border-[rgba(0,255,255,0.05)]">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">Integration Platform</h2>
               <p className="text-slate-400 text-base font-light max-w-2xl mx-auto">Drop-in biometric security for any stack. Integrates seamlessly with your existing REST architecture.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* API Card 1 */}
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(0,212,255,0.3)] transition-colors group flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#00d4ff]/50 transition-colors">
                        <Layers className="text-[#00d4ff]" />
                     </div>
                     <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
                        <span className="text-[#00ff88]">Acc: 99.8%</span>
                        <span className="text-[#00d4ff]">Lat: &lt;50ms</span>
                     </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">Liveness API</h3>
                  <p className="text-slate-400 text-sm font-light mb-8 leading-relaxed flex-1">
                     Prevent presentation attacks (printed photos, screen replays, 3D masks) with our deep-learning liveness engine. Returns a boolean spoof flag and confidence score instantly.
                  </p>
                  
                  <div className="bg-[#020408] rounded-xl overflow-hidden border border-white/5">
                     <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] text-[10px] font-mono text-slate-500 flex items-center gap-2">
                        <span className="text-[#00ff88]">POST</span> https://api.mitra.com/v1/verify/liveness
                     </div>
                     <div className="p-4 text-[11px] font-mono text-[#00d4ff]">
                        {`{
  "status": "success",
  "liveness": true,
  "confidence_score": 0.994,
  "spoof_detected": false
}`}
                     </div>
                  </div>
               </motion.div>

               {/* API Card 2 */}
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[rgba(10,20,40,0.6)] backdrop-blur-md border border-[rgba(0,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(0,212,255,0.3)] transition-colors group flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#7c3aed]/50 transition-colors">
                        <Fingerprint className="text-[#7c3aed]" />
                     </div>
                     <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
                        <span className="text-[#00ff88]">Acc: 99.9%</span>
                        <span className="text-[#00d4ff]">Lat: &lt;80ms</span>
                     </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">Enterprise Identity API</h3>
                  <p className="text-slate-400 text-sm font-light mb-8 leading-relaxed flex-1">
                     Continuous authentication and 1:1 face matching against enrolled databases. Instantly verifies if the person at the keyboard is the authorized account holder.
                  </p>

                  <div className="bg-[#020408] rounded-xl overflow-hidden border border-white/5">
                     <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] text-[10px] font-mono text-slate-500 flex items-center gap-2">
                        <span className="text-[#00ff88]">POST</span> https://api.mitra.com/v1/verify/identity
                     </div>
                     <div className="p-4 text-[11px] font-mono text-[#7c3aed]">
                        {`{
  "status": "success",
  "identity_match": true,
  "user_id": "usr_998xjk",
  "match_confidence": 0.985
}`}
                     </div>
                  </div>
               </motion.div>
            </div>
         </section>

         {/* SECTION 6: Critical Infrastructure Use Cases */}
         <section className="px-6 md:px-12 py-24 max-w-[1400px] mx-auto border-b border-[rgba(0,255,255,0.05)]">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">Built for Critical Infrastructure</h2>
               <p className="text-slate-400 text-base font-light max-w-2xl mx-auto">MITRA VERIFY is designed to secure high-stakes environments where identity fraud is unacceptable.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <UseCaseCard icon={Building} title="Banking & KYC" description="Automate Know Your Customer onboarding with unbreakable face liveness detection to prevent deepfake account creation." />
               <UseCaseCard icon={Scale} title="Government Identity" description="Secure citizen portals and benefit distribution systems with enterprise-grade 1:1 facial matching and spoof protection." />
               <UseCaseCard icon={HeartPulse} title="Healthcare Access" description="Ensure HIPAA compliance by verifying physician identity before granting access to sensitive patient records." />
               <UseCaseCard icon={Users} title="Remote Examinations" description="Ensure academic integrity with continuous background authentication to verify the enrolled student is taking the test." />
               <UseCaseCard icon={Lock} title="Workforce Auth" description="Deploy Zero Trust access for corporate VPNs and internal tooling with continuous identity verification." />
               <UseCaseCard icon={HardDrive} title="Secure Facilities" description="Integrate with physical hardware and access control systems for seamless, keyless entry." />
            </div>
         </section>

         {/* SECTION 7: Final Premium CTA */}
         <section className="px-6 md:px-12 py-32 max-w-[1400px] mx-auto text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00d4ff]/5 blur-[200px] rounded-full pointer-events-none" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to Secure Your Platform?</h2>
               <p className="text-xl text-slate-400 font-light mb-10 max-w-2xl mx-auto">Start Building With MITRA VERIFY today and deploy military-grade biometric infrastructure in minutes.</p>
               
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/developer" className="px-8 py-4 rounded-xl bg-[#00d4ff] text-[#020610] hover:bg-white transition-all text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(0,212,255,0.3)]">
                     Get API Key
                  </Link>
                  <Link href="/developer" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-bold text-white uppercase tracking-widest">
                     View Documentation
                  </Link>
               </div>
            </motion.div>
         </section>

         {/* SECTION 8: Enterprise Footer */}
         <footer className="border-t border-[rgba(0,255,255,0.08)] bg-[#010308] pt-20 pb-10 px-6 md:px-12 relative z-10">
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
                     <li><Link href="/demo/enterprise" className="hover:text-[#00d4ff] transition-colors">Liveness API</Link></li>
                     <li><Link href="/demo/enterprise" className="hover:text-[#00d4ff] transition-colors">Identity API</Link></li>
                     <li><Link href="/dashboard" className="hover:text-[#00d4ff] transition-colors">Security Console</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold text-sm mb-4">Developers</h4>
                  <ul className="space-y-2 text-sm text-slate-400 font-light">
                     <li><Link href="/developer" className="hover:text-[#00d4ff] transition-colors">Documentation</Link></li>
                     <li><Link href="/developer" className="hover:text-[#00d4ff] transition-colors">API Reference</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">GitHub</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold text-sm mb-4">Trust Center</h4>
                  <ul className="space-y-2 text-sm text-slate-400 font-light">
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">Security & Compliance</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">Privacy Policy</Link></li>
                     <li><Link href="#" className="hover:text-[#00d4ff] transition-colors">SOC2 Report</Link></li>
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

function SimRow({ label, stepLimit, simStep, value, color }: { label: string, stepLimit: number, simStep: number, value: string, color: string }) {
   const isActive = simStep >= stepLimit;
   return (
      <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
         <span className="text-xs text-slate-400 font-medium">{label}</span>
         <span className={`text-[11px] font-mono uppercase tracking-widest ${isActive ? color : 'text-slate-600'}`}>
            {isActive ? value : 'Waiting...'}
         </span>
      </div>
   );
}

function ServiceNode({ name, uptime, latency }: { name: string, uptime: string, latency: string }) {
   return (
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors flex flex-col">
         <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold text-white">{name}</span>
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_#00ff88]" />
         </div>
         <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
            <div className="flex flex-col gap-1">
               <span className="text-slate-500">Uptime</span>
               <span className="text-[#00ff88]">{uptime}</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
               <span className="text-slate-500">Latency</span>
               <span className="text-[#00d4ff]">{latency}</span>
            </div>
         </div>
      </motion.div>
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
