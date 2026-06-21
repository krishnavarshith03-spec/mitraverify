'use client';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import AccessRestrictedModal from './AccessRestrictedModal';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] relative">
        {/* We render an inert version of the page background to look like a real page, but it's obscured by the modal */}
        <AccessRestrictedModal redirectPath={pathname} />
      </div>
    );
  }

  return <>{children}</>;
}
