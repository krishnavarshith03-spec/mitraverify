'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield } from 'lucide-react';

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Security', href: '/security' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
  Product: [
    { label: 'Face Liveness API', href: '/demo/basic' },
    { label: 'Anti-Spoofing API', href: '/demo/advanced' },
    { label: 'Identity Verification', href: '/demo/enterprise' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Developer Portal', href: '/developer' },
    { label: 'API Reference', href: '/docs/api' },
    { label: 'System Status', href: '/status' },
  ],
  Contact: [
    { label: 'Sales', href: '/contact' },
    { label: 'Support', href: '/support' },
    { label: 'Twitter', href: 'https://twitter.com' },
    { label: 'GitHub', href: 'https://github.com' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-white/5 bg-[#030712] overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">
          
          <div className="col-span-2 lg:col-span-2 flex flex-col items-start text-left">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 border border-[#00d4ff]/30 flex items-center justify-center group-hover:border-[#00d4ff] transition-colors">
                <Shield size={16} color="#00d4ff" />
              </div>
              <span className="font-bold tracking-widest text-white text-sm uppercase">MITRA VERIFY</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-[280px]">
              Enterprise biometric security division by Next Step Innovators. Architecting the future of secure identity verification.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="col-span-1 flex flex-col items-start">
              <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-4">
                {category}
              </h3>
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <Link key={link.label} href={link.href} className="text-[13px] text-slate-500 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
          <div className="text-[11px] font-mono text-slate-600">
            © {new Date().getFullYear()} NEXT STEP INNOVATORS. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[11px] font-mono font-semibold text-slate-500 tracking-wider">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
