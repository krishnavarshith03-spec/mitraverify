'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowRight, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
const CinematicBackground = ({ mousePos, windowSize }: any) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#050814]">
    <motion.div 
      animate={{ x: (mousePos.x - windowSize.w/2) * 0.02, y: (mousePos.y - windowSize.h/2) * 0.02 }}
      transition={{ type: "tween", ease: "linear", duration: 1.5 }}
      className="absolute top-[20%] left-[20%] w-[800px] h-[800px] rounded-full bg-[#6EA8FE]/[0.025] blur-[120px]"
    />
  </div>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ w: 1000, h: 1000 });

  useEffect(() => {
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess('Password reset link sent! Check your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050814] text-[#F8FAFC] flex items-center justify-center relative overflow-hidden font-sans font-light selection:bg-[#6EA8FE]/20">
      <CinematicBackground mousePos={mousePos} windowSize={windowSize} />
      
      <div className="w-full max-w-[1600px] min-h-screen flex items-center justify-center relative z-10 mx-auto px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full max-w-[460px] p-10 md:p-14 rounded-[36px] relative overflow-hidden"
          style={{ 
            background: 'rgba(10, 15, 30, 0.45)', 
            backdropFilter: 'blur(48px)', 
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute -bottom-[100px] left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-[#6EA8FE]/10 blur-[80px] pointer-events-none" />

          <div className="flex flex-col items-center justify-center mb-10">
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <Shield className="w-[18px] h-[18px] text-[#94A3B8]" strokeWidth={1.5} />
              <span className="text-[17px] font-medium tracking-[0.25em] text-[#CBD5E1] uppercase">
                Mitra Verify
              </span>
            </div>
            <h2 className="text-[24px] font-bold text-[#F8FAFC] tracking-tight">Reset Password</h2>
            <p className="text-[14px] text-[#94A3B8] text-center mt-2">Enter your work email and we'll send you a link to reset your password.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                <p className="text-[13px] text-red-400 text-center font-normal">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                <p className="text-[13px] text-emerald-400 text-center font-normal">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleReset} className="space-y-5 relative z-10">
            <div className="relative group">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="peer w-full h-[54px] pt-[20px] pb-2 bg-[rgba(255,255,255,0.02)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] border border-transparent rounded-[16px] pl-[54px] pr-5 text-[#F8FAFC] text-[15px] font-light focus:outline-none focus:border-white/[0.08] focus:bg-[rgba(255,255,255,0.03)] transition-all duration-500 placeholder-transparent"
                placeholder="Email"
              />
              <label className={`absolute left-[54px] transition-all duration-500 pointer-events-none ${email.length > 0 ? 'top-3 -translate-y-1/2 text-[10px] text-[#94A3B8] tracking-widest uppercase font-medium' : 'top-1/2 -translate-y-1/2 text-[15px] text-[#94A3B8] font-light'} peer-focus:top-3 peer-focus:-translate-y-1/2 peer-focus:text-[10px] peer-focus:text-[#CBD5E1] peer-focus:tracking-widest peer-focus:uppercase peer-focus:font-medium`}>
                Work Email
              </label>
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#94A3B8] group-focus-within:text-[#CBD5E1] transition-all duration-500" strokeWidth={1.5} />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-[58px] mt-8 rounded-[16px] bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white font-medium text-[15px] tracking-wide relative overflow-hidden group shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-all duration-500 hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none border border-white/[0.05]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? <RefreshCw className="w-[18px] h-[18px] animate-spin" /> : <>Send Reset Link <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-[4px] transition-transform duration-500" strokeWidth={1.5} /></>}
              </span>
            </button>
          </form>

          <p className="text-center mt-12 text-[13px] text-[#94A3B8] font-light relative z-10">
            Remembered your password?{' '}
            <Link href="/signin" className="text-[#CBD5E1] font-normal hover:text-white transition-colors duration-500">
              Back to Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
