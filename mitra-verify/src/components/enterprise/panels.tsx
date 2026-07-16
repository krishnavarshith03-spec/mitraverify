'use client';
import { motion } from 'framer-motion';
import { 
  Eye, Shield, Activity, Target, Radio, Cpu, Lock, 
  AlertTriangle, CheckCircle, XCircle, Clock, Zap,
  Scan, Brain, ShieldCheck, ShieldAlert
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// SHARED TYPES
// ─────────────────────────────────────────────────────────────

interface EyeTrackingData {
  left_direction: string;
  right_direction: string;
  horizontal_gaze: number;
  vertical_gaze: number;
  eye_openness_left: number;
  eye_openness_right: number;
  blink_probability: number;
}

interface FaceTrackingData {
  state: string;
  face_present: boolean;
  face_locked: boolean;
  tracking_stable: boolean;
  tracking_confidence: number;
  frame_quality: number;
  face_size: number;
  face_distance: number;
}

interface AntiSpoofData {
  texture_score: number;
  reflection_score: number;
  moire_score: number;
  motion_consistency: number;
  landmark_stability: number;
  face_warp: number;
  depth_consistency: number;
  overall_spoof_risk: number;
}

interface TelemetryData {
  detection_confidence: number;
  face_confidence: number;
  embedding_quality: number;
  embedding_dimension: number;
  inference_time_ms: number;
  frame_processing_time_ms: number;
  identity_matching_time_ms: number;
}

interface SecurityEvent {
  time: string;
  event: string;
  status: 'secure' | 'warning' | 'critical';
  icon?: string;
}

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────

function MiniMetric({ label, value, suffix = '', color = '#00d4ff' }: { label: string; value: string | number; suffix?: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
      <span style={{ fontSize: 11, color, fontWeight: 700, fontFamily: 'monospace' }}>{typeof value === 'number' ? value.toFixed(2) : value}{suffix}</span>
    </div>
  );
}

function StatusDot({ active, color = '#00ff88' }: { active: boolean; color?: string }) {
  return (
    <motion.div
      animate={active ? { opacity: [1, 0.4, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{
        width: 6, height: 6, borderRadius: '50%',
        background: active ? color : '#334155',
        boxShadow: active ? `0 0 6px ${color}` : 'none',
        flexShrink: 0,
      }}
    />
  );
}

function PanelHeader({ title, icon, accent = '#475569' }: { title: string; icon: React.ReactNode; accent?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ color: accent, display: 'flex', alignItems: 'center' }}>{icon}</div>
      <span style={{ fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{title}</span>
    </div>
  );
}

function MetricBar({ label, value, max = 100, suffix = '%' }: { label: string; value: number; max?: number; suffix?: string }) {
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
// 1. LIVE TELEMETRY PANEL
// ─────────────────────────────────────────────────────────────

export function TelemetryPanel({ telemetry, fps = 0 }: { telemetry: TelemetryData | null; fps?: number }) {
  const t = telemetry || { detection_confidence: 0, face_confidence: 0, embedding_quality: 0, embedding_dimension: 0, inference_time_ms: 0, frame_processing_time_ms: 0, identity_matching_time_ms: 0 };
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Live Telemetry" icon={<Cpu size={12} />} accent="#00d4ff" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
        <MiniMetric label="FPS" value={fps} color="#00ff88" />
        <MiniMetric label="Inference" value={`${t.inference_time_ms.toFixed(0)}`} suffix="ms" color="#00d4ff" />
        <MiniMetric label="Frame Proc" value={`${t.frame_processing_time_ms.toFixed(0)}`} suffix="ms" color="#00d4ff" />
        <MiniMetric label="ID Match" value={`${t.identity_matching_time_ms.toFixed(0)}`} suffix="ms" color="#00d4ff" />
        <MiniMetric label="Detect Conf" value={(t.detection_confidence * 100).toFixed(1)} suffix="%" color={t.detection_confidence > 0.8 ? '#00ff88' : '#ffb800'} />
        <MiniMetric label="Embed Dim" value={t.embedding_dimension} color="#7c3aed" />
        <MiniMetric label="Embed Quality" value={(t.embedding_quality * 100).toFixed(1)} suffix="%" color={t.embedding_quality > 0.7 ? '#00ff88' : '#ffb800'} />
        <MiniMetric label="Face Conf" value={(t.face_confidence * 100).toFixed(1)} suffix="%" color={t.face_confidence > 0.8 ? '#00ff88' : '#ffb800'} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. FACE TRACKING PANEL
// ─────────────────────────────────────────────────────────────

export function FaceTrackingPanel({ tracking }: { tracking: FaceTrackingData | null }) {
  const t = tracking || { state: 'LOST', face_present: false, face_locked: false, tracking_stable: false, tracking_confidence: 0, frame_quality: 0, face_size: 0, face_distance: 0 };
  const stateColor = t.state === 'TRACKING' ? '#00ff88' : t.state === 'ACQUIRING' ? '#ffb800' : '#ff3366';
  
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Face Tracking" icon={<Target size={12} />} accent={stateColor} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '6px 10px', borderRadius: 8, background: `${stateColor}0a`, border: `1px solid ${stateColor}22` }}>
        <StatusDot active={t.face_present} color={stateColor} />
        <span style={{ fontSize: 11, fontWeight: 700, color: stateColor, fontFamily: 'monospace' }}>{t.state}</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: '#64748b' }}>{t.face_locked ? '🔒 LOCKED' : '🔓 UNLOCKED'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
        <MiniMetric label="Confidence" value={(t.tracking_confidence * 100).toFixed(1)} suffix="%" color={stateColor} />
        <MiniMetric label="Quality" value={(t.frame_quality * 100).toFixed(1)} suffix="%" color={t.frame_quality > 0.6 ? '#00ff88' : '#ffb800'} />
        <MiniMetric label="Stable" value={t.tracking_stable ? 'YES' : 'NO'} color={t.tracking_stable ? '#00ff88' : '#ff3366'} />
        <MiniMetric label="Distance" value={t.face_distance.toFixed(1)} suffix="m" color="#00d4ff" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. EYE TRACKING PANEL
// ─────────────────────────────────────────────────────────────

export function EyeTrackingPanel({ eyeData }: { eyeData: EyeTrackingData | null }) {
  const e = eyeData || { left_direction: 'center', right_direction: 'center', horizontal_gaze: 0.5, vertical_gaze: 0.5, eye_openness_left: 0, eye_openness_right: 0, blink_probability: 0 };
  
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Eye Tracking" icon={<Eye size={12} />} accent="#7c3aed" />
      
      {/* Eye direction visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
        {/* Left Eye */}
        <div style={{ position: 'relative', width: 40, height: 24, borderRadius: 12, border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.05)', overflow: 'hidden' }}>
          <motion.div
            animate={{ left: `${e.horizontal_gaze * 100}%`, top: `${e.vertical_gaze * 100}%` }}
            transition={{ duration: 0.2 }}
            style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', transform: 'translate(-50%, -50%)' }}
          />
          <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 7, color: '#7c3aed', fontWeight: 600 }}>LEFT</div>
        </div>
        {/* Right Eye */}
        <div style={{ position: 'relative', width: 40, height: 24, borderRadius: 12, border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.05)', overflow: 'hidden' }}>
          <motion.div
            animate={{ left: `${e.horizontal_gaze * 100}%`, top: `${e.vertical_gaze * 100}%` }}
            transition={{ duration: 0.2 }}
            style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', transform: 'translate(-50%, -50%)' }}
          />
          <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 7, color: '#7c3aed', fontWeight: 600 }}>RIGHT</div>
        </div>
      </div>
      
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
        <MiniMetric label="H Gaze" value={(e.horizontal_gaze * 100).toFixed(0)} suffix="%" color="#7c3aed" />
        <MiniMetric label="V Gaze" value={(e.vertical_gaze * 100).toFixed(0)} suffix="%" color="#7c3aed" />
        <MiniMetric label="L Open" value={(e.eye_openness_left * 100).toFixed(0)} suffix="%" color="#00d4ff" />
        <MiniMetric label="R Open" value={(e.eye_openness_right * 100).toFixed(0)} suffix="%" color="#00d4ff" />
        <MiniMetric label="Blink" value={(e.blink_probability * 100).toFixed(0)} suffix="%" color={e.blink_probability > 0.5 ? '#ffb800' : '#00ff88'} />
        <MiniMetric label="Direction" value={e.left_direction.toUpperCase()} color="#7c3aed" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. IDENTITY PANEL (Identity Match + Cosine Similarity)
// ─────────────────────────────────────────────────────────────

export function IdentityPanel({ 
  similarity, identityMatch, embeddingQuality, lastVerifiedTime, status, verificationCount, unauthorizedAttempts 
}: { 
  similarity: number; identityMatch: number; embeddingQuality: number; 
  lastVerifiedTime: number | null; status: string; verificationCount: number; unauthorizedAttempts: number;
}) {
  const matchColor = identityMatch >= 80 ? '#00ff88' : identityMatch >= 60 ? '#ffb800' : '#ff3366';
  const statusLabel = status === 'VERIFIED' ? '✓ VERIFIED' : status === 'UNCERTAIN' ? '⚠ UNCERTAIN' : status === 'UNAUTHORIZED' ? '✗ UNAUTHORIZED' : '○ PENDING';
  
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14, border: `1px solid ${matchColor}22` }}>
      <PanelHeader title="Identity Verification" icon={<Shield size={12} />} accent={matchColor} />
      
      {/* Big identity score */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: matchColor, fontFamily: 'monospace', lineHeight: 1 }}>
          {identityMatch.toFixed(1)}%
        </div>
        <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Identity Match</div>
        <div style={{ marginTop: 6, display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: `${matchColor}15`, border: `1px solid ${matchColor}33`, fontSize: 10, fontWeight: 700, color: matchColor }}>{statusLabel}</div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
        <MiniMetric label="Cosine Sim" value={(similarity * 100).toFixed(2)} suffix="%" color={matchColor} />
        <MiniMetric label="Embed Qual" value={(embeddingQuality * 100).toFixed(0)} suffix="%" color="#00d4ff" />
        <MiniMetric label="Verifications" value={verificationCount} color="#00d4ff" />
        <MiniMetric label="Unauthorized" value={unauthorizedAttempts} color={unauthorizedAttempts > 0 ? '#ff3366' : '#00ff88'} />
      </div>
      
      {lastVerifiedTime && (
        <div style={{ marginTop: 6, fontSize: 9, color: '#475569', fontFamily: 'monospace', textAlign: 'center' }}>
          Last verified: {new Date(lastVerifiedTime).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. ANTI-SPOOF DETAILS PANEL
// ─────────────────────────────────────────────────────────────

export function AntiSpoofPanel({ details }: { details: AntiSpoofData | null }) {
  const d = details || { texture_score: 0, reflection_score: 0, moire_score: 0, motion_consistency: 0, landmark_stability: 0, face_warp: 0, depth_consistency: 0, overall_spoof_risk: 0 };
  
  const items = [
    { label: 'Texture', value: d.texture_score, icon: '🧱', inverted: false },
    { label: 'Reflection', value: d.reflection_score, icon: '💡', inverted: true },
    { label: 'Moiré', value: d.moire_score, icon: '📱', inverted: true },
    { label: 'Motion', value: d.motion_consistency, icon: '🏃', inverted: false },
    { label: 'Landmarks', value: d.landmark_stability, icon: '📐', inverted: false },
    { label: 'Face Warp', value: d.face_warp, icon: '🔄', inverted: true },
    { label: 'Depth', value: d.depth_consistency, icon: '📏', inverted: false },
  ];
  
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Anti-Spoof Analysis" icon={<Scan size={12} />} accent="#ff3366" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map(item => {
          const score = item.value * 100;
          const safe = item.inverted ? score < 20 : score > 70;
          return (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, width: 18, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, width: 60, textTransform: 'uppercase' }}>{item.label}</span>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', borderRadius: 2, background: safe ? '#00ff88' : '#ff3366', transition: 'width 0.3s ease' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: safe ? '#00ff88' : '#ff3366', width: 36, textAlign: 'right' }}>{score.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 8, padding: '5px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>OVERALL RISK</span>
        <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'monospace', color: d.overall_spoof_risk < 0.2 ? '#00ff88' : d.overall_spoof_risk < 0.4 ? '#ffb800' : '#ff3366' }}>
          {(d.overall_spoof_risk * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. SECURITY EVENTS LOG
// ─────────────────────────────────────────────────────────────

export function SecurityEventsLog({ events }: { events: SecurityEvent[] }) {
  const statusColors: Record<string, string> = { secure: '#00ff88', warning: '#ffb800', critical: '#ff3366' };
  
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Security Events" icon={<Activity size={12} />} accent="#00d4ff" />
      <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {events.length === 0 ? (
          <div style={{ fontSize: 10, color: '#475569', fontStyle: 'italic', textAlign: 'center', padding: 12 }}>Awaiting events...</div>
        ) : (
          events.map((evt, i) => (
            <motion.div 
              key={`${evt.time}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 6px', borderRadius: 4, fontSize: 9, fontFamily: 'monospace',
                background: `${statusColors[evt.status]}06`, 
                borderLeft: `2px solid ${statusColors[evt.status]}`,
              }}
            >
              <span style={{ color: '#64748b' }}>{evt.time}</span>
              <span style={{ color: statusColors[evt.status], fontWeight: 600, textAlign: 'right' }}>{evt.event}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. HEXAGONAL THREAT RADAR
// ─────────────────────────────────────────────────────────────

export function HexThreatRadar({ 
  spoofRisk, identityRisk, replayRisk, deepfakeRisk, photoRisk, sessionIntegrity 
}: { 
  spoofRisk: number; identityRisk: number; replayRisk: number; 
  deepfakeRisk: number; photoRisk: number; sessionIntegrity: number;
}) {
  const maxRisk = Math.max(spoofRisk, identityRisk, replayRisk, deepfakeRisk, photoRisk, 1 - sessionIntegrity);
  const overallColor = maxRisk < 0.2 ? '#00ff88' : maxRisk < 0.4 ? '#ffb800' : '#ff3366';
  
  // SVG hexagonal radar
  const cx = 60, cy = 60, r = 45;
  const angles = [0, 60, 120, 180, 240, 300].map(a => (a - 90) * Math.PI / 180);
  const values = [spoofRisk, identityRisk, replayRisk, deepfakeRisk, photoRisk, 1 - sessionIntegrity];
  const labels = ['Spoof', 'Identity', 'Replay', 'Deepfake', 'Photo', 'Session'];
  
  const gridPoints = (scale: number) => angles.map(a => `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`).join(' ');
  const dataPoints = angles.map((a, i) => `${cx + r * values[i] * Math.cos(a)},${cy + r * values[i] * Math.sin(a)}`).join(' ');
  
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Threat Radar" icon={<Radio size={12} />} accent={overallColor} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={120} height={120} viewBox="0 0 120 120">
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1.0].map(scale => (
            <polygon key={scale} points={gridPoints(scale)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
          ))}
          {/* Axis lines */}
          {angles.map((a, i) => (
            <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
          ))}
          {/* Data polygon */}
          <polygon points={dataPoints} fill={`${overallColor}22`} stroke={overallColor} strokeWidth={1.5} />
          {/* Data points */}
          {angles.map((a, i) => (
            <circle key={`dot-${i}`} cx={cx + r * values[i] * Math.cos(a)} cy={cy + r * values[i] * Math.sin(a)} r={2.5} fill={overallColor} />
          ))}
          {/* Labels */}
          {angles.map((a, i) => (
            <text key={`label-${i}`} x={cx + (r + 12) * Math.cos(a)} y={cy + (r + 12) * Math.sin(a)} 
              fill="#64748b" fontSize={6} textAnchor="middle" dominantBaseline="middle" fontWeight={600}>
              {labels[i]}
            </text>
          ))}
        </svg>
      </div>
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Max Risk: </span>
        <span style={{ fontSize: 11, color: overallColor, fontWeight: 800, fontFamily: 'monospace' }}>{(maxRisk * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. FACE QUALITY PANEL
// ─────────────────────────────────────────────────────────────

export function FaceQualityPanel({ 
  faceQuality, lighting, poseQuality, blur, confidence 
}: { 
  faceQuality: number; lighting: number; poseQuality: number; blur: number; confidence: number;
}) {
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Face Quality" icon={<Brain size={12} />} accent="#00d4ff" />
      <MetricBar label="Overall Quality" value={faceQuality * 100} />
      <MetricBar label="Lighting" value={lighting * 100} />
      <MetricBar label="Pose Quality" value={poseQuality * 100} />
      <MetricBar label="Sharpness" value={(1 - blur) * 100} />
      <MetricBar label="Confidence" value={confidence * 100} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. AUTHENTICATION TIMELINE
// ─────────────────────────────────────────────────────────────

export function AuthTimeline({ stages }: { stages: { label: string; complete: boolean; active: boolean; time?: string }[] }) {
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Authentication Timeline" icon={<Clock size={12} />} accent="#00d4ff" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {stages.map((stage, i) => {
          const color = stage.complete ? '#00ff88' : stage.active ? '#00d4ff' : '#334155';
          return (
            <div key={stage.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <motion.div
                  animate={stage.active ? { boxShadow: ['0 0 0px #00d4ff', '0 0 6px #00d4ff', '0 0 0px #00d4ff'] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: `2px solid ${color}`,
                    background: stage.complete ? '#00ff88' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {stage.complete && <CheckCircle size={7} color="#000" />}
                  {stage.active && !stage.complete && (
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ width: 4, height: 4, borderRadius: '50%', background: '#00d4ff' }} />
                  )}
                </motion.div>
                {i < stages.length - 1 && (
                  <div style={{ width: 2, height: 14, background: stage.complete ? '#00ff88' : 'rgba(255,255,255,0.06)' }} />
                )}
              </div>
              <div style={{ paddingBottom: i < stages.length - 1 ? 4 : 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: stage.complete ? '#e2e8f0' : stage.active ? '#00d4ff' : '#475569' }}>{stage.label}</div>
                {stage.time && <div style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace' }}>{stage.time}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. HEAD MOVEMENT INDICATOR  
// ─────────────────────────────────────────────────────────────

export function HeadMovementPanel({ yaw, pitch, roll }: { yaw: number; pitch: number; roll: number }) {
  const yawLabel = yaw < -10 ? 'LEFT' : yaw > 10 ? 'RIGHT' : 'CENTER';
  const pitchLabel = pitch < -8 ? 'DOWN' : pitch > 8 ? 'UP' : 'LEVEL';
  const yawColor = Math.abs(yaw) > 20 ? '#ff3366' : Math.abs(yaw) > 10 ? '#ffb800' : '#00ff88';
  const pitchColor = Math.abs(pitch) > 15 ? '#ff3366' : Math.abs(pitch) > 8 ? '#ffb800' : '#00ff88';
  
  return (
    <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
      <PanelHeader title="Head Orientation" icon={<Zap size={12} />} accent="#00d4ff" />
      
      {/* Compass-style indicator */}
      <div style={{ position: 'relative', width: 80, height: 80, margin: '4px auto 10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
        {/* Cross lines */}
        <div style={{ position: 'absolute', left: '50%', top: 4, bottom: 4, width: 1, background: 'rgba(255,255,255,0.06)', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 4, right: 4, height: 1, background: 'rgba(255,255,255,0.06)', transform: 'translateY(-50%)' }} />
        {/* Direction dot */}
        <motion.div
          animate={{
            left: `${50 + (yaw / 45) * 35}%`,
            top: `${50 - (pitch / 30) * 35}%`,
          }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            width: 10, height: 10, borderRadius: '50%',
            background: yawColor,
            boxShadow: `0 0 8px ${yawColor}`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Labels */}
        <span style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', fontSize: 6, color: '#475569' }}>UP</span>
        <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', fontSize: 6, color: '#475569' }}>DN</span>
        <span style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', fontSize: 6, color: '#475569' }}>L</span>
        <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', fontSize: 6, color: '#475569' }}>R</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: yawColor, fontFamily: 'monospace' }}>{yaw.toFixed(1)}°</div>
          <div style={{ fontSize: 8, color: '#64748b', fontWeight: 600 }}>YAW</div>
          <div style={{ fontSize: 7, color: yawColor }}>{yawLabel}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: pitchColor, fontFamily: 'monospace' }}>{pitch.toFixed(1)}°</div>
          <div style={{ fontSize: 8, color: '#64748b', fontWeight: 600 }}>PITCH</div>
          <div style={{ fontSize: 7, color: pitchColor }}>{pitchLabel}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#00d4ff', fontFamily: 'monospace' }}>{roll.toFixed(1)}°</div>
          <div style={{ fontSize: 8, color: '#64748b', fontWeight: 600 }}>ROLL</div>
          <div style={{ fontSize: 7, color: '#00d4ff' }}>{Math.abs(roll) > 10 ? 'TILTED' : 'LEVEL'}</div>
        </div>
      </div>
    </div>
  );
}
