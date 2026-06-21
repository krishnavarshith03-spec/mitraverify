'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect, Suspense, lazy, Component } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap, Shield, Fingerprint, ArrowRight, CheckCircle, 
  Activity, Eye, Lock, Star, ChevronRight,
  Building, GraduationCap, CreditCard, Stethoscope, Landmark, UserPlus,
  ShieldCheck, Fingerprint as FingerprintIcon, Focus
} from 'lucide-react';
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
  { id: 'searching', label: 'Searching for Face', color: '#ffb800' },
  { id: 'detected', label: 'Face Detected', color: '#00d4ff' },
  { id: 'landmarks', label: 'Generating 478 Landmarks', color: '#00d4ff' },
  { id: 'liveness', label: 'Liveness Verification', color: '#7c3aed' },
  { id: 'identity', label: 'Identity Matching', color: '#0066ff' },
  { id: 'granted', label: 'Access Granted', color: '#00ff88' },
];

const API_PRODUCTS = [
  {
    id: 'basic',
    name: 'Fast Liveness API',
    icon: Zap,
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,102,255,0.05))',
    border: 'rgba(0,212,255,0.2)',
    target: '< 1 second',
    accuracy: '90%',
    endpoint: 'POST /api/v1/liveness/basic',
    checks: ['Blink Detection', 'Mouth Movement', 'Smile Detection', 'Head Rotation', 'Face Presence'],
    useCase: 'Quick user verification, web logins',
  },
  {
    id: 'advanced',
    name: 'Advanced Anti-Spoof',
    icon: Shield,
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(0,212,255,0.05))',
    border: 'rgba(124,58,237,0.2)',
    target: '2–4 seconds',
    accuracy: '97%',
    endpoint: 'POST /api/v1/liveness/advanced',
    checks: ['Challenge Response', 'Replay Attack Detection', 'Video Spoof Detection', 'Deepfake Risk', 'Lighting Analysis'],
    useCase: 'Banking, KYC, high-security apps',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Identity',
    icon: Fingerprint,
    color: '#00ff88',
    gradient: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,102,255,0.05))',
    border: 'rgba(0,255,136,0.2)',
    target: '3–6 seconds',
    accuracy: '99%',
    endpoint: 'POST /api/v1/identity/verify',
    checks: ['Face Recognition', 'Eye Tracking', 'Continuous Verification', 'Multiple Face Detection', 'Deepfake Detection'],
    useCase: 'Enterprise security, continuous auth',
  },
];

const CRITICAL_APPS = [
  { title: 'Online Exams', icon: GraduationCap, color: '#00d4ff', desc: 'Prevent impersonation and ensure academic integrity during remote testing.' },
  { title: 'Employee Login', icon: Building, color: '#00ff88', desc: 'Zero-trust biometric authentication for corporate VPNs and internal tools.' },
  { title: 'Fintech KYC', icon: CreditCard, color: '#7c3aed', desc: 'Instant identity verification for onboarding, transactions, and compliance.' },
  { title: 'Healthcare Access', icon: Stethoscope, color: '#ff3366', desc: 'Secure patient portals and medical staff authentication.' },
  { title: 'Government', icon: Landmark, color: '#f59e0b', desc: 'High-assurance identity verification for citizen services.' },
  { title: 'Customer Onboarding', icon: UserPlus, color: '#3b82f6', desc: 'Frictionless, secure sign-ups with automated liveness checks.' },
];

const ENTERPRISE_SECURITY = [
  { title: 'Face Liveness', icon: Activity, desc: 'Detects micro-expressions, blinks, and natural movements to ensure physical presence.' },
  { title: 'Anti-Spoof Detection', icon: ShieldCheck, desc: 'Identifies deepfakes, screen replays, masks, and printed photos with military precision.' },
  { title: 'Identity Matching', icon: FingerprintIcon, desc: 'Matches live faces against registered biometrics with 99.9% accuracy using 478 landmarks.' },
  { title: 'Behavioral Biometrics', icon: Eye, desc: 'Analyzes interaction patterns, head movements, and gaze to build robust trust profiles.' },
  { title: 'Continuous Authentication', icon: Focus, desc: 'Seamlessly verifies identity throughout the session without interrupting the user experience.' },
];

function PhaseIndicator({ currentPhase }: { currentPhase: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {PHASES.map((phase, i) => (
        <div key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            animate={{
              background: i === currentPhase ? phase.color : i < currentPhase ? '#00ff88' : 'rgba(255,255,255,0.1)',
              scale: i === currentPhase ? 1.2 : 1,
            }}
            transition={{ duration: 0.3 }}
            style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }}
          />
          <motion.span
            animate={{
              color: i === currentPhase ? phase.color : i < currentPhase ? '#94a3b8' : '#475569',
              fontWeight: i === currentPhase ? 600 : 400,
            }}
            style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
          >
            {phase.label}
          </motion.span>
          {i === currentPhase && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ width: 20, height: 1, background: phase.color }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// 3D Tilt Card Component
function TiltCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotation.x, rotateY: rotation.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className={className}
    >
      <div style={{ transform: 'translateZ(20px)' }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const interval = setInterval(() => setCurrentPhase(p => (p + 1) % PHASES.length), 2500);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Navbar />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(0, 212, 255, 0.1)', borderTopColor: '#00d4ff' }} />
        <p style={{ color: '#475569', fontSize: 14, fontFamily: 'monospace' }}>Verifying session...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <Navbar />

      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              borderRadius: '50%',
              background: '#00d4ff',
              boxShadow: '0 0 10px #00d4ff',
            }}
          />
        ))}
      </div>

      {/* ── HERO ──────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={mounted ? { opacity: heroOpacity, y: heroY } : {}}
        className="grid-bg relative min-h-[90dvh] lg:min-h-[100dvh] flex items-center pt-8 pb-8 md:pt-20 md:pb-16 lg:pt-0 lg:pb-0"
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent, rgba(3,7,18,0.7))', zIndex: 1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, var(--bg-primary))', zIndex: 2, pointerEvents: 'none' }} />

        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4 lg:gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 8 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px', borderRadius: 20, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'rgba(0,212,255,0.15)', color: '#00d4ff', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                    <Star size={10} fill="#00d4ff" /> Enterprise Edition
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Powered by Next Step Innovators</span>
                </div>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 'clamp(2rem, 1.5rem + 3vw, var(--text-5xl))', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 8 }}
              >
                Enterprise
                <br />
                <span className="gradient-text-cyan glow-cyan">Face Liveness</span>
                <br />
                & Identity APIs
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                style={{ fontSize: 'var(--text-base)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 'min(520px, 100%)', marginBottom: 16 }}
              >
                Production-ready biometric verification platform. Face liveness detection,
                anti-spoof protection, and continuous identity authentication infrastructure.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link href="/signup" className="btn-primary w-full sm:flex-1 flex items-center justify-center" style={{ textDecoration: 'none', height: 48, minHeight: 48 }}>
                  Start Building Free <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link href="/demo/basic" className="btn-ghost w-full sm:flex-1 flex items-center justify-center" style={{ textDecoration: 'none', height: 48, minHeight: 48 }}>
                  <Eye size={16} className="mr-2" /> Try Live Demo
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 lg:mt-6 w-full">
                {[ { value: '99%', label: 'Max Accuracy', color: '#00ff88' }, { value: '< 1s', label: 'Fast Mode', color: '#00d4ff' }, { value: '3 APIs', label: 'Products', color: '#7c3aed' }, { value: 'Enterprise', label: 'License', color: '#ffb800' } ].map(stat => (
                  <div key={stat.label} className="glass card-hover" style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="live-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: stat.color, boxShadow: `0 0 6px ${stat.color}` }} />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass scan-line w-full"
                style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(3,7,18,0.7)' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>BIOMETRIC SCAN</span>
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ fontSize: 10, color: '#00ff88', fontFamily: 'monospace' }}>● LIVE</motion.span>
                </div>
                <PhaseIndicator currentPhase={currentPhase} />
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <motion.div key={currentPhase} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ fontSize: 11, color: PHASES[currentPhase].color, fontFamily: 'monospace', padding: '8px 12px', borderRadius: 6, background: `${PHASES[currentPhase].color}11`, border: `1px solid ${PHASES[currentPhase].color}22` }}>
                    STATUS: {PHASES[currentPhase].label.toUpperCase()}
                  </motion.div>
                </div>
              </motion.div>

              <div className="w-full h-[240px] sm:h-[300px] lg:h-[420px] relative">
                {mounted && (
                  <HeroSceneErrorBoundary>
                    <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,212,255,0.03), transparent)' }} />}>
                      <HeroScene phase={PHASES[currentPhase].id as ScanPhase} />
                    </Suspense>
                  </HeroSceneErrorBoundary>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── TRUSTED BY MARQUEE ───────────────────────────── */}
      <section className="py-12 border-y border-white/5 bg-white/[0.01] overflow-hidden relative z-10">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Trusted by modern enterprises globally</span>
        </div>
        <div className="flex whitespace-nowrap opacity-50 relative">
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#030712] to-transparent z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#030712] to-transparent z-10" />
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            className="flex items-center gap-16 px-8"
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-16">
                <span className="text-2xl font-bold tracking-tight text-slate-400">BANKING</span>
                <span className="text-2xl font-bold tracking-tight text-slate-400">EDTECH</span>
                <span className="text-2xl font-bold tracking-tight text-slate-400">FINTECH</span>
                <span className="text-2xl font-bold tracking-tight text-slate-400">HEALTHCARE</span>
                <span className="text-2xl font-bold tracking-tight text-slate-400">GOVERNMENT</span>
                <span className="text-2xl font-bold tracking-tight text-slate-400">ENTERPRISE</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BUILT FOR CRITICAL APPLICATIONS ──────────────── */}
      <section className="section-padding relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,255,0.05),transparent_50%)] pointer-events-none" />
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Built For Critical Applications</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Whether you are securing exams, processing high-value transactions, or authenticating corporate access, MITRA VERIFY scales to meet your exact security needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CRITICAL_APPS.map((app, i) => (
              <motion.div key={app.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <TiltCard className="premium-glass p-8 rounded-2xl h-full border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg" style={{ background: `${app.color}15`, border: `1px solid ${app.color}30`, boxShadow: `0 0 20px ${app.color}10` }}>
                    <app.icon size={28} color={app.color} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{app.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{app.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DASHBOARD PREVIEW ───────────────────────── */}
      <section className="section-padding relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#060b19] -skew-y-3 origin-top-left z-0" />
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Unprecedented Observability</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Monitor your security posture in real-time. Track verification success rates, spoof attempts, and API usage across your entire infrastructure.
            </p>
          </div>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="premium-glass rounded-2xl p-2 border border-white/10 shadow-[0_0_50px_rgba(0,212,255,0.1)] relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] rounded-2xl opacity-20 blur-xl" />
            <div className="bg-[#030712] rounded-xl overflow-hidden relative z-10 border border-white/5">
              {/* Dashboard Header Mock */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="text-sm font-semibold text-slate-300">Security Operations Center</div>
                </div>
                <div className="text-xs font-mono text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" /> LIVE
                </div>
              </div>
              
              {/* Dashboard Grid Mock */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Requests', value: '1.2M', trend: '+14%', color: '#00d4ff' },
                  { label: 'Passed', value: '984K', trend: '82%', color: '#00ff88' },
                  { label: 'Spoof Detected', value: '12K', trend: '1%', color: '#ff3366' },
                  { label: 'Avg Latency', value: '450ms', trend: '-12ms', color: '#7c3aed' },
                ].map((metric, i) => (
                  <div key={i} className="glass p-5 rounded-xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Activity size={48} color={metric.color} />
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 relative z-10">{metric.label}</div>
                    <div className="text-3xl font-bold text-white mb-2 relative z-10">{metric.value}</div>
                    <div className="text-xs font-mono relative z-10" style={{ color: metric.color }}>{metric.trend}</div>
                  </div>
                ))}
                
                <div className="md:col-span-3 glass p-6 rounded-xl border border-white/5 h-64 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }} />
                  {/* Mock Chart Area */}
                  <div className="absolute bottom-0 w-full flex items-end justify-between px-4 opacity-60">
                    {[...Array(30)].map((_, i) => (
                      <motion.div key={i} className="w-4 bg-gradient-to-t from-[#00d4ff]/10 to-[#00d4ff]/60 rounded-t-sm"
                        initial={{ height: Math.random() * 50 + 20 }}
                        animate={{ height: Math.random() * 150 + 20 }}
                        transition={{ repeat: Infinity, duration: Math.random() * 2 + 2, repeatType: 'reverse' }}
                      />
                    ))}
                  </div>
                  <div className="relative z-10 text-slate-400 font-mono text-sm self-start w-full flex justify-between">
                    <span>Verification Volume (24h)</span>
                    <span className="text-[#00ff88]">System Healthy</span>
                  </div>
                </div>

                <div className="md:col-span-1 glass p-6 rounded-xl border border-white/5 h-64 flex flex-col justify-center">
                  <div className="text-xs text-slate-500 uppercase tracking-widest mb-6">Threat Vectors</div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Deepfake</span><span className="text-[#ff3366] font-mono">6.2K</span></div>
                    <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-[#ff3366] h-1.5 rounded-full" style={{ width: '60%' }} /></div>
                    
                    <div className="flex justify-between items-center text-sm mt-4"><span className="text-slate-400">Screen Replay</span><span className="text-[#ffb800] font-mono">3.8K</span></div>
                    <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-[#ffb800] h-1.5 rounded-full" style={{ width: '38%' }} /></div>

                    <div className="flex justify-between items-center text-sm mt-4"><span className="text-slate-400">Print Attack</span><span className="text-[#7c3aed] font-mono">1.1K</span></div>
                    <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-[#7c3aed] h-1.5 rounded-full" style={{ width: '15%' }} /></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ENTERPRISE GRADE SECURITY ────────────────────── */}
      <section className="section-padding relative z-10">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7c3aed] mb-4 block">Zero Trust Architecture</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Enterprise Grade Security</h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                MITRA VERIFY employs a multi-layered defense strategy, ensuring that every verification request is authentic, live, and belongs to the claimed identity.
              </p>
              
              <div className="space-y-6">
                {ENTERPRISE_SECURITY.map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4 group cursor-default">
                    <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center shrink-0 border border-[#7c3aed]/20 group-hover:bg-[#7c3aed]/20 transition-colors">
                      <item.icon size={20} color="#7c3aed" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#00d4ff] rounded-full blur-[100px] opacity-20 animate-pulse" />
              <div className="premium-glass p-8 rounded-2xl border border-white/10 relative z-10 shadow-[0_0_50px_rgba(124,58,237,0.1)]">
                <pre className="text-xs font-mono text-[#00ff88] overflow-x-auto whitespace-pre-wrap break-words">
{`{
  "status": "success",
  "verification": {
    "identity_match": true,
    "confidence_score": 0.998,
    "liveness": {
      "passed": true,
      "score": 0.985,
      "metrics": {
        "depth_analysis": "pass",
        "texture_analysis": "pass",
        "micro_movements": "pass"
      }
    },
    "anti_spoof": {
      "deepfake_risk": "low",
      "screen_replay": false,
      "printed_photo": false
    }
  },
  "timestamp": "${new Date().toISOString()}",
  "request_id": "req_8x99a2b1c"
}`}
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── API PRODUCTS ─────────────────────────────────── */}
      <section style={{ background: 'var(--bg-secondary)' }} className="section-padding relative z-10 border-t border-white/5">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-label" style={{ color: '#00d4ff', display: 'block', marginBottom: 'var(--space-2)' }}>THREE POWERFUL APIs</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight" style={{ marginBottom: 'var(--space-2)' }}>Choose Your Verification Level</h2>
            <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 560, margin: '0 auto' }}>From fast 1-second liveness checks to enterprise-grade continuous authentication</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {API_PRODUCTS.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card-hover flex flex-col h-full" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', background: product.gradient, border: `1px solid ${product.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${product.color}15`, border: `1px solid ${product.color}30`, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                    <product.icon size={22} color={product.color} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: product.color }}>{product.accuracy}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>Accuracy</div>
                  </div>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>{product.name}</h3>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: product.color, background: `${product.color}0d`, padding: '6px 10px', borderRadius: 6, marginBottom: 'var(--space-2)', display: 'inline-block' }}>{product.endpoint}</div>
                <div style={{ marginBottom: 'var(--space-3)', flexGrow: 1 }}>
                  {product.checks.map(check => (
                    <div key={check} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <CheckCircle size={13} color={product.color} />
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>{check}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>Target Speed</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>{product.target}</div>
                  </div>
                  <Link href={`/demo/${product.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: product.color, textDecoration: 'none', fontWeight: 600 }}>Try Demo <ChevronRight size={14} /></Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
            <Link href="/compare" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Full API Comparison <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE CTA ───────────────────────────────── */}
      <section className="py-24 relative z-10 overflow-hidden bg-[#030712] border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,212,255,0.05),transparent_50%)] pointer-events-none" />
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="premium-glass p-12 md:p-20 rounded-3xl text-center border border-white/10 relative overflow-hidden shadow-[0_0_100px_rgba(0,212,255,0.05)]">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#00d4ff]/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#7c3aed]/20 rounded-full blur-[100px]" />
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight relative z-10">Start Securing Your Platform Today</h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto relative z-10">
              Deploy military-grade liveness detection and identity authentication into your infrastructure in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link href="/signup" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                Get Started For Free <ArrowRight size={20} />
              </Link>
              <Link href="/contact" className="btn-ghost text-lg px-8 py-4 flex items-center justify-center gap-2 bg-white/5 border border-white/10">
                Contact Sales
              </Link>
            </div>
            
            <p className="mt-8 text-sm text-slate-500 font-mono uppercase tracking-widest relative z-10">
              No credit card required. 10,000 free API calls/month.
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
