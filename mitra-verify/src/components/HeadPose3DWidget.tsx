'use client';
import React from 'react';
import { Canvas } from '@react-three/fiber';

interface HeadPose3DWidgetProps {
  yaw: number;
  pitch: number;
  roll: number;
  color: string;
}

function OrientationObject({ yaw, pitch, roll, color }: HeadPose3DWidgetProps) {
  // Convert degrees to radians
  const yawRad = (yaw * Math.PI) / 180;
  const pitchRad = (pitch * Math.PI) / 180;
  const rollRad = (roll * Math.PI) / 180;

  return (
    <group rotation={[pitchRad, yawRad, -rollRad]}>
      {/* Wireframe Cylinder/Box representing head shape */}
      <mesh>
        <cylinderGeometry args={[0.9, 0.9, 2.0, 12]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>
      
      {/* Nose Cone Indicator */}
      <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.5, 8]} />
        <meshBasicMaterial color="#ffb800" wireframe />
      </mesh>

      {/* Eye spheres */}
      <mesh position={[-0.35, 0.4, 0.85]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      <mesh position={[0.35, 0.4, 0.85]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>

      {/* Base Grid plate reference */}
      <gridHelper args={[3, 10, '#334155', '#1e293b']} position={[0, -1.0, 0]} />
    </group>
  );
}

export default function HeadPose3DWidget({ yaw, pitch, roll, color }: HeadPose3DWidgetProps) {
  return (
    <div style={{ width: '100%', height: 110, background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 1.2, 3.2], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <OrientationObject yaw={yaw} pitch={pitch} roll={roll} color={color} />
      </Canvas>
    </div>
  );
}
