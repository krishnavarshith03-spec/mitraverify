'use client';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const Global3DBackground = dynamic(() => import('@/components/cyber/Global3DBackground'), { 
  ssr: false 
});

/**
 * Client-side layout wrapper that includes components requiring hooks/state.
 * Mounted inside the server-side RootLayout.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        refetchOnWindowFocus: true,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <Global3DBackground />
      <div className="flex-1 flex flex-col min-h-screen">
        {children}
      </div>
      <Footer />
    </QueryClientProvider>
  );
}
