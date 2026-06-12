'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Shield, Eye, Zap, Fingerprint, AlertTriangle,
  TrendingUp, Clock, RefreshCw, BarChart3, Code2
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { analyticsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { format, subDays } from 'date-fns';
import Link from 'next/link';
import Dashboard3DBackground from '@/components/Dashboard3DBackground';

interface Overview {
  total_requests: number;
  successful_verifications: number;
  spoof_attempts: number;
  identity_matches: number;
  success_rate: number;
  avg_processing_time: number;
  active_api_keys: number;
}

interface ActivityItem {
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
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color?: string;
}

function KPICard({ label, value, unit, icon: Icon, color = '#00d4ff' }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className="glass card-hover"
      style={{ padding: 24, borderRadius: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc', lineHeight: 1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span style={{ fontSize: 16, color: '#475569', marginLeft: 4 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>{label}</div>
    </motion.div>
  );
}

interface UsageDataItem {
  date: string;
  pass: number;
  fail: number;
  spoof: number;
  total: number;
}

export default function AuthenticatedDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [usageData, setUsageData] = useState<UsageDataItem[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Biometric telemetry request timed out (5s)')), 5000)
      );
      const [overviewRes, usageRes, threatsRes] = await Promise.race([
        Promise.all([
          analyticsAPI.overview(),
          analyticsAPI.usage(30),
          analyticsAPI.threats(),
        ]),
        timeoutPromise
      ]) as any;
      setOverview(overviewRes.data);
      setThreats(threatsRes.data.threats || []);

      // Process usage data into daily buckets
      const rawData: ActivityItem[] = usageRes.data.data || [];
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
      setUsageData(Object.entries(buckets).map(([date, counts]) => ({
        date,
        ...counts,
        total: counts.pass + counts.fail + counts.spoof
      })));
      setLastRefresh(new Date());
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to load dashboard statistics', err);
      setError('Failed to load biometric telemetry. The server may be offline or the request timed out.');
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
    <div style={{ position: 'relative' }}>
      <Dashboard3DBackground />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 24px 60px', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Welcome back, <span className="gradient-text-cyan glow-cyan">{user?.name || 'Developer'}</span>!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>
            You are authenticated. Configure API keys, view live usage logs, or test verification challenges.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#475569', marginRight: 4 }}>
            Syncs automatically every 30s (last check {format(lastRefresh, 'HH:mm:ss')})
          </span>
          <button onClick={loadData} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40 }}>
            <RefreshCw size={14} /> Sync Metrics
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div style={{ marginBottom: 40 }}>
        <h3 style={{ fontSize: 13, color: '#475569', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Open Dashboard', href: '/dashboard', icon: BarChart3, color: '#00d4ff', desc: 'Full usage statistics' },
            { label: 'Manage API Keys', href: '/developer', icon: Zap, color: '#ffb800', desc: 'Create & revoke keys' },
            { label: 'Developer Portal', href: '/developer', icon: Code2, color: '#7c3aed', desc: 'SDKs and integration' },
            { label: 'Launch Demo', href: '/demo/basic', icon: Eye, color: '#00ff88', desc: 'Fast webcam liveness' },
            { label: 'View Analytics', href: '/dashboard', icon: Activity, color: '#0066ff', desc: 'Real-time monitoring' }
          ].map(action => (
            <Link href={action.href} key={action.label} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass card-hover"
                style={{
                  padding: 18,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  height: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${action.color}12`,
                  border: `1px solid ${action.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <action.icon size={16} color={action.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                    {action.desc}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dashboard Metrics */}
      {loading || authLoading ? (
        <div className="glass" style={{ padding: '80px 0', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <RefreshCw size={28} color="#00d4ff" />
          </motion.div>
          <p style={{ color: '#475569', fontSize: 13, fontFamily: 'monospace' }}>Syncing biometric telemetry...</p>
        </div>
      ) : error ? (
        <div className="glass" style={{ padding: 40, borderRadius: 16, textAlign: 'center', border: '1px solid rgba(255,51,102,0.2)' }}>
          <AlertTriangle size={36} color="#ff3366" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f8fafc', marginBottom: 8 }}>Unable to Sync Telemetry</h3>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>{error}</p>
          <button onClick={loadData} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={14} /> Retry Sync
          </button>
        </div>
      ) : (
        <>
          {/* KPI Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
            <KPICard label="Total Requests" value={overview?.total_requests || 0} icon={Activity} color="#00d4ff" />
            <KPICard label="Successful Verifications" value={overview?.successful_verifications || 0} icon={Eye} color="#00ff88" />
            <KPICard label="Spoof Attempts" value={overview?.spoof_attempts || 0} icon={Shield} color="#ff3366" />
            <KPICard label="Identity Matches" value={overview?.identity_matches || 0} icon={Fingerprint} color="#7c3aed" />
          </div>

          {/* KPI Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            <KPICard label="Success Rate" value={overview?.success_rate ? `${overview.success_rate.toFixed(1)}` : '0.0'} unit="%" icon={TrendingUp} color="#00ff88" />
            <KPICard label="Avg Processing Time" value={overview?.avg_processing_time ? `${overview.avg_processing_time.toFixed(0)}` : '0'} unit="ms" icon={Clock} color="#ffb800" />
            <KPICard label="Active API Keys" value={overview?.active_api_keys || 0} icon={Zap} color="#00d4ff" />
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
            {/* Usage Chart */}
            <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', marginBottom: 20 }}>Verification Activity (Last 30 Days)</h3>
              {usageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={usageData.slice(-15)}>
                    <defs>
                      <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00ff88" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="spoofGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff3366" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#ff3366" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="pass" stroke="#00ff88" strokeWidth={2} fill="url(#passGrad)" name="Pass" />
                    <Area type="monotone" dataKey="spoof" stroke="#ff3366" strokeWidth={2} fill="url(#spoofGrad)" name="Spoof" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
                  No usage data available yet.
                </div>
              )}
            </div>

            {/* Distribution Pie Chart */}
            <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', marginBottom: 20 }}>Verification Results</h3>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                        {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
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
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13 }}>
                  No result distribution data available.
                </div>
              )}
            </div>
          </div>

          {/* Threat Monitor */}
          <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color="#ffb800" />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>Threat Monitoring Log</h3>
              </div>
              <span style={{ fontSize: 12, color: '#475569' }}>{threats.length} events logged</span>
            </div>
            {threats.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#475569' }}>
                <Shield size={24} color="#00ff88" style={{ marginBottom: 10, opacity: 0.8 }} />
                <div style={{ color: '#00ff88', fontWeight: 600, fontSize: 13 }}>System Clear</div>
                No threat events logged in this session
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {threats.slice(0, 5).map(threat => (
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
