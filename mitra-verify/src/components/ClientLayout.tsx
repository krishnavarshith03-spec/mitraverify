'use client';
import { useState, useEffect } from 'react';
import BottomTabBar from '@/components/BottomTabBar';
import { isMobileMenuOpen } from '@/components/Navbar';

/**
 * Client-side layout wrapper that includes components requiring hooks/state.
 * Mounted inside the server-side RootLayout.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Poll the Navbar's mobileOpen state (lightweight, uses module-level var)
  useEffect(() => {
    const interval = setInterval(() => {
      setMobileMenuOpen(isMobileMenuOpen());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {children}
      <BottomTabBar mobileMenuOpen={mobileMenuOpen} />
    </>
  );
}
