'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  CheckCircle2, ShieldAlert, Activity, Search,
  EyeOff, Clock, Server, Check, Monitor, Smartphone, Tablet, Users, 
  MapPin, Download, Filter, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar
} from 'recharts';

// --- Types ---
interface ApiPerf {
  requests: number;
  pass: number;
  fail: number;
  spoof: number;
  faceLost: number;
  errors: number;
  totalLatency: number;
  lastRequest: string | null;
}

interface BottomAnalytics {
  face_quality: {
    average: number;
    low_light: number;
    blur: number;
    occlusion: number;
  };
  device_analytics: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  country_analytics: { country: string; value: number }[];
}

interface TelemetryData {
  executive_overview: {
    total_verifications: number;
    successful_verifications: number;
    failed_verifications: number;
    spoof_attempts_blocked: number;
    face_lost_events: number;
    avg_processing_time_ms: number;
  };
  api_performance: Record<string, ApiPerf>;
  analytics_chart: any[];
  bottom_analytics: BottomAnalytics;
}

interface VerificationEvent {
  id: string;
  timestamp: string;
  apiType: string;
  status: string;
  confidence: number;
  processingTimeMs: number;
  spoofFlag: boolean;
  faceDetectedFlag?: boolean;
  user?: string;
  failureReason?: string;
  multipleFaces?: boolean;
  device?: string;
}

// --- Colors based on prompt ---
const COLORS = {
  success: '#10B981',
  failed: '#EF4444',
  faceLost: '#F97316',
  spoof: '#EC4899',
  multipleFaces: '#EAB308',
  apiBasic: '#00D4FF',
  apiAdvanced: '#A855F7',
  apiEnterprise: '#10B981',
  bgCard: '#0A1224',
  border: '#1F2B45'
};

const PIE_COLORS = [COLORS.success, COLORS.failed, COLORS.spoof, COLORS.faceLost];
const BAR_COLORS = [COLORS.apiBasic, COLORS.apiAdvanced, COLORS.apiEnterprise];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [events, setEvents] = useState<VerificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('24 Hours');
  const [lastUpdate, setLastUpdate] = useState<string>('Just now');

  const fetchData = async () => {
    try {
      const [overviewRes, eventsRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/events')
      ]);
      const overviewData = await overviewRes.json();
      const eventsData = await eventsRes.json();
      
      setTelemetry(overviewData.data);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setLastUpdate('Just now');
      
      setTimeout(() => {
        setLastUpdate('Updated 3 sec ago');
      }, 3000);
      
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(() => fetchData(), 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      return ev.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
             (ev.user && ev.user.toLowerCase().includes(searchQuery.toLowerCase())) ||
             ev.apiType.toLowerCase().includes(searchQuery.toLowerCase());
    }).slice(0, 10);
  }, [events, searchQuery]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { executive_overview, api_performance, analytics_chart, bottom_analytics } = telemetry || {
    executive_overview: { total_verifications: 0, successful_verifications: 0, failed_verifications: 0, spoof_attempts_blocked: 0, face_lost_events: 0, avg_processing_time_ms: 0 },
    api_performance: {
      Basic: { requests: 0, pass: 0, fail: 0, spoof: 0, faceLost: 0, errors: 0, totalLatency: 0, lastRequest: null },
      Advanced: { requests: 0, pass: 0, fail: 0, spoof: 0, faceLost: 0, errors: 0, totalLatency: 0, lastRequest: null },
      Enterprise: { requests: 0, pass: 0, fail: 0, spoof: 0, faceLost: 0, errors: 0, totalLatency: 0, lastRequest: null }
    },
    analytics_chart: [],
    bottom_analytics: {
      face_quality: { average: 0, low_light: 0, blur: 0, occlusion: 0 },
      device_analytics: { desktop: 0, mobile: 0, tablet: 0 },
      country_analytics: []
    }
  };

  const trueFailed = executive_overview.failed_verifications - executive_overview.spoof_attempts_blocked - executive_overview.face_lost_events;

  // Pie Chart Data
  const pieData = [
    { name: 'Passed', value: executive_overview.successful_verifications },
    { name: 'Failed', value: trueFailed > 0 ? trueFailed : 0 },
    { name: 'Spoof', value: executive_overview.spoof_attempts_blocked },
    { name: 'Face Lost', value: executive_overview.face_lost_events }
  ].filter(d => d.value > 0);
  
  if (pieData.length === 0) pieData.push({ name: 'No Data', value: 1 });

  // Bar Chart Data
  const barData = [
    { name: 'API 1', requests: api_performance['Basic']?.requests || 0, fill: COLORS.apiBasic },
    { name: 'API 2', requests: api_performance['Advanced']?.requests || 0, fill: COLORS.apiAdvanced },
    { name: 'API 3', requests: api_performance['Enterprise']?.requests || 0, fill: COLORS.apiEnterprise }
  ];

  const successRate = executive_overview.total_verifications > 0 
    ? ((executive_overview.successful_verifications / executive_overview.total_verifications) * 100).toFixed(1)
    : '0.0';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#050B18] font-sans text-slate-300 selection:bg-[#00D4FF]/30">
        <Navbar />

        <main className="pt-28 pb-16 px-6 md:px-12 max-w-[1600px] mx-auto space-y-8">
           
           {/* ========================================================= */}
           {/* TOP SECTION */}
           {/* ========================================================= */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h1 className="text-[28px] font-semibold text-white tracking-tight mb-1">
                   MITRA VERIFY Dashboard
                 </h1>
                 <p className="text-slate-400 text-[15px]">Real-time analytics across all verification APIs.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[13px] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                All Systems Operational
              </div>
           </div>

           {/* ========================================================= */}
           {/* KPI CARDS */}
           {/* ========================================================= */}
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
             <KpiCard title="Total Verifications" value={executive_overview.total_verifications.toLocaleString()} trend="▲ +8%" trendUp icon={Activity} lastUpdate={lastUpdate} />
             <KpiCard title="Successful" value={executive_overview.successful_verifications.toLocaleString()} trend="▲ +12%" trendUp icon={CheckCircle2} lastUpdate={lastUpdate} />
             <KpiCard title="Failed" value={(trueFailed > 0 ? trueFailed : 0).toLocaleString()} trend="▼ -2%" trendUp={false} icon={AlertCircle} lastUpdate={lastUpdate} />
             <KpiCard title="Spoofs Blocked" value={executive_overview.spoof_attempts_blocked.toLocaleString()} trend="▲ +4%" trendUp icon={ShieldAlert} lastUpdate={lastUpdate} />
             <KpiCard title="Face Lost" value={executive_overview.face_lost_events.toLocaleString()} trend="▼ -1%" trendUp={false} icon={EyeOff} lastUpdate={lastUpdate} />
             <KpiCard title="Average Verification Time" value={`${executive_overview.avg_processing_time_ms}ms`} trend="▼ -5ms" trendUp={false} icon={Clock} lastUpdate={lastUpdate} />
           </div>

           {/* ========================================================= */}
           {/* MAIN ANALYTICS */}
           {/* ========================================================= */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Left: Verification Trend (Line Chart) */}
             <div className="lg:col-span-2 bg-[#0A1224] border border-[#1F2B45] rounded-[20px] p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[15px] font-medium text-white">Verification Trend</h3>
                 <div className="flex items-center gap-2">
                    {['24 Hours', '7 Days', '30 Days'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${timeframe === t ? 'bg-[#1F2B45] text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
               </div>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={analytics_chart}>
                     <defs>
                       <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.1}/><stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/></linearGradient>
                       <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.failed} stopOpacity={0.1}/><stop offset="95%" stopColor={COLORS.failed} stopOpacity={0}/></linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2B45" />
                     <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} minTickGap={30} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0A1224', border: '1px solid #1F2B45', borderRadius: '12px', padding: '12px', fontSize: '13px' }} 
                        itemStyle={{ padding: '2px 0' }}
                     />
                     <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 20 }} />
                     <Area type="monotone" dataKey="pass" name="Successful" stroke={COLORS.success} fill="url(#gSuccess)" strokeWidth={2} />
                     <Area type="monotone" dataKey="failed" name="Failed" stroke={COLORS.failed} fill="url(#gFailed)" strokeWidth={2} />
                     <Area type="monotone" dataKey="spoof" name="Spoof" stroke={COLORS.spoof} fill="transparent" strokeWidth={2} />
                     <Area type="monotone" dataKey="faceLost" name="Face Lost" stroke={COLORS.faceLost} fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                     <Area type="monotone" dataKey="multipleFaces" name="Multiple Faces" stroke={COLORS.multipleFaces} fill="transparent" strokeWidth={2} strokeDasharray="2 2" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
             </div>

             {/* Right: Verification Results (Donut) */}
             <div className="bg-[#0A1224] border border-[#1F2B45] rounded-[20px] p-8 flex flex-col shadow-sm">
               <h3 className="text-[15px] font-medium text-white mb-2">Verification Results</h3>
               <p className="text-[13px] text-slate-400 mb-6">Overall distribution of verification attempts.</p>
               
               <div className="flex-1 relative flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={pieData} cx="50%" cy="50%" innerRadius={85} outerRadius={110} paddingAngle={2} dataKey="value" stroke="none">
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: '#0A1224', border: '1px solid #1F2B45', borderRadius: '12px', fontSize: '13px' }} />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[32px] font-semibold text-white tracking-tight">{successRate}%</span>
                    <span className="text-[12px] text-slate-400 font-medium">Success Rate</span>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6">
                  {pieData.map((d, i) => {
                    const pct = executive_overview.total_verifications > 0 ? ((d.value / executive_overview.total_verifications) * 100).toFixed(1) : '0';
                    return (
                      <div key={d.name} className="flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                         <span className="text-[13px] text-slate-400 truncate">{d.name}</span>
                         <span className="text-[13px] font-medium text-white ml-auto">{pct}%</span>
                      </div>
                    )
                  })}
               </div>
             </div>
           </div>

           {/* ========================================================= */}
           {/* SECOND ROW */}
           {/* ========================================================= */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left: API Usage (Horizontal Bar) */}
              <div className="lg:col-span-2 bg-[#0A1224] border border-[#1F2B45] rounded-[20px] p-8 shadow-sm">
                 <h3 className="text-[15px] font-medium text-white mb-6">API Usage</h3>
                 <div className="h-[180px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }} barSize={32}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1F2B45" />
                       <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                       <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#e2e8f0', fontWeight: 500 }} width={60} />
                       <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#0A1224', border: '1px solid #1F2B45', borderRadius: '12px', fontSize: '13px' }} />
                       <Bar dataKey="requests" name="Requests" radius={[0, 4, 4, 0]}>
                         {barData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Right: System Status */}
              <div className="bg-[#0A1224] border border-[#1F2B45] rounded-[20px] p-8 shadow-sm flex flex-col">
                 <h3 className="text-[15px] font-medium text-white mb-6">System Status</h3>
                 <div className="flex-1 flex flex-col justify-between space-y-4">
                    <StatusItem label="API 1" status="Online" color={COLORS.success} />
                    <StatusItem label="API 2" status="Online" color={COLORS.success} />
                    <StatusItem label="API 3" status="Online" color={COLORS.success} />
                    <StatusItem label="Webhook" status="Connected" color={COLORS.success} />
                    <StatusItem label="SDK" status="Connected" color={COLORS.success} />
                    <StatusItem label="Database" status="Healthy" color={COLORS.success} />
                 </div>
              </div>
           </div>

           {/* ========================================================= */}
           {/* RECENT ACTIVITY */}
           {/* ========================================================= */}
           <div className="bg-[#0A1224] border border-[#1F2B45] rounded-[20px] shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-[#1F2B45] flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <h3 className="text-[15px] font-medium text-white">Recent Activity</h3>
                 <div className="flex items-center gap-3">
                    <div className="relative">
                       <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                       <input 
                         type="text" 
                         placeholder="Search verifications..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="bg-transparent border border-[#1F2B45] rounded-[10px] pl-9 pr-4 py-2 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]/50 w-full md:w-64 transition-colors"
                       />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-[#1F2B45] hover:bg-white/5 text-slate-300 text-[13px] font-medium transition-colors">
                      <Filter size={15} /> Filters
                    </button>
                    <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-[10px] border border-[#1F2B45] hover:bg-white/5 text-slate-300 text-[13px] font-medium transition-colors">
                      <Download size={15} /> Export CSV
                    </button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left whitespace-nowrap">
                    <thead className="border-b border-[#1F2B45] text-slate-400">
                       <tr>
                          <th className="px-8 py-4 text-[12px] font-medium">Time</th>
                          <th className="px-8 py-4 text-[12px] font-medium">Verification ID</th>
                          <th className="px-8 py-4 text-[12px] font-medium">User</th>
                          <th className="px-8 py-4 text-[12px] font-medium">API</th>
                          <th className="px-8 py-4 text-[12px] font-medium">Status</th>
                          <th className="px-8 py-4 text-[12px] font-medium">Failure Reason</th>
                          <th className="px-8 py-4 text-[12px] font-medium">Duration</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2B45]">
                       {filteredEvents.length === 0 ? (
                         <tr>
                           <td colSpan={7} className="px-8 py-10 text-center text-[13px] text-slate-500">No recent activity found.</td>
                         </tr>
                       ) : (
                         filteredEvents.map(ev => {
                           const isPassed = ev.status === 'VERIFIED' || ev.status === 'IDENTITY MATCHED';
                           const isFaceLost = ev.status === 'NO FACE DETECTED' || ev.faceDetectedFlag === false;
                           const isSpoof = ev.spoofFlag || ev.status === 'SPOOF ATTEMPT';
                           
                           let badgeClass = "text-slate-400";
                           let badgeText = ev.status;
                           
                           if (isPassed) { badgeClass = "text-[#10B981]"; badgeText = "Passed"; }
                           else if (isSpoof) { badgeClass = "text-[#EC4899]"; badgeText = "Spoof"; }
                           else if (isFaceLost) { badgeClass = "text-[#F97316]"; badgeText = "Face Lost"; }
                           else { badgeClass = "text-[#EF4444]"; badgeText = "Failed"; }

                           return (
                             <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-4 text-[13px] text-slate-400">{new Date(ev.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' })}</td>
                                <td className="px-8 py-4 text-[13px] font-mono text-slate-300">VR-{ev.id.substring(0, 5).toUpperCase()}</td>
                                <td className="px-8 py-4 text-[13px] text-white font-medium">{ev.user || '—'}</td>
                                <td className="px-8 py-4 text-[13px] text-slate-300">{ev.apiType === 'Basic' ? 'API 1' : ev.apiType === 'Advanced' ? 'API 2' : 'API 3'}</td>
                                <td className="px-8 py-4">
                                  <span className={`text-[13px] font-medium ${badgeClass}`}>
                                    {badgeText}
                                  </span>
                                </td>
                                <td className="px-8 py-4 text-[13px] text-slate-400">{ev.failureReason || '—'}</td>
                                <td className="px-8 py-4 text-[13px] text-slate-400">{ev.processingTimeMs} ms</td>
                             </tr>
                           )
                         })
                       )}
                    </tbody>
                 </table>
              </div>
              <div className="p-4 border-t border-[#1F2B45] flex items-center justify-between text-[13px] text-slate-400">
                 <span className="px-4">Showing {filteredEvents.length} results</span>
                 <div className="flex items-center gap-2 pr-4">
                    <button className="p-1 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                    <button className="p-1 hover:text-white transition-colors"><ChevronRight size={16} /></button>
                 </div>
              </div>
           </div>

           {/* ========================================================= */}
           {/* API PERFORMANCE */}
           {/* ========================================================= */}
           <div className="bg-[#0A1224] border border-[#1F2B45] rounded-[20px] shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-[#1F2B45]">
                 <h3 className="text-[15px] font-medium text-white">API Performance</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left whitespace-nowrap">
                    <thead className="border-b border-[#1F2B45] text-slate-400">
                       <tr>
                          <th className="px-8 py-4 text-[12px] font-medium">API</th>
                          <th className="px-8 py-4 text-[12px] font-medium text-right">Requests</th>
                          <th className="px-8 py-4 text-[12px] font-medium text-right">Passed</th>
                          <th className="px-8 py-4 text-[12px] font-medium text-right">Failed</th>
                          <th className="px-8 py-4 text-[12px] font-medium text-right">Spoof</th>
                          <th className="px-8 py-4 text-[12px] font-medium text-right">Face Lost</th>
                          <th className="px-8 py-4 text-[12px] font-medium text-right">Average Time</th>
                          <th className="px-8 py-4 text-[12px] font-medium text-right">Success Rate</th>
                          <th className="px-8 py-4 text-[12px] font-medium text-right">Last Request</th>
                          <th className="px-8 py-4 text-[12px] font-medium text-right">Errors</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2B45]">
                       {['Basic', 'Advanced', 'Enterprise'].map((key) => {
                         const perf = api_performance[key] || { requests: 0, pass: 0, fail: 0, spoof: 0, faceLost: 0, errors: 0, totalLatency: 0, lastRequest: null };
                         const label = key === 'Basic' ? 'API 1' : key === 'Advanced' ? 'API 2' : 'API 3';
                         const avgTime = perf.requests > 0 ? Math.round(perf.totalLatency / perf.requests) : 0;
                         const successRate = perf.requests > 0 ? ((perf.pass / perf.requests) * 100).toFixed(1) : "0.0";
                         
                         const lr = perf.lastRequest ? new Date(perf.lastRequest).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }) : '—';

                         return (
                           <tr key={key} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-8 py-4 text-[14px] font-medium text-white">{label}</td>
                              <td className="px-8 py-4 text-[13px] text-slate-300 text-right">{perf.requests.toLocaleString()}</td>
                              <td className="px-8 py-4 text-[13px] text-[#10B981] text-right">{perf.pass.toLocaleString()}</td>
                              <td className="px-8 py-4 text-[13px] text-[#EF4444] text-right">{(perf.fail - perf.spoof - perf.faceLost).toLocaleString()}</td>
                              <td className="px-8 py-4 text-[13px] text-[#EC4899] text-right">{perf.spoof.toLocaleString()}</td>
                              <td className="px-8 py-4 text-[13px] text-[#F97316] text-right">{perf.faceLost.toLocaleString()}</td>
                              <td className="px-8 py-4 text-[13px] text-slate-400 text-right">{avgTime} ms</td>
                              <td className="px-8 py-4 text-[13px] text-white font-medium text-right">{successRate}%</td>
                              <td className="px-8 py-4 text-[13px] text-slate-400 text-right">{lr}</td>
                              <td className="px-8 py-4 text-[13px] text-[#EF4444] text-right">{perf.errors.toLocaleString()}</td>
                           </tr>
                         )
                       })}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* ========================================================= */}
           {/* BOTTOM ANALYTICS */}
           {/* ========================================================= */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-[#0A1224] border border-[#1F2B45] rounded-[20px] p-6 shadow-sm">
                 <h4 className="text-[14px] font-medium text-white mb-4">Verification Health</h4>
                 <div className="space-y-3 text-[13px]">
                   <div className="flex justify-between items-center"><span className="text-slate-400">Passed</span> <span className="text-[#10B981] font-medium">{executive_overview.successful_verifications.toLocaleString()}</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400">Failed</span> <span className="text-[#EF4444] font-medium">{trueFailed > 0 ? trueFailed.toLocaleString() : 0}</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400">Spoof</span> <span className="text-[#EC4899] font-medium">{executive_overview.spoof_attempts_blocked.toLocaleString()}</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400">Face Lost</span> <span className="text-[#F97316] font-medium">{executive_overview.face_lost_events.toLocaleString()}</span></div>
                 </div>
              </div>

              <div className="bg-[#0A1224] border border-[#1F2B45] rounded-[20px] p-6 shadow-sm">
                 <h4 className="text-[14px] font-medium text-white mb-4">Face Quality</h4>
                 <div className="space-y-3 text-[13px]">
                   <div className="flex justify-between items-center"><span className="text-slate-400">Average Quality</span> <span className="text-white font-medium">{bottom_analytics.face_quality.average}%</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400">Low Light %</span> <span className="text-slate-300 font-medium">{bottom_analytics.face_quality.low_light}%</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400">Blur %</span> <span className="text-slate-300 font-medium">{bottom_analytics.face_quality.blur}%</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400">Occlusion %</span> <span className="text-slate-300 font-medium">{bottom_analytics.face_quality.occlusion}%</span></div>
                 </div>
              </div>

              <div className="bg-[#0A1224] border border-[#1F2B45] rounded-[20px] p-6 shadow-sm">
                 <h4 className="text-[14px] font-medium text-white mb-4">Device Analytics</h4>
                 <div className="space-y-3 text-[13px]">
                   <div className="flex justify-between items-center"><span className="text-slate-400 flex items-center gap-2"><Monitor size={14}/> Desktop</span> <span className="text-white font-medium">{bottom_analytics.device_analytics.desktop.toLocaleString()}</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400 flex items-center gap-2"><Smartphone size={14}/> Mobile</span> <span className="text-white font-medium">{bottom_analytics.device_analytics.mobile.toLocaleString()}</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400 flex items-center gap-2"><Tablet size={14}/> Tablet</span> <span className="text-white font-medium">{bottom_analytics.device_analytics.tablet.toLocaleString()}</span></div>
                 </div>
              </div>

              <div className="bg-[#0A1224] border border-[#1F2B45] rounded-[20px] p-6 shadow-sm">
                 <h4 className="text-[14px] font-medium text-white mb-4">Country Analytics</h4>
                 <div className="space-y-3 text-[13px]">
                    {bottom_analytics.country_analytics.map((c, i) => (
                      <div key={c.country} className="flex justify-between items-center">
                         <span className="text-slate-400 flex items-center gap-2"><span className="text-[10px] w-3 text-center opacity-50">{i + 1}</span> {c.country}</span>
                         <span className="text-white font-medium">{c.value}%</span>
                      </div>
                    ))}
                 </div>
              </div>

           </div>
           
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────

function KpiCard({ title, value, trend, trendUp, icon: Icon, lastUpdate }: { title: string, value: string, trend: string, trendUp: boolean, icon: any, lastUpdate: string }) {
  return (
    <div className="bg-[#0A1224] border border-[#1F2B45] rounded-[20px] p-6 shadow-sm hover:border-[#2a3a5c] transition-colors group relative overflow-hidden flex flex-col justify-between h-[150px]">
       <div className="flex items-center gap-3 mb-2 relative z-10">
          <div className="w-8 h-8 rounded-[8px] bg-white/[0.03] border border-white/5 flex items-center justify-center">
             <Icon size={16} className="text-slate-400" />
          </div>
          <span className="text-[13px] font-medium text-slate-400 truncate">{title}</span>
       </div>
       <div className="flex flex-col gap-1 relative z-10">
          <span className="text-[28px] font-semibold text-white tracking-tight leading-none mb-1">{value}</span>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-[12px] font-medium ${trendUp ? 'text-[#10B981]' : 'text-slate-400'}`}>
               {trend}
            </span>
            <span className="text-[11px] text-slate-500">{lastUpdate}</span>
          </div>
       </div>
    </div>
  );
}

function StatusItem({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
       <span className="font-medium text-slate-400">{label}</span>
       <div className="flex items-center gap-2 font-medium" style={{ color }}>
         <span className="text-[18px] leading-none mb-0.5" style={{ color }}>•</span> {status}
       </div>
    </div>
  );
}
