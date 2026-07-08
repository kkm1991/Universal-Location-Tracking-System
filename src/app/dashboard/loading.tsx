export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-40 rounded-lg bg-white/10" />
          <div className="h-7 w-8 rounded-full bg-indigo-500/10" />
        </div>
        <div className="h-10 w-48 rounded-xl bg-indigo-600/20" />
      </div>

      {/* Grid Skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-md"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-white/10" />
              <div className="h-5 w-16 rounded-lg bg-white/10" />
            </div>
            <div className="mt-4">
              <div className="h-5 w-3/4 rounded bg-white/10" />
              <div className="mt-2 h-3 w-1/2 rounded bg-white/5" />
            </div>
            <div className="my-3 border-t border-white/[0.06]" />
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 rounded bg-white/5" />
              <div className="h-4 w-12 rounded bg-white/5" />
            </div>
            <div className="mt-3 border-t border-white/[0.06] pt-3">
              <div className="h-9 w-full rounded-xl bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
