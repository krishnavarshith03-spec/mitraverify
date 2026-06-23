'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Torus, Points, PointMaterial, Line, Ring } from '@react-three/drei';
import * as THREE from 'three';

// ─── PLEXUS CORE NETWORK (REFINED ENTERPRISE TIER) ─────────────────────────
function PlexusCore() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Detail 5 generates a massive amount of vertices (over 2500)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2.5, 5), []);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry, 10), [geometry]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth, deliberate rotation
      groupRef.current.rotation.y += delta * 0.03;
      groupRef.current.rotation.x += delta * 0.01;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.0) * 0.005;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner volumetric glass-like core */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial 
          color="#020816"
          emissive="#004488"
          emissiveIntensity={0.2}
          transparent 
          opacity={0.8}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Extremely thin neural connections */}
      <lineSegments ref={linesRef} geometry={edgesGeometry}>
        <lineBasicMaterial 
          color="#00bfff" 
          transparent 
          opacity={0.06} 
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Thousands of white/cyan data nodes */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial 
          size={0.015} 
          color="#ffffff" 
          transparent 
          opacity={0.6}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ─── SUBTLE ORBITAL SYSTEM ────────────────────────────────────────────────
function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const speed = (i % 2 === 0 ? 1 : -1) * (0.02 + i * 0.01);
        child.rotation.x += delta * speed * 0.3;
        child.rotation.y += delta * speed;
      });
    }
  });

  const rings = [
    { radius: 3.2, tube: 0.001, color: "#ffffff", opacity: 0.15, rotation: [Math.PI/3, 0, 0] },
    { radius: 3.5, tube: 0.003, color: "#00bfff", opacity: 0.08, rotation: [0, Math.PI/4, 0] },
    { radius: 3.8, tube: 0.001, color: "#8a2be2", opacity: 0.2, rotation: [-Math.PI/4, 0, Math.PI/6] },
    { radius: 4.2, tube: 0.005, color: "#ffffff", opacity: 0.04, rotation: [Math.PI/2, Math.PI/8, 0] },
    { radius: 4.6, tube: 0.002, color: "#00bfff", opacity: 0.1, rotation: [0, -Math.PI/3, 0] },
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

// ─── HOLOGRAPHIC GROUND (REFINED) ──────────────────────────────────────────
function GroundProjection() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z -= delta * 0.05;
      groupRef.current.children.forEach((child: any) => {
        if (child.material) {
           child.material.opacity = 0.05 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
        }
      });
    }
  });

  return (
    <group position={[0, -3.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <Ring args={[0.5, 4.0, 128]}>
         <meshBasicMaterial 
           color="#00bfff" 
           transparent 
           opacity={0.02} 
           side={THREE.DoubleSide} 
           blending={THREE.AdditiveBlending}
           depthWrite={false}
         />
      </Ring>
      <group ref={groupRef}>
        <Ring args={[2.8, 2.82, 128]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </Ring>
        <Ring args={[3.4, 3.41, 128]}>
          <meshBasicMaterial color="#00bfff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </Ring>
        <Ring args={[4.2, 4.21, 128]}>
          <lineBasicMaterial color="#8a2be2" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </Ring>
      </group>
      <mesh position={[0, 0, 0.1]}>
         <circleGeometry args={[1.5, 64]} />
         <meshBasicMaterial color="#00bfff" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── BACKGROUND NEURAL DATA STREAM ─────────────────────────────────────────
function BackgroundDataStream() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 10; // Z pushed deep back
    }
    return [positions];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Extremely slow drift
      pointsRef.current.position.y += delta * 0.1;
      if (pointsRef.current.position.y > 5) {
        pointsRef.current.position.y = -5;
      }
    }
  });

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        color="#8a2be2"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// ─── MAIN SCENE CONTAINER ──────────────────────────────────────────────────
function SceneContainer() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const targetX = (state.pointer.x * Math.PI) / 12;
      const targetY = (state.pointer.y * Math.PI) / 12;
      
      // Smooth, deliberate parallax interpolation
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.02;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <PlexusCore />
      <OrbitalRings />
      <GroundProjection />
      <BackgroundDataStream />
    </group>
  );
}

export default function BiometricSphere3D() {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#00bfff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#8a2be2" />
        <pointLight position={[0, -5, 0]} intensity={1} color="#00bfff" /> 
        
        <SceneContainer />
      </Canvas>
    </div>
  );
}
