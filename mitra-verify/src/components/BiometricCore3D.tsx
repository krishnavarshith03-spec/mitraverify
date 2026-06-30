'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ─── DOTTED RING: points arranged in a circle ──────────────────────────────
function useDottedRingPositions(radius: number, dotCount: number) {
  return useMemo(() => {
    const positions = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;
    }
    return positions;
  }, [radius, dotCount]);
}


function WireframeGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  // Ring parent groups (for the sweeping tilt)
  const thinRingParentRef = useRef<THREE.Group>(null);
  const dottedRingParentRef = useRef<THREE.Group>(null);

  // Ring spin groups (for rotation around own axis)
  const thinRingSpinRef = useRef<THREE.Group>(null);
  const dottedRingSpinRef = useRef<THREE.Group>(null);

  const thinRingGlowRef = useRef<THREE.Mesh>(null);

  const dottedPositions = useDottedRingPositions(2.5, 90);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // ── Globe rotation (original) ──
    if (groupRef.current) {
      const baseRotationY = t * 0.1;
      const baseRotationX = 0.2 + Math.sin(t * 0.2) * 0.05;

      const mouseOffsetX = (state.pointer.x * Math.PI) / 8;
      const mouseOffsetY = (state.pointer.y * Math.PI) / 8;

      const targetRotationX = baseRotationX + mouseOffsetY;
      const targetRotationY = baseRotationY + mouseOffsetX;

      groupRef.current.rotation.x += 0.02 * (targetRotationX - groupRef.current.rotation.x);
      groupRef.current.rotation.y += 0.02 * (targetRotationY - groupRef.current.rotation.y);
    }

    // ── THIN RING: sweeps tilt from top to bottom ──
    // The tilt oscillates so the ring plane scans across the globe
    if (thinRingParentRef.current) {
      // Sweep: tilt rocks between ~30° and ~150° (scans top → bottom → top)
      const sweepAngle = Math.PI / 2 + Math.sin(t * 0.25) * (Math.PI * 0.38);
      thinRingParentRef.current.rotation.x = sweepAngle;
      // Slight Y drift for 3D feel
      thinRingParentRef.current.rotation.y = Math.sin(t * 0.15) * 0.2;
    }
    // Spin ring around its own axis
    if (thinRingSpinRef.current) {
      thinRingSpinRef.current.rotation.z -= delta * 0.1;
    }
    // Glow pulse
    if (thinRingGlowRef.current) {
      const mat = thinRingGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + Math.sin(t * 1.8) * 0.04;
    }

    // ── DOTTED RING: sweeps opposite direction ──
    if (dottedRingParentRef.current) {
      // Opposite phase sweep
      const sweepAngle = Math.PI / 2 + Math.sin(t * 0.25 + Math.PI) * (Math.PI * 0.38);
      dottedRingParentRef.current.rotation.x = sweepAngle;
      dottedRingParentRef.current.rotation.y = Math.sin(t * 0.15 + Math.PI) * 0.25;
    }
    if (dottedRingSpinRef.current) {
      dottedRingSpinRef.current.rotation.z += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={1.0}>

      {/* ═══ ORIGINAL GLOBE ═══ */}

      {/* Base Sphere Wireframe */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#1677FF" wireframe transparent opacity={0.2} />
      </mesh>

      {/* Sphere Points */}
      <points>
        <sphereGeometry args={[2, 32, 32]} />
        <pointsMaterial size={0.03} color="#00E5FF" transparent opacity={0.6} sizeAttenuation />
      </points>

      {/* Outer Glow Sphere */}
      <mesh>
        <sphereGeometry args={[1.98, 32, 32]} />
        <meshBasicMaterial color="#001133" transparent opacity={0.6} />
      </mesh>


      {/* ═══ RING 1: THIN SOLID — sweeps across globe ═══ */}
      {/* Parent tilts/rocks = scanning sweep. Child spins = orbital motion. */}
      <group ref={thinRingParentRef}>
        <group ref={thinRingSpinRef}>
          {/* Core thin ring */}
          <mesh>
            <torusGeometry args={[2.35, 0.01, 16, 128]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Glow aura */}
          <mesh ref={thinRingGlowRef}>
            <torusGeometry args={[2.35, 0.05, 16, 128]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.1}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>


      {/* ═══ RING 2: DOTTED — sweeps opposite direction ═══ */}
      <group ref={dottedRingParentRef}>
        <group ref={dottedRingSpinRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={dottedPositions.length / 3}
                array={dottedPositions}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.05}
              color="#00E5FF"
              transparent
              opacity={0.55}
              sizeAttenuation
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </points>

          {/* Faint glow ring behind dots */}
          <mesh>
            <torusGeometry args={[2.5, 0.04, 16, 128]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.04}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>

    </group>
  );
}

export default function BiometricCore3D() {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-auto cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <OrbitControls enableZoom={false} enablePan={false} />
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
          <WireframeGlobe />
        </Float>
      </Canvas>
    </div>
  );
}
