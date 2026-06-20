'use client';
import { useState, useEffect } from 'react';
import { isMobileMenuOpen } from '@/components/Navbar';

/**
 * Client-side layout wrapper that includes components requiring hooks/state.
 * Mounted inside the server-side RootLayout.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
