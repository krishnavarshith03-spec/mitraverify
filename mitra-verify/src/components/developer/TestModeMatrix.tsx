import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestModeMatrixProps {
  telemetry: {
    detectedFaces: number;
    bbox: any;
    fraudDetection: any;
    confidence: number;
    identityScore?: number;
  };
}

export function TestModeMatrix({ telemetry }: TestModeMatrixProps) {
  // Compute test conditions based on telemetry
  const isNoFace = telemetry.detectedFaces === 0;
  const isMultipleFaces = telemetry.detectedFaces > 1;
  const isLowLighting = telemetry.fraudDetection?.printed_photo?.detected; // Printed photo often mimics low texture variance/lighting
  const isFaceOutOfFrame = telemetry.bbox ? 
    (telemetry.bbox.x < 0.05 || (telemetry.bbox.x + telemetry.bbox.w) > 0.95 || 
     telemetry.bbox.y < 0.05 || (telemetry.bbox.y + telemetry.bbox.h) > 0.95) : false;
  const isFaceTooClose = telemetry.bbox ? (telemetry.bbox.w > 0.8 || telemetry.bbox.h > 0.8) : false;
  const isFaceTooFar = telemetry.bbox ? (telemetry.bbox.w < 0.2 || telemetry.bbox.h < 0.2) : false;

  const renderCheck = (label: string, isFailing: boolean) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
      <span>{label}</span>
      <span style={{ 
        color: isFailing ? '#f00' : '#0f0',
        fontWeight: 'bold' 
      }}>
        {isFailing ? 'FAIL' : 'PASS'}
      </span>
    </div>
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div 
      drag 
      dragMomentum={false}
      style={{
      position: 'absolute',
      left: '20px',
      top: '80px',
      width: isCollapsed ? 'auto' : '260px',
      backgroundColor: 'rgba(10, 10, 10, 0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      padding: '12px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      cursor: 'move'
    }}>
      <div style={{ borderBottom: isCollapsed ? 'none' : '1px solid #555', paddingBottom: isCollapsed ? '0' : '8px', marginBottom: isCollapsed ? '0' : '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', color: '#ffcc00' }}>[TEST MODE] Edge Cases</h3>
        <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'transparent', border: 'none', color: '#ffcc00', cursor: 'pointer', padding: '4px' }} onPointerDown={(e) => e.stopPropagation()}>
          {isCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
      
      {renderCheck('Face Detection (No Face)', isNoFace)}
      {renderCheck('Multiple Faces', isMultipleFaces)}
      {renderCheck('Face Out Of Bounds', isFaceOutOfFrame)}
      {renderCheck('Face Too Close', isFaceTooClose)}
      {renderCheck('Face Too Far', isFaceTooFar)}
      {renderCheck('Texture/Lighting Variance', isLowLighting)}
      
      <div style={{ marginTop: '12px', fontSize: '10px', color: '#888' }}>
        Simulate real-world conditions by obscuring the camera, bringing a second person into frame, or moving out of bounds. The system must immediately intercept FAIL states.
      </div>
      </>
      )}
    </motion.div>
  );
}
