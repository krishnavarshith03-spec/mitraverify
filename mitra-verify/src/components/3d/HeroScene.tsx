'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

function phaseColor(phase: ScanPhase): THREE.Color {
  return hexToRgb(PHASE_COLORS[phase]);
}

// ─── Facial Landmark Mesh ───────────────────────────────────────────────────
function FaceLandmarks({ phase, isMobile }: { phase: ScanPhase; isMobile: boolean }) {
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

    // Generate face-oval shaped point cloud
    for (let i = 0; i < COUNT; i++) {
      const t = (i / COUNT) * Math.PI * 2;
      const layer = Math.floor(i / 30); // 0-15 vertical layers
      const yNorm = (layer / 16) * 2 - 1; // -1 to 1
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
      siz[i] = 1.0;
    }
    
    // Add distinct eye tracking points
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

    // Nose tip
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
    currentColor.current.lerp(targetColor, delta * 2);
    const mat = meshRef.current.material as THREE.PointsMaterial;
    mat.color.copy(currentColor.current);
    
    // In search phase, scramble points slightly to mimic 'searching'
    if (phase === 'searching') {
        meshRef.current.rotation.y += delta * 0.5;
        mat.opacity = 0.2;
    } else {
        meshRef.current.rotation.y += delta * 0.08;
        mat.opacity = 0.9;
    }
  });

  return (
    <group>
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Dynamic connecting lines for mesh look when detected */}
      {phase !== 'searching' && (
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial 
            color={PHASE_COLORS[phase]} 
            wireframe 
            transparent 
            opacity={0.05} 
            depthWrite={false} 
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Holographic Overlay (HTML) ─────────────────────────────────────────────
function HolographicUI({ phase }: { phase: ScanPhase }) {
  if (phase === 'searching') return null;

  const getAccuracy = () => {
    switch(phase) {
      case 'detected': return 'Calculating...';
      case 'landmarks': return 'Extracting 478 pts';
      case 'liveness': return 'Analyzing Depth';
      case 'identity': return 'Matching...';
      case 'granted': return '99.98% Match';
      default: return '';
    }
  };

  return (
    <Html position={[0.7, 0.5, 0.5]} center className="pointer-events-none">
      <div className="flex flex-col gap-1.5 p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] whitespace-nowrap min-w-[140px] transform transition-all duration-300">
        <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1">
          <span className="text-[9px] font-mono tracking-widest text-slate-400">TARGET: USR_89A</span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PHASE_COLORS[phase], boxShadow: `0 0 5px \${PHASE_COLORS[phase]}` }} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-slate-500">PITCH</span>
          <span className="text-[10px] font-mono font-medium text-white">-4.2°</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-slate-500">YAW</span>
          <span className="text-[10px] font-mono font-medium text-white">+1.8°</span>
        </div>
        <div className="flex justify-between items-center pt-1 mt-1 border-t border-white/10">
          <span className="text-[10px] font-mono font-bold" style={{ color: PHASE_COLORS[phase] }}>{getAccuracy()}</span>
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
    const scale = 1 + Math.sin(t * 3) * 0.08;
    meshRef.current.scale.setScalar(scale);
    if (matRef.current) {
      matRef.current.opacity = 0.18 + Math.sin(t * 3) * 0.08;
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
        opacity={0.22}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Animated Scan Ring ───────────────────────────────────────────────────────
function ScanRing({ phase }: { phase: ScanPhase }) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const targetColor = useMemo(() => phaseColor(phase), [phase]);
  const currentColor = useRef(new THREE.Color(PHASE_COLORS['searching']));

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    currentColor.current.lerp(targetColor, delta * 2);
    groupRef.current.rotation.y += delta * 0.9;
    groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.3;
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(currentColor.current);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer scan ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.015, 16, 100]} />
        <meshBasicMaterial color={PHASE_COLORS[phase]} transparent opacity={0.8} />
      </mesh>
      {/* Inner secondary ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.004, 8, 60]} />
        <meshBasicMaterial color={PHASE_COLORS[phase]} transparent opacity={0.4} />
      </mesh>
      {/* Scan line beam */}
      <Trail
        width={0.08}
        length={8}
        color={new THREE.Color(PHASE_COLORS[phase])}
        attenuation={(t) => t * t}
      >
        <mesh position={[1.35, 0, 0]}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color={PHASE_COLORS[phase]} />
        </mesh>
      </Trail>
    </group>
  );
}

// ─── Volumetric Light Cone ────────────────────────────────────────────────────
function VolumetricLight({ phase }: { phase: ScanPhase }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const targetColor = useMemo(() => phaseColor(phase), [phase]);
  const currentColor = useRef(new THREE.Color(PHASE_COLORS['searching']));

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    currentColor.current.lerp(targetColor, delta * 1.5);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.color.copy(currentColor.current);
    const pulse = 0.08 + Math.sin(clock.getElapsedTime() * 1.5) * 0.02;
    mat.opacity = pulse;
  });

  return (
    <mesh ref={meshRef} position={[0, 4.5, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[1.4, 4.5, 32, 1, true]} />
      <meshBasicMaterial
        color={PHASE_COLORS[phase]}
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Corner Brackets ─────────────────────────────────────────────────────────
function CornerBrackets({ phase }: { phase: ScanPhase }) {
  const groupRef = useRef<THREE.Group>(null!);
  const targetColor = useMemo(() => phaseColor(phase), [phase]);
  const currentColor = useRef(new THREE.Color(PHASE_COLORS['searching']));

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    currentColor.current.lerp(targetColor, delta * 2);
    const s = 1 + Math.sin(clock.getElapsedTime() * 1.2) * 0.015;
    groupRef.current.scale.setScalar(s);
  });

  const corners = [
    [1.1, 1.45],
    [-1.1, 1.45],
    [1.1, -1.45],
    [-1.1, -1.45],
  ] as [number, number][];

  return (
    <group ref={groupRef}>
      {corners.map(([x, y], i) => (
        <group key={i} position={[x, y, 0.3]}>
          <mesh position={[x > 0 ? -0.08 : 0.08, 0, 0]}>
            <boxGeometry args={[0.22, 0.015, 0.015]} />
            <meshBasicMaterial color={PHASE_COLORS[phase]} />
          </mesh>
          <mesh position={[0, y > 0 ? -0.08 : 0.08, 0]}>
            <boxGeometry args={[0.015, 0.22, 0.015]} />
            <meshBasicMaterial color={PHASE_COLORS[phase]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Floating Ambient Particles ───────────────────────────────────────────────
function AmbientParticles({ isMobile }: { isMobile: boolean }) {
  const COUNT = isMobile ? 80 : 300;
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
      pos[i * 3] = (lcg() - 0.5) * 14;
      pos[i * 3 + 1] = (lcg() - 0.5) * 10;
      pos[i * 3 + 2] = (lcg() - 0.5) * 8 - 2;
      sp[i] = 0.1 + lcg() * 0.3;
    }
    return { positions: pos, speeds: sp };
  }, [COUNT]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      posAttr.array[i * 3 + 1] += speeds[i] * 0.003;
      if ((posAttr.array as Float32Array)[i * 3 + 1] > 5.5) {
        (posAttr.array as Float32Array)[i * 3 + 1] = -5.5;
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
        size={0.025}
        color="#00d4ff"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
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
        console.warn(`[HeroScene] Performance dropped below 45 FPS (${currentFps.toFixed(1)}). Disabling expensive Three.js bloom post-processing.`);
      }
    }
  });

  const isLowPerf = isMobile || lowPerformance;

  return (
    <>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 2.8}
      />

      <Stars radius={60} depth={40} count={2000} factor={2} saturation={0} fade speed={0.5} />

      <ambientLight intensity={0.15} />
      <pointLight position={[0, 4, 2]} intensity={1.5} color={PHASE_COLORS[phase]} />
      <pointLight position={[-3, 0, 2]} intensity={0.6} color="#3b82f6" />
      <pointLight position={[3, 0, 2]} intensity={0.6} color="#8b5cf6" />

      <VolumetricLight phase={phase} />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
        <group>
          <FaceLandmarks phase={phase} isMobile={isLowPerf} />
          <HolographicUI phase={phase} />
          <GrantedPulse visible={phase === 'granted'} />
          <ScanRing phase={phase} />
          <CornerBrackets phase={phase} />
        </group>
      </Float>

      <AmbientParticles isMobile={isLowPerf} />

      {!isLowPerf && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={2.5}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.0015, 0.0015)}
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
    <div className="flex items-center gap-2 font-mono text-sm tracking-widest uppercase select-none p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <span
        className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
        style={{ backgroundColor: color, boxShadow: `0 0 10px \${color}` }}
      />
      <span style={{ color }} className="font-bold">{label}</span>
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
