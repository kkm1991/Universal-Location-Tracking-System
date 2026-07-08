export default function TrackLoading() {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden bg-[#0a0a0f] animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="w-full lg:w-80 bg-[#12121a] border-r border-white/5 flex flex-col h-full shrink-0">
        <div className="p-5 border-b border-white/5 space-y-4">
          <div className="h-4 w-32 rounded bg-white/5" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <div className="h-5 w-32 rounded bg-white/10" />
              <div className="h-4 w-20 rounded-full bg-white/5" />
            </div>
          </div>
        </div>
        
        {/* Signal Status Skeleton */}
        <div className="p-5 border-b border-white/5">
          <div className="h-16 w-full rounded-xl bg-white/5" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-2 p-5 border-b border-white/5 bg-white/[0.01]">
          <div className="h-16 rounded-xl bg-white/5" />
          <div className="h-16 rounded-xl bg-white/5" />
          <div className="col-span-2 h-16 rounded-xl bg-white/5" />
        </div>

        {/* Log Trail Skeleton */}
        <div className="p-5 space-y-3">
          <div className="h-4 w-24 rounded bg-white/5" />
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>

      {/* Map Pane Skeleton */}
      <div className="flex-1 h-full bg-[#12121a] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTAgMjBoNDBNMCAzMGg0ME0xMCAwdjQwTTIwIDB2NDBNMzAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] bg-repeat opacity-50" />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-medium text-[#94a3b8]">Loading map data...</div>
        </div>
      </div>
    </div>
  );
}
