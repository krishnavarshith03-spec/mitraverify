'use client';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AccessRestrictedModalProps {
  redirectPath: string;
}

export default function AccessRestrictedModal({ redirectPath }: AccessRestrictedModalProps) {
  // Use URL encoding for the redirect path to ensure safe query parameters
  const safeRedirectPath = encodeURIComponent(redirectPath);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#030712]/80 backdrop-blur-xl"
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md premium-glass p-8 overflow-hidden rounded-2xl border border-[#00d4ff]/20 shadow-[0_0_50px_rgba(0,212,255,0.1)]"
      >
        {/* Abstract glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d4ff]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 border border-[#00d4ff]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
            <Lock className="w-8 h-8 text-[#00d4ff]" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[280px]">
            Sign in to access enterprise verification demos, dashboard analytics, and developer tools.
          </p>
          
          <div className="w-full flex flex-col gap-3">
            <Link 
              href={`/signin?redirect=${safeRedirectPath}`}
              className="btn-primary w-full flex items-center justify-center gap-2 h-12 text-sm font-semibold"
              style={{ textDecoration: 'none' }}
            >
              Sign In <ArrowRight size={16} />
            </Link>
            <Link 
              href={`/signup?redirect=${safeRedirectPath}`}
              className="btn-ghost w-full flex items-center justify-center h-12 text-sm font-semibold"
              style={{ textDecoration: 'none' }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
