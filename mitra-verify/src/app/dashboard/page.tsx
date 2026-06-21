'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Eye, Zap, Fingerprint, AlertTriangle, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
import PageTransition from '@/components/cyber/PageTransition';
import { useAuth } from '@/context/AuthContext';
import LiveActivityFeed from '@/components/dashboard/LiveActivityFeed';
import NeuralNetworkAnimation from '@/components/dashboard/NeuralNetworkAnimation';
import Global3DBackground from '@/components/cyber/Global3DBackground';
import LiveStatusIndicators from '@/components/dashboard/LiveStatusIndicators';
import EnhancedKPICard from '@/components/dashboard/EnhancedKPICard';
import PremiumBiometricGlobe from '@/components/dashboard/PremiumBiometricGlobe';
import ProtectedRoute from '@/components/auth/ProtectedRoute';


interface Overview {
  total_requests: number;
  successful_verifications: number;
  failed_verifications: number;
  no_face_detected: number;
  spoof_attempts: number;
  identity_matches: number;
  success_rate: number;
  avg_processing_time: number;
  active_api_keys: number;
}

interface Activity {
  date: string;
  result: string;
  type: string;
}

interface Threat {
  id: string;
  result: string;
  confidence: number;
  spoof_score: number;
  api_type: string;
  timestamp: string;
}

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color?: string;
}

interface UsageDataItem {
  date: string;
  pass: number;
  fail: number;
  spoof: number;
  noFace: number;
  total: number;
}



export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [usageData, setUsageData] = useState<UsageDataItem[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);



  async function loadData() {
    setLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Biometric telemetry request timed out (5s)')), 5000)
      );
      const [overviewRes, usageRes] = await Promise.race([
        Promise.all([
          analyticsAPI.overview(),
          analyticsAPI.usage(30),
        ]),
        timeoutPromise
      ]) as any;
      
      setOverview(overviewRes.data.data || overviewRes.data);
      setThreats([]); // Removed threats entirely

      // Process usage data into daily buckets
      const rawData: Activity[] = usageRes.data.data || [];
      const buckets: Record<string, { pass: number; fail: number; spoof: number; noFace: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM d');
        buckets[d] = { pass: 0, fail: 0, spoof: 0, noFace: 0 };
      }
      rawData.forEach(item => {
        const d = format(new Date(item.date), 'MMM d');
        if (buckets[d]) {
          const res = (item.result || '').toLowerCase();
          if (res === 'pass' || res === 'success' || res === 'identity_match_success') buckets[d].pass++;
          else if (res === 'spoof' || res === 'spoof_detected') buckets[d].spoof++;
          else if (res === 'no_face_detected') buckets[d].noFace++;
          else buckets[d].fail++;
        }
      });
      setUsageData(Object.entries(buckets).map(([date, counts]) => ({ date, ...counts, total: counts.pass + counts.fail + counts.spoof + counts.noFace })));
      setLastRefresh(new Date());
      setError(null);
      setIsDemoMode(false);
    } catch (err: unknown) {
      console.warn('Telemetry API unavailable or error occurred.', err);
      setError('Unable to fetch live telemetry. Dashboard is empty.');
      setIsDemoMode(false);
      
      // Default to empty state instead of random mock data
      setOverview({
        total_requests: 0,
        successful_verifications: 0,
        failed_verifications: 0,
        no_face_detected: 0,
        spoof_attempts: 0,
        identity_matches: 0,
        success_rate: 0,
        avg_processing_time: 0,
        active_api_keys: 0
      });
      setUsageData([]);
    } finally {
      setLoading(false);
    }
  }

  const pieData = overview ? [
    { name: 'Pass', value: overview.successful_verifications, color: '#00ff88' },
    { name: 'Fail', value: overview.failed_verifications, color: '#ff3366' },
    { name: 'Spoof', value: overview.spoof_attempts, color: '#ffb800' },
    { name: 'No Face', value: overview.no_face_detected, color: '#94a3b8' },
  ].filter(d => d.value > 0) : [];

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#0a0f1e] relative text-slate-300 font-sans selection:bg-[#00d4ff]/30">
        <Navbar />
        
        {/* Abstract Particle / Neural Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <Global3DBackground />
          <NeuralNetworkAnimation />
          {/* Subtle top gradient */}
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#00d4ff]/[0.05] to-transparent" />
        </div>

        <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 animate-fade-up">
            <div>
              <h2 className="text-[#00d4ff] font-mono text-sm font-semibold tracking-widest mb-1 uppercase">
                WELCOME BACK, {user?.name?.toUpperCase() || 'ADMINISTRATOR'}
              </h2>
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
                Enterprise Biometric Security Center
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Real-time monitoring of face liveness, anti-spoof protection, identity verification, and API activity. Auto-refreshes every 30s.
              </p>
              <LiveStatusIndicators />
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <button onClick={loadData} className="px-4 py-2 rounded-lg bg-[#0a0f1e]/50 backdrop-blur-md hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync
              </button>
            </div>
          </div>

          {error && !isDemoMode && (
             <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center backdrop-blur-md">
               <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
               <h3 className="text-white font-medium mb-1">Telemetry Interrupted</h3>
               <p className="text-red-200/70 text-sm mb-4">{error}</p>
               <button onClick={loadData} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-colors">Retry Connection</button>
             </div>
          )}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            
            {/* Top Row: KPIs and Globe */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up animate-delay-1">
              
              {/* Primary KPIs span 8 */}
              <div className="col-span-1 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <EnhancedKPICard 
                  label="Total API Requests" 
                  value={overview?.total_requests || 0} 
                  icon={Activity} 
                  color="#00d4ff" 
                  sparklineData={usageData.map(d => d.total)}
                />
                <EnhancedKPICard 
                  label="Successful Verifications" 
                  value={overview?.successful_verifications || 0} 
                  icon={Shield} 
                  color="#00ff9d" 
                  sparklineData={usageData.map(d => d.pass)}
                />
                <EnhancedKPICard 
                  label="Failed Verifications" 
                  value={overview?.failed_verifications || 0} 
                  icon={AlertTriangle} 
                  color="#ff3366" 
                  sparklineData={usageData.map(d => d.fail)}
                />
                <EnhancedKPICard 
                  label="No Face Detected" 
                  value={overview?.no_face_detected || 0} 
                  icon={Eye} 
                  color="#94a3b8" 
                  sparklineData={usageData.map(d => d.noFace)}
                />
                <EnhancedKPICard 
                  label="Spoof Attempts" 
                  value={overview?.spoof_attempts || 0} 
                  icon={AlertTriangle} 
                  color="#ffb800" 
                  sparklineData={usageData.map(d => d.spoof)}
                />
                <EnhancedKPICard 
                  label="Identity Matches" 
                  value={overview?.identity_matches || 0} 
                  icon={Fingerprint} 
                  color="#007BFF" 
                />
                <EnhancedKPICard 
                  label="Success Rate" 
                  value={parseFloat((overview?.success_rate || 0).toFixed(1))}
                  unit="%" 
                  icon={TrendingUp} 
                  color="#00d4ff" 
                />
                <EnhancedKPICard 
                  label="Average Verification Time" 
                  value={parseFloat((overview?.avg_processing_time || 0).toFixed(0))}
                  unit="ms" 
                  icon={Clock} 
                  color="#00ff9d" 
                />
              </div>

              {/* Globe spans 4 */}
              <div className="premium-glass spotlight-card col-span-1 lg:col-span-4 p-6 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
                <div className="absolute inset-0 z-0 opacity-50">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00d4ff]/10 via-[#0a0f1e]/80 to-[#0a0f1e]" />
                </div>
                <div className="absolute inset-0 z-10 pointer-events-auto">
                  <PremiumBiometricGlobe />
                </div>
                <div className="relative z-20 pointer-events-none mt-auto">
                  <h3 className="text-xs font-semibold text-[#00d4ff] mb-1 uppercase tracking-widest">Global Telemetry Node</h3>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shadow-[0_0_8px_#00ff9d] animate-pulse" /> Live Monitoring Active
                  </div>
                </div>
              </div>

            </div>

            {/* Middle Row: Area Chart, Funnel */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up animate-delay-2">
              
              {/* Area Chart - spans 8 */}
              <div className="premium-glass spotlight-card lg:col-span-8 p-6">
                <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">Verification Trend & Volume (30D)</h3>
                <div className="h-[280px]">
                  {usageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={usageData.slice(-15)}>
                        <defs>
                          <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00ff9d" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#00ff9d" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="spoofGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffb800" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#ffb800" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff3366" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#ff3366" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }} itemStyle={{ fontSize: 13 }} labelStyle={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }} />
                        <Area type="monotone" dataKey="pass" name="Passed" stroke="#00ff9d" strokeWidth={2} fill="url(#passGrad)" />
                        <Area type="monotone" dataKey="spoof" name="Spoof" stroke="#ffb800" strokeWidth={2} fill="url(#spoofGrad)" />
                        <Area type="monotone" dataKey="fail" name="Failed" stroke="#ff3366" strokeWidth={2} fill="url(#failGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">Waiting for telemetry...</div>
                  )}
                </div>
              </div>

              {/* Pass vs Fail Ratio (PieChart) - spans 4 */}
              <div className="premium-glass spotlight-card lg:col-span-4 p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">Pass vs Fail Ratio</h3>
                <div className="flex-1 min-h-[250px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ fontSize: 13, color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row: Live Feed */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up animate-delay-3">
              <div className="premium-glass spotlight-card lg:col-span-12 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff] animate-pulse" />
                    Realtime Activity Timeline
                  </h3>
                  <span className="text-[10px] bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 rounded text-[#00d4ff] font-mono shadow-[0_0_10px_rgba(0,212,255,0.2)]">LIVE</span>
                </div>
                <LiveActivityFeed isDemoMode={isDemoMode} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
    </ProtectedRoute>
  );
}
