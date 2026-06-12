'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Constants ────────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 500;
const PARTICLE_COLOR = new THREE.Color(0x00d4ff); // rgba(0, 212, 255)
const PARTICLE_OPACITY = 0.3;
const SPREAD_X = 20;
const SPREAD_Y = 14;
const SPREAD_Z = 8;

// ─── Instanced Particle Field ─────────────────────────────────────────────────
function InstancedParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Pre-compute per-particle properties
  const particles = useMemo(() => {
    let seed = 98765;
    const lcg = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (lcg() - 0.5) * SPREAD_X,
      y: (lcg() - 0.5) * SPREAD_Y,
      z: (lcg() - 0.5) * SPREAD_Z,
      speedY: 0.005 + lcg() * 0.012,
      speedX: (lcg() - 0.5) * 0.004,
      swayFreq: 0.2 + lcg() * 0.6,
      swayAmp: 0.004 + lcg() * 0.008,
      phase: lcg() * Math.PI * 2,
      scale: 0.015 + lcg() * 0.03,
    }));
  }, []);

  // Reuse matrix + color per frame
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentPositionsRef = useRef<Array<{ x: number; y: number; z: number }> | null>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (!currentPositionsRef.current) {
      currentPositionsRef.current = particles.map((p) => ({ x: p.x, y: p.y, z: p.z }));
    }
    const currentPositions = currentPositionsRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const cur = currentPositions[i];

      // Drift upward
      cur.y += p.speedY;
      // Gentle horizontal sway
      cur.x += Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
      // Slight depth oscillation
      cur.z += Math.cos(t * p.swayFreq * 0.5 + p.phase) * p.swayAmp * 0.5;

      // Wrap around vertical bounds
      if (cur.y > SPREAD_Y / 2 + 1) {
        cur.y = -SPREAD_Y / 2 - 1;
        cur.x = (Math.random() - 0.5) * SPREAD_X;
        cur.z = (Math.random() - 0.5) * SPREAD_Z;
      }

      dummy.position.set(cur.x, cur.y, cur.z);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial
        color={PARTICLE_COLOR}
        transparent
        opacity={PARTICLE_OPACITY}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ─── Scene wrapper ────────────────────────────────────────────────────────────
function ParticleScene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <InstancedParticles />
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
interface ParticleFieldProps {
  /** Optional CSS class for the outer container */
  className?: string;
  /** Override particle color (CSS hex string). Default: #00d4ff */
  color?: string;
  /** Override opacity. Default: 0.3 */
  opacity?: number;
  /** Override count. Default: 500 */
  count?: number;
}

export default function ParticleField({
  className = '',
}: ParticleFieldProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <Canvas
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 100 }}
        style={{ background: 'transparent' }}
        frameloop="always"
      >
        <ParticleScene />
      </Canvas>
    </div>
  );
}

// ─── Named Particle Field Variants ────────────────────────────────────────────

/** A subtler, cyan-tinted field used as section backgrounds */
export function SubtleParticleField({ className = '' }: { className?: string }) {
  return <ParticleField className={className} />;
}

/** Dense particle field for hero sections */
export function DenseParticleField({ className = '' }: { className?: string }) {
  return <ParticleField className={className} />;
}
