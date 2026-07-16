'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  Stars,
  OrbitControls,
  Trail,
  Html,
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { BlendFunction } from 'postprocessing';

// ─── Types ───────────────────────────────────────────────────────────────────
export type ScanPhase =
  | 'searching'
  | 'detected'
  | 'landmarks'
  | 'liveness'
  | 'identity'
  | 'granted';

const PHASE_ORDER: ScanPhase[] = [
  'searching',
  'detected',
  'landmarks',
  'liveness',
  'identity',
  'granted',
];

const PHASE_COLORS: Record<ScanPhase, string> = {
  searching: '#f59e0b',
  detected:  '#00d4ff',
  landmarks: '#00d4ff',
  liveness:  '#10b981',
  identity:  '#3b82f6',
  granted:   '#10b981',
};

const PHASE_LABELS: Record<ScanPhase, string> = {
  searching: 'SCANNING FOR SUBJECT',
  detected:  'FACE DETECTED',
  landmarks: 'MAPPING LANDMARKS',
  liveness:  'LIVENESS CHECK',
  identity:  'VERIFYING IDENTITY',
  granted:   'ACCESS GRANTED',
};

function phaseColor(phase: ScanPhase): THREE.Color {
  return new THREE.Color(PHASE_COLORS[phase]);
}

// ─── Facial Landmark Mesh ───────────────────────────────────────────────────
function FaceLandmarks({ phase }: { phase: ScanPhase }) {
  const meshRef = useRef<THREE.Points>(null!);
  const COUNT = 478;

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const siz = new Float32Array(COUNT);

    let seed = 12345;
    const lcg = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < COUNT; i++) {
      const t = (i / COUNT) * Math.PI * 2;
      const layer = Math.floor(i / 30);
      const yNorm = (layer / 16) * 2 - 1;
      const yPos = yNorm * 1.35;

      const faceMask = Math.sqrt(Math.max(0, 1 - yNorm * yNorm * 0.6));
      const xRadius = 0.85 * faceMask;
      const zRadius = 0.45 * faceMask;

      const angle = t + (lcg() - 0.5) * 0.4;
      const r = 0.7 + lcg() * 0.3;

      pos[i * 3 + 0] = Math.cos(angle) * xRadius * r + (lcg() - 0.5) * 0.05;
      pos[i * 3 + 1] = yPos + (lcg() - 0.5) * 0.1;
      pos[i * 3 + 2] = Math.sin(angle) * zRadius * r + (lcg() - 0.5) * 0.05;

      col[i * 3 + 0] = 1.0;
      col[i * 3 + 1] = 1.0;
      col[i * 3 + 2] = 1.0;
      siz[i] = 1.5;
    }
    
    const leftEyeIdx = 150;
    pos[leftEyeIdx * 3 + 0] = -0.3;
    pos[leftEyeIdx * 3 + 1] = 0.2;
    pos[leftEyeIdx * 3 + 2] = 0.45;
    siz[leftEyeIdx] = 4.0;
    
    const rightEyeIdx = 151;
    pos[rightEyeIdx * 3 + 0] = 0.3;
    pos[rightEyeIdx * 3 + 1] = 0.2;
    pos[rightEyeIdx * 3 + 2] = 0.45;
    siz[rightEyeIdx] = 4.0;

    const noseIdx = 152;
    pos[noseIdx * 3 + 0] = 0;
    pos[noseIdx * 3 + 1] = -0.1;
    pos[noseIdx * 3 + 2] = 0.55;
    siz[noseIdx] = 2.5;

    return { positions: pos, colors: col, sizes: siz };
  }, [COUNT]);

  const targetColor = useMemo(() => phaseColor(phase), [phase]);
  const currentColor = useRef(new THREE.Color(PHASE_COLORS['searching']));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    currentColor.current.lerp(targetColor, delta * 1.5); // Slower color transition
    const mat = meshRef.current.material as THREE.PointsMaterial;
    mat.color.copy(currentColor.current);
    
    if (phase === 'searching') {
        meshRef.current.rotation.y += delta * 0.25; // Slower rotation
        mat.opacity = 0.1;
    } else {
        meshRef.current.rotation.y += delta * 0.05; // Slower rotation
        mat.opacity = 0.8;
    }
  });

  return (
    <group>
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Clean minimal wireframe sphere wrapper */}
      {phase !== 'searching' && (
        <mesh>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial 
            color={PHASE_COLORS[phase]} 
            wireframe 
            transparent 
            opacity={0.05} 
            depthWrite={false} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Compact Holographic Overlay HUD ──────────────────────────────────────────
function HolographicHUD({ phase }: { phase: ScanPhase }) {
  if (phase === 'searching') return null;

  const getConfidence = () => {
    switch(phase) {
      case 'detected':
      case 'landmarks':
      case 'liveness': return 'PENDING';
      case 'identity': return 'MATCHING...';
      case 'granted': return '99.2%';
      default: return '---';
    }
  };

  const getLiveness = () => {
    switch(phase) {
      case 'liveness':
      case 'identity':
      case 'granted': return 'PASS';
      default: return 'PENDING';
    }
  };

  return (
    <Html position={[1.4, 0.5, 0]} center className="pointer-events-none">
      <div className="flex flex-col gap-1 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg min-w-[160px] transform transition-all duration-500">
        <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-1">
          <span className="text-[9px] font-mono tracking-widest text-slate-400">STATUS</span>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: PHASE_COLORS[phase], boxShadow: `0 0 5px ${PHASE_COLORS[phase]}` }} />
        </div>
        
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-400">LIVENESS</span>
          <span className={`font-medium ${getLiveness() === 'PASS' ? 'text-[#10b981]' : 'text-slate-400'}`}>
            {getLiveness()}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-[10px] font-mono mt-0.5">
          <span className="text-slate-400">LANDMARKS</span>
          <span className="font-medium text-white">478</span>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono mt-0.5">
          <span className="text-slate-400">CONFIDENCE</span>
          <span className={`font-medium ${phase === 'granted' ? 'text-[#00d4ff]' : 'text-slate-400'}`}>
            {getConfidence()}
          </span>
        </div>
      </div>
    </Html>
  );
}

// ─── Pulsing Granted Sphere ───────────────────────────────────────────────────
function GrantedPulse({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(({ clock }) => {
    if (!meshRef.current || !visible) return;
    const t = clock.getElapsedTime();
    const scale = 1.0 + Math.sin(t * 2) * 0.05; // Reduced scale pulse
    meshRef.current.scale.setScalar(scale);
    if (matRef.current) {
      matRef.current.opacity = 0.1 + Math.sin(t * 2) * 0.05; // Reduced opacity pulse
    }
  });

  if (!visible) return null;
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.05, 32, 32]} />
      <meshBasicMaterial
        ref={matRef}
        color="#10b981"
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Clean Animated Scan Ring ─────────────────────────────────────────────────
function ScanSystem({ phase }: { phase: ScanPhase }) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const targetColor = useMemo(() => phaseColor(phase), [phase]);
  const currentColor = useRef(new THREE.Color(PHASE_COLORS['searching']));

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    
    currentColor.current.lerp(targetColor, delta * 1.5);
    groupRef.current.rotation.y += delta * 0.4; // Slower rotation
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.2; // Slower wobble
    
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(currentColor.current);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        {/* Reduced thickness by ~40% */}
        <torusGeometry args={[1.3, 0.006, 16, 100]} />
        <meshBasicMaterial color={PHASE_COLORS[phase]} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.002, 8, 60]} />
        <meshBasicMaterial color={PHASE_COLORS[phase]} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Slower trail */}
      <Trail width={0.05} length={8} color={new THREE.Color(PHASE_COLORS[phase])} attenuation={(t) => t * t}>
        <mesh position={[1.3, 0, 0]}>
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial color={PHASE_COLORS[phase]} />
        </mesh>
      </Trail>
    </group>
  );
}

// ─── Minimal Ambient Particles ───────────────────────────────────────────────
function AmbientParticles({ isMobile }: { isMobile: boolean }) {
  const COUNT = isMobile ? 30 : 80; // Drastically reduced for clean look
  const meshRef = useRef<THREE.Points>(null!);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const sp = new Float32Array(COUNT);
    let seed = 54321;
    const lcg = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (lcg() - 0.5) * 16;
      pos[i * 3 + 1] = (lcg() - 0.5) * 12;
      pos[i * 3 + 2] = (lcg() - 0.5) * 10 - 2;
      sp[i] = 0.05 + lcg() * 0.2; // Slower speed
    }
    return { positions: pos, speeds: sp };
  }, [COUNT]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      posAttr.array[i * 3 + 1] += speeds[i] * 0.003; // Slower rise
      if ((posAttr.array as Float32Array)[i * 3 + 1] > 6) {
        (posAttr.array as Float32Array)[i * 3 + 1] = -6;
      }
      (posAttr.array as Float32Array)[i * 3] += Math.sin(t * speeds[i] + i) * 0.0005;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffffff" // Clean white particles instead of colored
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Mouse Parallax ───────────────────────────────────────────────────────────
function MouseParallax() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    // Smoother, subtler parallax
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 0.8 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Scene Root ───────────────────────────────────────────────────────────────
function Scene({ phase, isMobile }: { phase: ScanPhase; isMobile: boolean }) {
  const [lowPerformance, setLowPerformance] = useState(false);
  const frameTimes = useRef<number[]>([]);
  const lastFrameTime = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastFrameTime.current;
    lastFrameTime.current = now;

    frameTimes.current.push(delta);
    if (frameTimes.current.length > 60) {
      frameTimes.current.shift();
    }

    if (frameTimes.current.length === 60) {
      const avgDelta = frameTimes.current.reduce((a, b) => a + b, 0) / 60;
      const currentFps = 1000 / avgDelta;
      if (currentFps < 45 && !lowPerformance) {
        setLowPerformance(true);
        console.warn(`[HeroScene] Performance dropped below 45 FPS (${Number(currentFps || 0).toFixed(1)}). Disabling expensive Three.js bloom post-processing.`);
      }
    }
  });

  const isLowPerf = isMobile || lowPerformance;

  return (
    <>
      <MouseParallax />

      {/* Slower rotation for elegance */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 2.8}
      />

      <Stars radius={60} depth={40} count={1500} factor={2} saturation={0} fade speed={0.2} />

      <ambientLight intensity={0.1} />
      <pointLight position={[0, 4, 2]} intensity={1.2} color={PHASE_COLORS[phase]} />
      <pointLight position={[-3, 0, 2]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[3, 0, 2]} intensity={0.5} color="#8b5cf6" />

      {/* Scaled down to 0.9 (approx ~25-30% reduction from 1.3) */}
      <Float speed={1.0} rotationIntensity={0.1} floatIntensity={0.1}>
        <group scale={0.9}>
          <FaceLandmarks phase={phase} />
          <HolographicHUD phase={phase} />
          <GrantedPulse visible={phase === 'granted'} />
          <ScanSystem phase={phase} />
        </group>
      </Float>

      <AmbientParticles isMobile={isLowPerf} />

      {/* Subtler Bloom Settings */}
      {!isLowPerf && (
        <EffectComposer multisampling={4}>
          <Bloom
            luminanceThreshold={0.4}
            luminanceSmoothing={0.8}
            intensity={1.5}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.001, 0.001)}
            radialModulation={false}
            modulationOffset={0}
          />
        </EffectComposer>
      )}
    </>
  );
}

// ─── PhaseLabel Export ────────────────────────────────────────────────────────
export function PhaseLabel({ phase }: { phase: ScanPhase }) {
  const color = PHASE_COLORS[phase];
  const label = PHASE_LABELS[phase];

  return (
    <div className="flex items-center gap-2 font-mono text-sm tracking-widest uppercase select-none p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg transition-colors duration-500">
      <span
        className="inline-block w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
      />
      <span style={{ color }} className="font-semibold">{label}</span>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HeroScene({ phase: controlledPhase }: { phase?: ScanPhase }) {
  const [internalPhase, setInternalPhase] = useState<ScanPhase>('searching');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (controlledPhase) return;
    const timer = setInterval(() => {
      setPhaseIndex((prev) => {
        const next = (prev + 1) % PHASE_ORDER.length;
        setInternalPhase(PHASE_ORDER[next]);
        return next;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [controlledPhase]);

  const activePhase = controlledPhase || internalPhase;

  return (
    <div className="relative w-full h-full">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={isMobile ? 1 : [1, 2]}
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 200 }}
        style={{ background: 'transparent' }}
      >
        <Scene phase={activePhase} isMobile={isMobile} />
      </Canvas>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <PhaseLabel phase={activePhase} />
      </div>
    </div>
  );
}
