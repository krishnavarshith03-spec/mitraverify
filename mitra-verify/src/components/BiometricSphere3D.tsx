'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Points, PointMaterial, Ring, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Shield, Activity } from 'lucide-react';

// ─── HOLLOW NEURAL NETWORK CORE ─────────────────────────────────────────────
function HollowPlexusCore() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // High detail generates thousands of vertices
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2.6, 5), []);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry, 8), [geometry]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* NO SOLID MESH - 100% Transparent Hollow Core */}
      
      {/* Complex Neural Web Connections */}
      <lineSegments ref={linesRef} geometry={edgesGeometry}>
        <lineBasicMaterial 
          color="#0088ff" 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Intense Glowing Data Nodes */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial 
          size={0.03} 
          color="#00d4ff" 
          transparent 
          opacity={0.8}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ─── 8 ADVANCED ORBITAL RINGS ───────────────────────────────────────────────
function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const speed = (i % 2 === 0 ? 1 : -1) * (0.05 + i * 0.015);
        child.rotation.x += delta * speed * 0.4;
        child.rotation.y += delta * speed;
        child.rotation.z += delta * speed * 0.2;
      });
    }
  });

  // Exactly 8 rings with varying paths and colors
  const rings = [
    { radius: 3.2, tube: 0.002, color: "#ffffff", opacity: 0.3, rotation: [Math.PI/3, 0, 0] },
    { radius: 3.4, tube: 0.005, color: "#00d4ff", opacity: 0.2, rotation: [0, Math.PI/4, 0] },
    { radius: 3.6, tube: 0.002, color: "#8a2be2", opacity: 0.4, rotation: [-Math.PI/4, 0, Math.PI/6] },
    { radius: 3.8, tube: 0.008, color: "#0088ff", opacity: 0.1, rotation: [Math.PI/2, Math.PI/8, 0] },
    { radius: 4.0, tube: 0.003, color: "#ffffff", opacity: 0.25, rotation: [0, -Math.PI/3, 0] },
    { radius: 4.2, tube: 0.002, color: "#8a2be2", opacity: 0.35, rotation: [Math.PI/6, Math.PI/2, 0] },
    { radius: 4.5, tube: 0.006, color: "#00d4ff", opacity: 0.15, rotation: [-Math.PI/3, Math.PI/5, Math.PI/4] },
    { radius: 4.8, tube: 0.001, color: "#ffffff", opacity: 0.4, rotation: [0, 0, Math.PI/2] },
  ];

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <Torus 
          key={i} 
          args={[ring.radius, ring.tube, 32, 200]} 
          rotation={ring.rotation as [number, number, number]}
        >
          <meshBasicMaterial 
            color={ring.color} 
            transparent 
            opacity={ring.opacity} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </Torus>
      ))}
    </group>
  );
}

// ─── HOLOGRAPHIC GROUND PROJECTION ──────────────────────────────────────────
function GroundProjection() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z -= delta * 0.1;
      groupRef.current.children.forEach((child: any) => {
        if (child.material) {
           child.material.opacity = 0.05 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
        }
      });
    }
  });

  return (
    <group position={[0, -3.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <Ring args={[0.5, 4.5, 128]}>
         <meshBasicMaterial 
           color="#0088ff" 
           transparent 
           opacity={0.03} 
           side={THREE.DoubleSide} 
           blending={THREE.AdditiveBlending}
           depthWrite={false}
         />
      </Ring>
      <group ref={groupRef}>
        <Ring args={[2.8, 2.82, 128]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </Ring>
        <Ring args={[3.6, 3.62, 128]}>
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
        </Ring>
        <Ring args={[4.4, 4.41, 128]}>
          <lineBasicMaterial color="#8a2be2" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </Ring>
      </group>
      <mesh position={[0, 0, 0.1]}>
         <circleGeometry args={[1.5, 64]} />
         <meshBasicMaterial color="#00d4ff" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── BACKGROUND NEURAL DATA STREAM ─────────────────────────────────────────
function BackgroundDataStream() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40; 
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40; 
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 15; // Deep depth
    }
    return [positions];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.position.y += delta * 0.2;
      pointsRef.current.rotation.y += delta * 0.01;
      if (pointsRef.current.position.y > 10) {
        pointsRef.current.position.y = -10;
      }
    }
  });

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        color="#8a2be2"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// ─── INTEGRATED 3D HTML VERIFICATION CARD ──────────────────────────────────
function IntegratedVerificationCard() {
  return (
    <Html 
      position={[2.5, 1.5, 1.5]} 
      transform 
      occlude 
      className="pointer-events-none"
    >
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] w-64 transform transition-all">
        <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
           <div className="w-8 h-8 rounded bg-[#00d4ff]/10 flex items-center justify-center border border-[#00d4ff]/20 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
             <Shield size={16} className="text-[#00d4ff]" />
           </div>
           <span className="text-xs font-bold text-white tracking-wide shadow-black drop-shadow-md">Verification Engine</span>
        </div>
        <div className="space-y-4 text-[10px] font-mono uppercase tracking-widest text-slate-300 shadow-black drop-shadow-md">
           <div className="flex items-center justify-between">
              <span>Liveness</span>
              <span className="text-[#00ff88] font-bold drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]">PASS</span>
           </div>
           <div className="flex items-center justify-between">
              <span>Blink</span>
              <span className="text-[#00ff88] font-bold drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]">VERIFIED</span>
           </div>
           <div className="flex items-center justify-between">
              <span>Head Rotation</span>
              <span className="text-[#00ff88] font-bold drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]">VERIFIED</span>
           </div>
           <div className="flex items-center justify-between">
              <span>Spoof Risk</span>
              <span className="text-[#00d4ff] font-bold">0.2%</span>
           </div>
           <div className="flex items-center justify-between">
              <span>Identity Match</span>
              <span className="text-[#00d4ff] font-bold animate-pulse">98.7%</span>
           </div>
        </div>
      </div>
    </Html>
  );
}

// ─── MAIN SCENE CONTAINER ──────────────────────────────────────────────────
function SceneContainer() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const targetX = (state.pointer.x * Math.PI) / 8;
      const targetY = (state.pointer.y * Math.PI) / 8;
      
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <HollowPlexusCore />
      <OrbitalRings />
      <GroundProjection />
      <BackgroundDataStream />
      <IntegratedVerificationCard />
    </group>
  );
}

export default function BiometricSphere3D() {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <SceneContainer />
        
        {/* Cinematic Postprocessing */}
        <EffectComposer multisampling={4}>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            intensity={1.5} 
            mipmapBlur 
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
