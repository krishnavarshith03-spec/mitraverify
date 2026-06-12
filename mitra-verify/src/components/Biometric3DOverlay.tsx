'use client';
import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const L_EYE_CONTOUR = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263];
const R_EYE_CONTOUR = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33];
const L_BROW_CONTOUR = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276];
const R_BROW_CONTOUR = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
const LIPS_CONTOUR = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 95, 88, 178, 61];
const OVAL_CONTOUR = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

function DynamicPoints({ positions, color }: { positions: Float32Array; color: string }) {
  const attrRef = useRef<THREE.BufferAttribute>(null);

  useEffect(() => {
    if (attrRef.current) {
      attrRef.current.needsUpdate = true;
    }
  }, [positions]);

  if (positions.length === 0) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={attrRef}
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.06} transparent opacity={0.7} sizeAttenuation={true} />
    </points>
  );
}

function DynamicLineLoop({ points, color, opacity = 0.8, width = 1.5 }: { points: THREE.Vector3[]; color: string; opacity?: number; width?: number }) {
  const geomRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    if (geomRef.current && points.length > 0) {
      geomRef.current.setFromPoints(points);
    }
  }, [points]);

  if (points.length === 0) return null;

  return (
    <lineLoop>
      <bufferGeometry ref={geomRef} />
      <lineBasicMaterial color={color} linewidth={width} transparent opacity={opacity} />
    </lineLoop>
  );
}

function DynamicLine({ points, color, opacity = 0.6, width = 1.5 }: { points: THREE.Vector3[]; color: string; opacity?: number; width?: number }) {
  const geomRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    if (geomRef.current && points.length > 0) {
      geomRef.current.setFromPoints(points);
    }
  }, [points]);

  if (points.length === 0) return null;

  return (
    <line>
      <bufferGeometry ref={geomRef} />
      <lineBasicMaterial color={color} linewidth={width} transparent opacity={opacity} />
    </line>
  );
}

function Biometric3D({ landmarks, color }: { landmarks: number[][]; color: string }) {
  // Create geometry positions for point cloud
  const pointsPositions = useMemo(() => {
    const arr = new Float32Array(478 * 3);
    if (!landmarks || landmarks.length < 478) return arr;
    for (let i = 0; i < 478; i++) {
      const lm = landmarks[i];
      if (lm) {
        // Mirrored coordinate space translation
        arr[i * 3] = (0.5 - lm[0]) * 7.5; 
        arr[i * 3 + 1] = (0.5 - lm[1]) * 5.6;
        arr[i * 3 + 2] = -lm[2] * 4.0;
      }
    }
    return arr;
  }, [landmarks]);

  const getLinePoints = useCallback((indices: number[]) => {
    const pts: THREE.Vector3[] = [];
    if (!landmarks || landmarks.length < 478) return pts;
    for (const idx of indices) {
      const lm = landmarks[idx];
      if (lm) {
        pts.push(new THREE.Vector3((0.5 - lm[0]) * 7.5, (0.5 - lm[1]) * 5.6, -lm[2] * 4.0));
      }
    }
    return pts;
  }, [landmarks]);

  const lEyePts = useMemo(() => getLinePoints(L_EYE_CONTOUR), [getLinePoints]);
  const rEyePts = useMemo(() => getLinePoints(R_EYE_CONTOUR), [getLinePoints]);
  const lBrowPts = useMemo(() => getLinePoints(L_BROW_CONTOUR), [getLinePoints]);
  const rBrowPts = useMemo(() => getLinePoints(R_BROW_CONTOUR), [getLinePoints]);
  const lipsPts = useMemo(() => getLinePoints(LIPS_CONTOUR), [getLinePoints]);
  const ovalPts = useMemo(() => getLinePoints(OVAL_CONTOUR), [getLinePoints]);

  return (
    <group>
      <DynamicPoints positions={pointsPositions} color={color} />
      <DynamicLineLoop points={lEyePts} color={color} />
      <DynamicLineLoop points={rEyePts} color={color} />
      <DynamicLine points={lBrowPts} color={color} />
      <DynamicLine points={rBrowPts} color={color} />
      <DynamicLineLoop points={lipsPts} color={color} />
      <DynamicLineLoop points={ovalPts} color={color} width={1.0} opacity={0.4} />
    </group>
  );
}

function NeuralNetworkParticles({ color }: { color: string }) {
  const count = 35;
  const meshRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    let seed = 54321;
    const lcg = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (lcg() - 0.5) * 8;
      pos[i * 3 + 1] = (lcg() - 0.5) * 6;
      pos[i * 3 + 2] = -lcg() * 6;

      vel[i * 3] = (lcg() - 0.5) * 0.008;
      vel[i * 3 + 1] = (lcg() - 0.5) * 0.008;
      vel[i * 3 + 2] = (lcg() - 0.5) * 0.008;
    }
    return { positions: pos, velocities: vel };
  }, []);

  const velocitiesRef = useRef<Float32Array>(velocities);

  useFrame(() => {
    if (!meshRef.current || !velocitiesRef.current) return;
    const geom = meshRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    if (!posAttr) return;

    const velocities = velocitiesRef.current;
    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3] += velocities[i * 3];
      posAttr.array[i * 3 + 1] += velocities[i * 3 + 1];
      posAttr.array[i * 3 + 2] += velocities[i * 3 + 2];

      if (Math.abs(posAttr.array[i * 3]) > 4) velocities[i * 3] *= -1;
      if (Math.abs(posAttr.array[i * 3 + 1]) > 3) velocities[i * 3 + 1] *= -1;
      if (posAttr.array[i * 3 + 2] < -8 || posAttr.array[i * 3 + 2] > 0) velocities[i * 3 + 2] *= -1;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.06} transparent opacity={0.25} sizeAttenuation={true} />
    </points>
  );
}

interface Biometric3DOverlayProps {
  landmarks: number[][] | null;
  isVerified: boolean;
  sessionTerminated: boolean;
}

export default function Biometric3DOverlay({ landmarks, isVerified, sessionTerminated }: Biometric3DOverlayProps) {
  const color = sessionTerminated ? '#ff3366' : isVerified ? '#00ff88' : '#00d4ff';

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 55 }} style={{ pointerEvents: 'none' }}>
        <ambientLight intensity={0.6} />
        {landmarks && landmarks.length >= 478 && (
          <Biometric3D landmarks={landmarks} color={color} />
        )}
        <NeuralNetworkParticles color={color} />
      </Canvas>
    </div>
  );
}
