export function KpiCardSkeleton() {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-[18px] p-4 md:p-5 shadow-sm flex flex-col justify-between h-[130px] md:h-[150px] relative overflow-hidden animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-white/5"></div>
        <div className="h-4 w-24 bg-white/5 rounded"></div>
      </div>
      <div className="flex flex-col mt-auto">
        <div className="h-8 w-16 bg-white/5 rounded mb-2"></div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 bg-white/5 rounded"></div>
          <div className="h-3 w-16 bg-white/5 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function AreaChartSkeleton() {
  return (
    <div className="xl:col-span-2 bg-[#0F172A] border border-white/5 rounded-[18px] p-4 md:p-6 shadow-sm flex flex-col animate-pulse h-[350px]">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-40 bg-white/5 rounded"></div>
        <div className="h-8 w-32 bg-white/5 rounded"></div>
      </div>
      <div className="flex-1 w-full mt-2 bg-white/5 rounded"></div>
    </div>
  );
}

export function SummarySkeleton() {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-[18px] p-4 md:p-6 shadow-sm flex flex-col justify-center animate-pulse h-[350px]">
      <div className="h-5 w-40 bg-white/5 rounded mb-6"></div>
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <div className="h-4 w-16 bg-white/5 rounded"></div>
              <div className="h-4 w-10 bg-white/5 rounded"></div>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ApiPerfSkeleton() {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-[18px] p-5 shadow-sm animate-pulse h-[140px]">
      <div className="flex justify-between items-center mb-5">
        <div className="h-5 w-24 bg-white/5 rounded"></div>
        <div className="h-5 w-12 bg-white/5 rounded-full"></div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-3 w-32">
          <div className="h-3 w-full bg-white/5 rounded"></div>
          <div className="h-3 w-full bg-white/5 rounded"></div>
          <div className="h-3 w-full bg-white/5 rounded"></div>
        </div>
        <div className="w-16 h-8 bg-white/5 rounded"></div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="xl:col-span-3 bg-[#0F172A] border border-white/5 rounded-[18px] flex flex-col overflow-hidden animate-pulse min-h-[400px]">
      <div className="p-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
        <div className="h-5 w-40 bg-white/5 rounded"></div>
        <div className="h-8 w-64 bg-white/5 rounded"></div>
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between w-full h-8 bg-white/5 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export function SystemStatusSkeleton() {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-[18px] p-6 shadow-sm flex flex-col animate-pulse min-h-[400px]">
      <div className="h-5 w-32 bg-white/5 rounded mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-[10px] bg-white/5">
            <div className="h-4 w-20 bg-white/5 rounded"></div>
            <div className="h-4 w-16 bg-white/5 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
