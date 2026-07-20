import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse" />
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative z-10" />
        </div>
        <div className="text-neutral-400 font-medium tracking-wider text-sm animate-pulse">
          INITIALIZING SECURE ENVIRONMENT...
        </div>
      </div>
    </div>
  );
}
