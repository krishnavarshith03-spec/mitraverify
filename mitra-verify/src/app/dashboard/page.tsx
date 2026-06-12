'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Eye, Zap, Fingerprint, AlertTriangle, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Dashboard3DBackground from '@/components/Dashboard3DBackground';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { format, subDays } from 'date-fns';

interface Overview {
  total_requests: number;
  successful_verifications: number;
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
  total: number;
}

function KPICard({ label, value, unit, delta, icon: Icon, color = '#00d4ff' }: KPICardProps) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className="glass card-hover" style={{ padding: 24, borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        {delta !== undefined && (
          <span style={{ fontSize: 12, color: delta >= 0 ? '#00ff88' : '#ff3366', fontWeight: 600 }}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc', lineHeight: 1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span style={{ fontSize: 16, color: '#475569', marginLeft: 4 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>{label}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [usageData, setUsageData] = useState<UsageDataItem[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?reason=unauthenticated');
      return;
    }
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw size={32} color="#00d4ff" />
        </motion.div>
      </div>
    );
  }

  async function loadData() {
    try {
      const [overviewRes, usageRes, threatsRes] = await Promise.all([
        analyticsAPI.overview(),
        analyticsAPI.usage(30),
        analyticsAPI.threats(),
      ]);
      setOverview(overviewRes.data);
      setThreats(threatsRes.data.threats || []);

      // Process usage data into daily buckets
      const rawData: Activity[] = usageRes.data.data || [];
      const buckets: Record<string, { pass: number; fail: number; spoof: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM d');
        buckets[d] = { pass: 0, fail: 0, spoof: 0 };
      }
      rawData.forEach(item => {
        const d = format(new Date(item.date), 'MMM d');
        if (buckets[d]) {
          if (item.result === 'pass') buckets[d].pass++;
          else if (item.result === 'spoof') buckets[d].spoof++;
          else buckets[d].fail++;
        }
      });
      setUsageData(Object.entries(buckets).map(([date, counts]) => ({ date, ...counts, total: counts.pass + counts.fail + counts.spoof })));
      setLastRefresh(new Date());
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to load dashboard metrics. The request timed out or the server is unavailable.");
      const apiErr = err as { response?: { status?: number } };
      if (apiErr?.response?.status === 401) {
        localStorage.removeItem('mv_access_token');
        router.replace('/auth/login?reason=unauthenticated');
      }
    } finally {
      setLoading(false);
    }
  }

  const pieData = overview ? [
    { name: 'Pass', value: overview.successful_verifications, color: '#00ff88' },
    { name: 'Fail', value: overview.total_requests - overview.successful_verifications - overview.spoof_attempts, color: '#ff3366' },
    { name: 'Spoof', value: overview.spoof_attempts, color: '#ffb800' },
  ].filter(d => d.value > 0) : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      <Dashboard3DBackground />
      <Navbar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 24px 60px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: '#475569', fontSize: 14 }}>
              Last updated {lastRefresh ? format(lastRefresh, 'HH:mm:ss') : '--:--:--'} ·
              <span style={{ color: '#00d4ff' }}> Auto-refreshes every 30s</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={loadData} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link href="/developer" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> API Keys
            </Link>
          </div>
        </div>

        {loading || authLoading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw size={32} color="#00d4ff" />
            </motion.div>
            <p style={{ color: '#475569', marginTop: 16 }}>Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="glass" style={{ padding: 40, borderRadius: 16, textAlign: 'center', border: '1px solid rgba(255,51,102,0.2)' }}>
            <AlertTriangle size={36} color="#ff3366" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f8fafc', marginBottom: 8 }}>Unable to Load Analytics</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>{error}</p>
            <button onClick={loadData} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
              <KPICard label="Total Requests" value={overview?.total_requests || 0} icon={Activity} color="#00d4ff" />
              <KPICard label="Successful Verifications" value={overview?.successful_verifications || 0} icon={Eye} color="#00ff88" />
              <KPICard label="Spoof Attempts" value={overview?.spoof_attempts || 0} icon={Shield} color="#ff3366" />
              <KPICard label="Identity Matches" value={overview?.identity_matches || 0} icon={Fingerprint} color="#7c3aed" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <KPICard label="Success Rate" value={`${(overview?.success_rate || 0).toFixed(1)}`} unit="%" icon={TrendingUp} color="#00ff88" />
              <KPICard label="Avg Processing Time" value={`${(overview?.avg_processing_time || 0).toFixed(0)}`} unit="ms" icon={Clock} color="#ffb800" />
              <KPICard label="Active API Keys" value={overview?.active_api_keys || 0} icon={Zap} color="#00d4ff" />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
              {/* Usage Area Chart */}
              <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Requests (Last 30 Days)</h3>
                {usageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={usageData.slice(-15)}>
                      <defs>
                        <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00ff88" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="spoofGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff3366" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#ff3366" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Area type="monotone" dataKey="pass" stroke="#00ff88" strokeWidth={2} fill="url(#passGrad)" name="Pass" />
                      <Area type="monotone" dataKey="spoof" stroke="#ff3366" strokeWidth={2} fill="url(#spoofGrad)" name="Spoof" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
                    No usage data yet. Start making API calls to see analytics.
                  </div>
                )}
              </div>

              {/* Result Distribution */}
              <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Result Distribution</h3>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                      {pieData.map(d => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                            <span style={{ fontSize: 13, color: '#94a3b8' }}>{d.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13, textAlign: 'center' }}>
                    Make API calls to see result distribution
                  </div>
                )}
              </div>
            </div>

            {/* Threat Feed */}
            <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} color="#ffb800" />
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>Threat Monitoring</h3>
                </div>
                <span style={{ fontSize: 12, color: '#475569' }}>{threats.length} detected events</span>
              </div>
              {threats.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 14 }}>
                  <Shield size={28} color="#00ff88" style={{ marginBottom: 12 }} />
                  <div style={{ color: '#00ff88', fontWeight: 600, marginBottom: 4 }}>All Clear</div>
                  No threats or spoof attempts detected
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {threats.slice(0, 10).map(threat => (
                    <div key={threat.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      borderRadius: 10,
                      background: threat.result === 'spoof' ? 'rgba(255,184,0,0.04)' : 'rgba(255,51,102,0.04)',
                      border: `1px solid ${threat.result === 'spoof' ? 'rgba(255,184,0,0.15)' : 'rgba(255,51,102,0.12)'}`,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: threat.result === 'spoof' ? '#ffb800' : '#ff3366', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: threat.result === 'spoof' ? '#ffb800' : '#ff3366', fontWeight: 600, width: 60 }}>
                        {threat.result.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{threat.api_type} API</span>
                      <span style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
                        confidence: {(threat.confidence * 100).toFixed(0)}%
                      </span>
                      <span style={{ fontSize: 11, color: '#475569' }}>
                        {format(new Date(threat.timestamp), 'MMM d HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
