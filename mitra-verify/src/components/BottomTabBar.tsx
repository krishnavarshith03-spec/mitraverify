'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, BookOpen, LayoutDashboard, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'APIs', href: '/compare', icon: Layers },
  { label: 'Docs', href: '/docs', icon: BookOpen },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'More', href: '#more', icon: MoreHorizontal },
];

const moreTabs = [
  { label: 'Developer Portal', href: '/developer' },
  { label: 'Fast Liveness Demo', href: '/demo/basic' },
  { label: 'Anti-Spoof Demo', href: '/demo/advanced' },
  { label: 'Enterprise Demo', href: '/demo/enterprise' },
  { label: 'Contact', href: '/contact' },
];

export default function BottomTabBar({ mobileMenuOpen }: { mobileMenuOpen?: boolean }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close "More" panel on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMoreOpen(false);
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Hide when mobile fullscreen menu is open
  if (mobileMenuOpen) return null;

  return (
    <>
      {/* More panel overlay */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1090,
              background: 'rgba(3, 7, 18, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: 80,
                left: 16,
                right: 16,
                background: 'rgba(10, 15, 30, 0.98)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(0, 212, 255, 0.12)',
                borderRadius: 20,
                padding: 8,
                boxShadow: '0 -16px 48px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 212, 255, 0.04)',
              }}
            >
              {moreTabs.map((tab, idx) => (
                <motion.div
                  key={tab.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                >
                  <Link
                    href={tab.href}
                    onClick={() => setMoreOpen(false)}
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      borderRadius: 12,
                      textDecoration: 'none',
                      fontSize: 15,
                      fontWeight: 500,
                      color: isActive(tab.href) ? '#00d4ff' : '#94a3b8',
                      background: isActive(tab.href) ? 'rgba(0, 212, 255, 0.06)' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <nav
        className="bottom-tab-bar"
        aria-label="Mobile navigation"
      >
        {tabs.map(tab => {
          const active = tab.href === '#more' ? moreOpen : isActive(tab.href);
          const Icon = tab.icon;

          if (tab.href === '#more') {
            return (
              <button
                key={tab.label}
                onClick={() => setMoreOpen(!moreOpen)}
                className={`bottom-tab-item ${active ? 'active' : ''}`}
                aria-label="More navigation options"
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span>{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`bottom-tab-item ${active ? 'active' : ''}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span>{tab.label}</span>
              {active && (
                <motion.div
                  layoutId="bottomTabIndicator"
                  className="bottom-tab-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
