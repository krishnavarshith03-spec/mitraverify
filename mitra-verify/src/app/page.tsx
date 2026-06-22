'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, Suspense, lazy, Component } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Terminal, Eye, Star, Copy, Check, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import type { ScanPhase } from '@/components/3d/HeroScene';

// 3D Scene lazy load
const HeroScene = lazy(() => import('@/components/3d/HeroScene'));
class HeroSceneErrorBoundary extends Component<{ children: React.ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(error: Error) { console.warn('[HeroScene] 3D render failed silently:', error.message); }
  render() {
    if (this.state.crashed) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.04), transparent)',
        }} />
      );
    }
    return this.props.children;
  }
}

// Data
const PHASES = [
  { id: 'searching', label: 'Searching for Face', color: '#f59e0b' },
  { id: 'detected', label: 'Face Detected', color: '#00d4ff' },
  { id: 'landmarks', label: 'Generating 478 Landmarks', color: '#00d4ff' },
  { id: 'liveness', label: 'Liveness Verification', color: '#10b981' },
  { id: 'identity', label: 'Identity Matching', color: '#3b82f6' },
  { id: 'granted', label: 'Access Granted', color: '#10b981' },
];

function useCounter(end: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const update = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) animationFrame = requestAnimationFrame(update);
    };
    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
}

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number, suffix?: string, prefix?: string }) {
  const count = useCounter(value, 2.5);
  return <span>{prefix}{count}{suffix}</span>;
}

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setCurrentPhase(p => (p + 1) % PHASES.length), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`import { verifyIdentity } from '@mitra-verify/sdk';\n\nconst result = await verifyIdentity(image, { strict: true });`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#020817] overflow-hidden selection:bg-[#00d4ff]/30 selection:text-white">
      <Navbar />

      {/* ── 1. HERO SECTION ───────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={mounted ? { opacity: heroOpacity, y: heroY } : {}}
        className="relative pt-32 pb-24 lg:pt-40 lg:pb-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,212,255,0.03),transparent)] z-0 pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className="lg:col-span-7 flex flex-col gap-8 z-20">
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.05]"
              >
                Identity Verification Built For Trust
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg lg:text-xl text-slate-400 font-light leading-relaxed max-w-xl"
              >
                Advanced AI-powered liveness detection, anti-spoof intelligence, and real-time biometric authentication.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} 
                className="flex flex-col sm:flex-row gap-4 mt-2"
              >
                <Link href="/docs" className="inline-flex items-center justify-center px-6 py-3 font-medium text-[#020817] transition-all bg-white rounded-lg hover:bg-slate-200">
                  View Documentation
                </Link>
                <Link href="/demo/basic" className="inline-flex items-center justify-center px-6 py-3 font-medium text-white transition-all bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/[0.1]">
                  Request Demo
                </Link>
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative w-full h-[400px] lg:h-[500px] flex items-center justify-center scale-90 lg:scale-100">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute w-[400px] h-[400px] bg-[#00d4ff]/10 rounded-full blur-[100px] mix-blend-screen" />
              </motion.div>
              <div className="relative w-full h-full z-10 pointer-events-auto">
                {mounted && (
                  <HeroSceneErrorBoundary>
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" /></div>}>
                      <HeroScene phase={PHASES[currentPhase].id as ScanPhase} />
                    </Suspense>
                  </HeroSceneErrorBoundary>
                )}
              </div>
            </div>

          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl"
          >
            {[
              { value: '478+', label: 'Facial Landmarks' },
              { value: '<1s', label: 'Verification' },
              { value: '99%', label: 'Anti-Spoof Engine' },
              { value: '24/7', label: 'Continuous Verification' },
              { value: '3', label: 'Security Levels' }
            ].map((metric) => (
              <div key={metric.label} className="flex flex-col md:items-start text-center md:text-left">
                <div className="text-3xl font-light text-white mb-1 tracking-tight">{metric.value}</div>
                <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">{metric.label}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </motion.section>

      {/* ── 2. INDUSTRIES STRIP ───────────────────────────────────── */}
      <section className="py-6 border-y border-white/5 bg-white/[0.01] relative z-10 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 shrink-0">
            Engineered For Zero-Trust Environments
          </span>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-[#020817] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-[#020817] to-transparent z-10 pointer-events-none" />
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
              className="flex items-center gap-12 whitespace-nowrap"
            >
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-12">
                  {['FinTech', 'Healthcare', 'Government', 'Enterprise', 'Workforce Access', 'Customer Verification', 'Education', 'Banking'].map((sector) => (
                    <span key={sector} className="text-sm font-medium text-slate-400">{sector}</span>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. SECURITY ARCHITECTURE ───────────────────────────────────── */}
      <section className="py-24 lg:py-32 relative z-10 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
              Security Architecture
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl font-light">
              Every verification request passes through a multi-stage biometric security pipeline.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-50px" }} 
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="relative p-8 md:px-12 md:pt-10 md:pb-24 rounded-xl bg-white/[0.01] border border-white/5 backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-center justify-between relative z-10 w-full">
                {[
                  { id: '1', title: 'Face Detection' },
                  { id: '2', title: 'Landmark Extraction' },
                  { id: '3', title: 'Liveness Check' },
                  { id: '4', title: 'Anti-Spoof Analysis' },
                  { id: '5', title: 'Identity Match' },
                  { id: '6', title: 'Access Granted' }
                ].map((step, index, arr) => (
                  <div key={step.id} className="flex flex-col md:flex-row items-center flex-1 w-full md:w-auto">
                    
                    <div className="flex flex-col items-center group relative shrink-0">
                      <div className="w-8 h-8 rounded-full border border-white/10 bg-[#020817] flex items-center justify-center text-[10px] font-mono text-slate-400 group-hover:border-[#00d4ff]/50 group-hover:text-[#00d4ff] transition-colors relative z-20">
                        {step.id}
                        <div className="absolute inset-0 rounded-full bg-[#00d4ff]/0 group-hover:bg-[#00d4ff]/10 group-hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all duration-500" />
                      </div>
                      <span className="md:absolute md:top-12 mt-3 md:mt-0 text-[10px] uppercase tracking-wide text-slate-400 text-center group-hover:text-slate-200 transition-colors w-24 md:left-1/2 md:-translate-x-1/2">
                        {step.title}
                      </span>
                    </div>

                    {index < arr.length - 1 && (
                      <div className="flex-1 w-px h-8 md:w-full md:h-px bg-white/5 mx-auto my-3 md:my-0 md:mx-4 relative overflow-hidden">
                        <motion.div
                          animate={{ left: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: index * 0.3 }}
                          className="absolute hidden md:block top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent shadow-[0_0_8px_rgba(0,212,255,0.2)]"
                        />
                        <motion.div
                          animate={{ top: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: index * 0.3 }}
                          className="absolute md:hidden left-0 h-1/2 w-full bg-gradient-to-b from-transparent via-[#00d4ff]/30 to-transparent shadow-[0_0_8px_rgba(0,212,255,0.2)]"
                        />
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 4. DEVELOPER INTEGRATION ───────────────────────────────────── */}
      <section className="py-24 lg:py-32 relative z-10 border-t border-white/5 bg-[#020817]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-6">Developer Integration</h2>
              <p className="text-lg text-slate-400 font-light mb-8 leading-relaxed">
                Embed highly reliable biometric verification directly into your application with our enterprise SDK. Zero infrastructure required.
              </p>
              <ul className="space-y-4 mb-8">
                {['Typed interfaces', 'Sub-second latency', 'Secure enclaves'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300 text-sm font-light">
                    <CheckCircle size={14} className="text-[#00d4ff]" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/docs" className="text-sm font-medium text-white hover:text-[#00d4ff] transition-colors flex items-center gap-1.5">
                Explore the SDK <ArrowRight size={14} />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="rounded-xl border border-white/10 bg-black overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,255,0.05),transparent_50%)] pointer-events-none" />
              <div className="flex justify-between items-center bg-white/[0.02] border-b border-white/10 px-4 py-3 relative z-10">
                <span className="text-[12px] font-mono text-slate-400">auth.ts</span>
                <button onClick={handleCopy} className="text-slate-500 hover:text-white transition-colors" title="Copy code">
                  {copied ? <Check size={14} color="#00ff88" /> : <Copy size={14} />}
                </button>
              </div>
              
              <div className="p-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <pre className="text-[12px] font-mono leading-relaxed text-[#a8b2d1]">
                    <span className="text-[#c678dd]">import</span> {'{ verifyIdentity }'} <span className="text-[#c678dd]">from</span> <span className="text-[#98c379]">'@mitra-verify/sdk'</span>;<br/><br/>
                    <span className="text-[#c678dd]">const</span> result = <span className="text-[#c678dd]">await</span> <span className="text-[#61afef]">verifyIdentity</span>(image);
                  </pre>
                </div>
                <div className="md:border-l md:border-white/5 md:pl-6">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Response</div>
                  <pre className="text-[12px] font-mono leading-relaxed text-[#98c379]">
                    {`{
  "status": "passed",
  "confidence": 0.99
}`}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. ENTERPRISE CTA ──────────────────────────────────────── */}
      <section className="py-24 relative z-10 bg-[#020817]">
        <div className="max-w-[1000px] mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/10 p-12 md:p-16 rounded-2xl text-center relative overflow-hidden shadow-2xl">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-semibold text-white mb-4 tracking-tight">Deploy Trust At Scale</h2>
              <p className="text-lg text-slate-400 font-light mb-10 max-w-xl mx-auto">Enterprise-grade biometric verification for mission-critical applications.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/docs" className="inline-flex items-center justify-center px-6 py-3 font-medium text-[#020817] transition-all bg-white rounded-lg hover:bg-slate-200">
                  View Documentation
                </Link>
                <Link href="/demo/enterprise" className="inline-flex items-center justify-center px-6 py-3 font-medium text-white transition-all bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/[0.1]">
                  Request Demo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 6. FOOTER ──────────────────────────────────────── */}
      <footer className="py-12 border-t border-white/5 bg-[#020817] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Shield className="text-white" size={24} />
            <span className="text-xl font-bold text-white tracking-tight">MITRA<span className="text-slate-400">VERIFY</span></span>
          </div>
          
          <div className="flex gap-8 text-sm font-light text-slate-400">
            <Link href="/product" className="hover:text-white transition-colors">Product</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/architecture" className="hover:text-white transition-colors">Architecture</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 mt-8 pt-8 border-t border-white/5 text-center md:text-left text-xs text-slate-600 font-light">
          © {new Date().getFullYear()} Mitra Verify. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
