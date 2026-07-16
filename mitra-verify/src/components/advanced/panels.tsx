'use client';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Eye, CheckCircle, Clock, Target } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────

function PanelHeader({ title, icon, accent = '#00d4ff' }: { title: string; icon: React.ReactNode; accent?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ color: accent, display: 'flex', alignItems: 'center' }}>{icon}</div>
      <span style={{ fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{title}</span>
    </div>
  );
}

function MiniMetric({ label, value, suffix = '', color = '#00d4ff' }: { label: string; value: string | number; suffix?: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
      <span style={{ fontSize: 11, color, fontWeight: 700, fontFamily: 'monospace' }}>{typeof value === 'number' ? value.toFixed(2) : value}{suffix}</span>
    </div>
  );
}

function MetricBarAdv({ label, value, max = 100, suffix = '%' }: { label: string; value: number; max?: number; suffix?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = pct >= 80 ? '#00ff88' : pct >= 50 ? '#ffb800' : '#ff3366';
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10, color: barColor, fontWeight: 700, fontFamily: 'monospace' }}>{Number(value || 0).toFixed(1)}{suffix}</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${barColor}88, ${barColor})` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. LIVE METRICS PANEL
// ─────────────────────────────────────────────────────────────

export function AdvLiveMetrics({ fps, latencyMs, processingMs, detectionMs, frameCount }: {
  fps: number; latencyMs: number; processingMs: number; detectionMs: number; frameCount: number;
}) {
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Live Metrics" icon={<Activity size={12} />} accent="#00d4ff" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
        <MiniMetric label="FPS" value={fps} color="#00ff88" />
        <MiniMetric label="Latency" value={`${latencyMs.toFixed(0)}`} suffix="ms" color="#00d4ff" />
        <MiniMetric label="Processing" value={`${processingMs.toFixed(0)}`} suffix="ms" color="#00d4ff" />
        <MiniMetric label="Detection" value={`${detectionMs.toFixed(0)}`} suffix="ms" color="#7c3aed" />
        <MiniMetric label="Frames" value={frameCount} color="#94a3b8" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. FACE ANALYSIS PANEL
// ─────────────────────────────────────────────────────────────

export function AdvFaceAnalysis({ faceSize, brightness, contrast, blur, yaw, pitch, roll }: {
  faceSize: number; brightness: number; contrast: number; blur: number; yaw: number; pitch: number; roll: number;
}) {
  const yawLabel = yaw < -10 ? '← LEFT' : yaw > 10 ? 'RIGHT →' : '● CENTER';
  const pitchLabel = pitch < -8 ? '↓ DOWN' : pitch > 8 ? '↑ UP' : '● LEVEL';
  
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Face Analysis" icon={<Eye size={12} />} accent="#7c3aed" />
      <MetricBarAdv label="Face Size" value={faceSize * 100} />
      <MetricBarAdv label="Brightness" value={brightness * 100} />
      <MetricBarAdv label="Contrast" value={contrast * 100} />
      <MetricBarAdv label="Sharpness" value={(1 - blur) * 100} />
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: Math.abs(yaw) > 20 ? '#ff3366' : '#00d4ff', fontFamily: 'monospace' }}>{yaw.toFixed(1)}°</div>
          <div style={{ fontSize: 7, color: '#64748b', fontWeight: 600 }}>YAW</div>
          <div style={{ fontSize: 7, color: Math.abs(yaw) > 20 ? '#ff3366' : '#00ff88' }}>{yawLabel}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: Math.abs(pitch) > 15 ? '#ff3366' : '#00d4ff', fontFamily: 'monospace' }}>{pitch.toFixed(1)}°</div>
          <div style={{ fontSize: 7, color: '#64748b', fontWeight: 600 }}>PITCH</div>
          <div style={{ fontSize: 7, color: Math.abs(pitch) > 15 ? '#ff3366' : '#00ff88' }}>{pitchLabel}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#00d4ff', fontFamily: 'monospace' }}>{roll.toFixed(1)}°</div>
          <div style={{ fontSize: 7, color: '#64748b', fontWeight: 600 }}>ROLL</div>
          <div style={{ fontSize: 7, color: '#00d4ff' }}>{Math.abs(roll) > 10 ? 'TILTED' : 'LEVEL'}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. LIVENESS ANALYSIS PANEL
// ─────────────────────────────────────────────────────────────

export function AdvLivenessAnalysis({ blinkScore, smileScore, mouthScore, headMotion, faceStability, challengeAccuracy, overallLiveness }: {
  blinkScore: number; smileScore: number; mouthScore: number; headMotion: number; faceStability: number; challengeAccuracy: number; overallLiveness: number;
}) {
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Liveness Analysis" icon={<Shield size={12} />} accent="#00ff88" />
      <MetricBarAdv label="Blink Score" value={blinkScore * 100} />
      <MetricBarAdv label="Smile Score" value={smileScore * 100} />
      <MetricBarAdv label="Mouth Movement" value={mouthScore * 100} />
      <MetricBarAdv label="Head Motion" value={headMotion * 100} />
      <MetricBarAdv label="Face Stability" value={faceStability * 100} />
      <MetricBarAdv label="Challenge Accuracy" value={challengeAccuracy * 100} />
      <div style={{ marginTop: 6, padding: '5px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>OVERALL LIVENESS</span>
        <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'monospace', color: overallLiveness > 0.7 ? '#00ff88' : overallLiveness > 0.4 ? '#ffb800' : '#ff3366' }}>
          {(overallLiveness * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. SECURITY CHECKLIST
// ─────────────────────────────────────────────────────────────

interface ChecklistItem {
  label: string;
  passed: boolean;
  icon: string;
}

export function AdvSecurityChecklist({ items }: { items: ChecklistItem[] }) {
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Security Checks" icon={<CheckCircle size={12} />} accent="#00d4ff" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item) => (
          <motion.div 
            key={item.label}
            initial={false}
            animate={{ opacity: 1 }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, 
              padding: '5px 8px', borderRadius: 6,
              background: item.passed ? 'rgba(0,255,136,0.04)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${item.passed ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)'}`,
            }}
          >
            <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: 10, color: item.passed ? '#e2e8f0' : '#64748b', fontWeight: 600 }}>{item.label}</span>
            <motion.div
              animate={item.passed ? { scale: [0.5, 1.2, 1], opacity: 1 } : { scale: 1, opacity: 0.3 }}
              transition={{ duration: 0.3 }}
            >
              {item.passed ? (
                <CheckCircle size={14} color="#00ff88" />
              ) : (
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #334155' }} />
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. CHALLENGE PANEL
// ─────────────────────────────────────────────────────────────

export function AdvChallengePanel({ current, completed, total, avgTime, successRate }: {
  current: string; completed: number; total: number; avgTime: number; successRate: number;
}) {
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Challenge Progress" icon={<Target size={12} />} accent="#ffb800" />
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Current Challenge</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#ffb800' }}>{current || 'Waiting...'}</div>
      </div>
      
      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 10 }}>
        <motion.div 
          animate={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          transition={{ duration: 0.5 }}
          style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #ffb80088, #ffb800)' }}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
        <MiniMetric label="Completed" value={`${completed}/${total}`} color="#ffb800" />
        <MiniMetric label="Remaining" value={Math.max(0, total - completed)} color="#94a3b8" />
        <MiniMetric label="Avg Time" value={`${avgTime.toFixed(1)}`} suffix="s" color="#00d4ff" />
        <MiniMetric label="Success" value={`${(successRate * 100).toFixed(0)}`} suffix="%" color={successRate > 0.8 ? '#00ff88' : '#ffb800'} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. CIRCULAR GAUGE
// ─────────────────────────────────────────────────────────────

export function CircularGauge({ value, label, size = 80, color = '#00d4ff' }: {
  value: number; label: string; size?: number; color?: string;
}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const gaugeColor = progress >= 80 ? '#00ff88' : progress >= 50 ? '#ffb800' : '#ff3366';
  const finalColor = color === '#00d4ff' ? gaugeColor : color;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
          {/* Progress arc */}
          <motion.circle
            cx={size/2} cy={size/2} r={radius} fill="none" 
            stroke={finalColor} strokeWidth={4} strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            transform={`rotate(-90 ${size/2} ${size/2})`}
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: finalColor, fontFamily: 'monospace', lineHeight: 1 }}>{progress.toFixed(0)}</div>
          <div style={{ fontSize: 7, color: '#64748b', fontWeight: 600 }}>%</div>
        </div>
      </div>
      <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export function GaugeRow({ gauges }: { gauges: { value: number; label: string }[] }) {
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Confidence Gauges" icon={<Zap size={12} />} accent="#00d4ff" />
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 }}>
        {gauges.map(g => (
          <CircularGauge key={g.label} value={g.value} label={g.label} size={72} />
        ))}
      </div>
    </div>
  );
}
