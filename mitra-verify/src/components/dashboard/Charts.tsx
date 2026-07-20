'use client';
import { 
  AreaChart as RechartsAreaChart, Area, Tooltip, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Legend,
  LineChart as RechartsLineChart, Line
} from 'recharts';
import React from 'react';

const COLORS = {
  accent: '#00D4FF',
  success: '#10B981',
  failed: '#EF4444',
  warning: '#F59E0B',
  spoof: '#A855F7',
};

export const DashboardAreaChart = React.memo(({ timeline }: { timeline: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart data={timeline}>
        <defs>
          <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.15}/><stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/></linearGradient>
          <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.failed} stopOpacity={0.15}/><stop offset="95%" stopColor={COLORS.failed} stopOpacity={0}/></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} minTickGap={30} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} />
        <Tooltip 
           contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', fontSize: '13px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
           itemStyle={{ padding: '2px 0' }}
           animationDuration={200}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#94a3b8' }} />
        <Area type="monotone" dataKey="passed" name="Passed" stroke={COLORS.success} fill="url(#gSuccess)" strokeWidth={2} isAnimationActive={true} animationDuration={800} />
        <Area type="monotone" dataKey="failed" name="Failed" stroke={COLORS.failed} fill="url(#gFailed)" strokeWidth={2} isAnimationActive={true} animationDuration={800} />
        <Area type="monotone" dataKey="spoof" name="Spoof" stroke={COLORS.spoof} fill="transparent" strokeWidth={2} isAnimationActive={true} animationDuration={800} />
        <Area type="monotone" dataKey="face_lost" name="Face Lost" stroke={COLORS.warning} fill="transparent" strokeWidth={2} isAnimationActive={true} />
        <Area type="monotone" dataKey="multiple_faces" name="Multiple Faces" stroke={COLORS.accent} fill="transparent" strokeWidth={2} isAnimationActive={true} />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
});
DashboardAreaChart.displayName = 'DashboardAreaChart';

export const SparklineChart = React.memo(({ data, dataKey, color }: { data: any[], dataKey: string, color: string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={1000} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
});
SparklineChart.displayName = 'SparklineChart';

export const TinyLineChart = React.memo(({ data, color }: { data: any[], color: string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data}>
        <Line type="monotone" dataKey="passed" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
});
TinyLineChart.displayName = 'TinyLineChart';
