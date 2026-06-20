'use client';
import { motion } from 'framer-motion';

export default function VerificationFunnel({ overview }: { overview: any }) {
  const steps = [
    { label: 'Total Requests', value: overview?.total_requests || 0, color: '#00d4ff' },
    { label: 'Face Detected', value: (overview?.total_requests || 0) - (overview?.no_face_detected || 0), color: '#7c3aed' },
    { label: 'Liveness Passed', value: (overview?.successful_verifications || 0) + (overview?.identity_matches || 0), color: '#00ff88' },
    { label: 'Identity Matched', value: overview?.identity_matches || 0, color: '#00ff88' }
  ];

  const maxVal = Math.max(1, steps[0].value);

  return (
    <div className="flex flex-col gap-3 mt-4">
      {steps.map((step, idx) => {
        const percentage = (step.value / maxVal) * 100;
        return (
          <div key={step.label} className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{step.label}</span>
              <span className="font-mono text-white">{step.value.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ 
                  background: `linear-gradient(90deg, ${step.color}66, ${step.color})`,
                  boxShadow: `0 0 10px ${step.color}33`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
