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
    currentColor.current.lerp(targetColor, delta * 2);
    const mat = meshRef.current.material as THREE.PointsMaterial;
    mat.color.copy(currentColor.current);
    
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
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Increased wireframe sphere size by 30% to wrap the face better */}
      {phase !== 'searching' && (
        <mesh>
          <sphereGeometry args={[1.3, 24, 24]} />
          <meshBasicMaterial 
            color={PHASE_COLORS[phase]} 
            wireframe 
            transparent 
            opacity={0.08} 
            depthWrite={false} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Holographic Overlay HUDs ───────────────────────────────────────────────
function HolographicHUDs({ phase }: { phase: ScanPhase }) {
  if (phase === 'searching') return null;

  return (
    <>
      {/* Top Left: 478 Landmarks & Status */}
      <Html position={[-1.8, 1.2, 0]} center className="pointer-events-none">
        <div className="flex flex-col gap-1 p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] min-w-[140px] transform transition-all duration-300">
          <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1">
            <span className="text-[9px] font-mono tracking-widest text-slate-400">STATUS</span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: PHASE_COLORS[phase], boxShadow: `0 0 5px ${PHASE_COLORS[phase]}` }} />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-white">
            <span className="text-slate-500">DETECTED</span>
            <span className="text-[#00d4ff] font-bold">YES</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-white mt-0.5">
            <span className="text-slate-500">LANDMARKS</span>
            <span className="text-[#00d4ff] font-bold">478 PTS</span>
          </div>
        </div>
      </Html>

      {/* Top Right: Telemetry */}
      <Html position={[1.8, 1.0, 0]} center className="pointer-events-none">
        <div className="flex flex-col gap-1 p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] min-w-[130px] transform transition-all duration-300">
          <div className="text-[9px] font-mono tracking-widest text-slate-400 border-b border-white/10 pb-1 mb-1">
            TELEMETRY
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-500">PITCH</span>
            <span className="font-medium text-white">-4.2°</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono mt-0.5">
            <span className="text-slate-500">YAW</span>
            <span className="font-medium text-white">+1.8°</span>
          </div>
        </div>
      </Html>

      {/* Bottom Right: Match / Liveness */}
      <Html position={[1.8, -1.0, 0]} center className="pointer-events-none">
        <div className="flex flex-col gap-1 p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] min-w-[150px] transform transition-all duration-300">
          <div className="text-[9px] font-mono tracking-widest text-slate-400 border-b border-white/10 pb-1 mb-1">
            SECURITY CHECKS
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-500">LIVENESS</span>
            <span className={`font-bold ${phase === 'liveness' || phase === 'identity' || phase === 'granted' ? 'text-[#10b981]' : 'text-slate-400'}`}>
              {phase === 'liveness' || phase === 'identity' || phase === 'granted' ? 'PASS' : 'PENDING'}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono mt-0.5">
            <span className="text-slate-500">CONFIDENCE</span>
            <span className={`font-bold ${phase === 'granted' ? 'text-[#00d4ff]' : 'text-slate-400'}`}>
              {phase === 'granted' ? '99.98%' : '---'}
            </span>
          </div>
        </div>
      </Html>
    </>
  );
}

// ─── Pulsing Granted Sphere ───────────────────────────────────────────────────
function GrantedPulse({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(({ clock }) => {
    if (!meshRef.current || !visible) return;
    const t = clock.getElapsedTime();
    const scale = 1.3 + Math.sin(t * 3) * 0.08;
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

// ─── Animated Scan Ring & Sweep ────────────────────────────────────────────────
function ScanSystem({ phase }: { phase: ScanPhase }) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const sweepRef = useRef<THREE.Mesh>(null!);
  const targetColor = useMemo(() => phaseColor(phase), [phase]);
  const currentColor = useRef(new THREE.Color(PHASE_COLORS['searching']));

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    
    currentColor.current.lerp(targetColor, delta * 2);
    groupRef.current.rotation.y += delta * 0.9;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.3;
    
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(currentColor.current);
    }

    if (sweepRef.current) {
      // Subtle sweep animation moving up and down the face
      sweepRef.current.position.y = Math.sin(t * 1.5) * 1.3;
      const mat = sweepRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(currentColor.current);
    }
  });

  return (
    <group>
      {/* Outer Orbit Rings */}
      <group ref={groupRef}>
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.7, 0.015, 16, 100]} />
          <meshBasicMaterial color={PHASE_COLORS[phase]} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.4, 0.005, 8, 60]} />
          <meshBasicMaterial color={PHASE_COLORS[phase]} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
        </mesh>
        <Trail width={0.1} length={12} color={new THREE.Color(PHASE_COLORS[phase])} attenuation={(t) => t * t}>
          <mesh position={[1.7, 0, 0]}>
            <sphereGeometry args={[0.04]} />
            <meshBasicMaterial color={PHASE_COLORS[phase]} />
          </mesh>
        </Trail>
      </group>

      {/* Subtle Horizontal Scanning Sweep */}
      <mesh ref={sweepRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial 
          color={PHASE_COLORS[phase]} 
          transparent 
          opacity={0.06} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(3, 3)]} />
          <lineBasicMaterial color={PHASE_COLORS[phase]} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </lineSegments>
      </mesh>
    </group>
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
    const s = 1.3 + Math.sin(clock.getElapsedTime() * 1.2) * 0.02; // Scaled up to 1.3
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
  const COUNT = isMobile ? 150 : 800; // Drastically increased particles
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
      sp[i] = 0.1 + lcg() * 0.4;
    }
    return { positions: pos, speeds: sp };
  }, [COUNT]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      posAttr.array[i * 3 + 1] += speeds[i] * 0.005;
      if ((posAttr.array as Float32Array)[i * 3 + 1] > 6) {
        (posAttr.array as Float32Array)[i * 3 + 1] = -6;
      }
      (posAttr.array as Float32Array)[i * 3] += Math.sin(t * speeds[i] + i) * 0.001;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00d4ff"
        transparent
        opacity={0.3}
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
    camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 1.5 - camera.position.y) * 0.05;
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
        console.warn(`[HeroScene] Performance dropped below 45 FPS (${currentFps.toFixed(1)}). Disabling expensive Three.js bloom post-processing.`);
      }
    }
  });

  const isLowPerf = isMobile || lowPerformance;

  return (
    <>
      <MouseParallax />

      {/* Kept autoRotate to slowly turn the entire scene */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 2.8}
      />

      <Stars radius={60} depth={40} count={3000} factor={3} saturation={0} fade speed={0.5} />

      <ambientLight intensity={0.2} />
      <pointLight position={[0, 4, 2]} intensity={2} color={PHASE_COLORS[phase]} />
      <pointLight position={[-3, 0, 2]} intensity={1} color="#3b82f6" />
      <pointLight position={[3, 0, 2]} intensity={1} color="#8b5cf6" />

      {/* Increased overall scale by 30% */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group scale={1.3}>
          <FaceLandmarks phase={phase} isMobile={isLowPerf} />
          <HolographicHUDs phase={phase} />
          <GrantedPulse visible={phase === 'granted'} />
          <ScanSystem phase={phase} />
          <CornerBrackets phase={phase} />
        </group>
      </Float>

      <AmbientParticles isMobile={isLowPerf} />

      {/* Enhanced Bloom Settings */}
      {!isLowPerf && (
        <EffectComposer multisampling={4}>
          <Bloom
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            intensity={3.5}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.002, 0.002)}
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
    <div className="flex items-center gap-2 font-mono text-sm tracking-widest uppercase select-none p-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <span
        className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
        style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
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
