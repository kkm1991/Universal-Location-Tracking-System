// ---------------------------------------------------------------------------
// Dashboard Page – Server Component
// ---------------------------------------------------------------------------

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Trackable, TrackableWithLastLocation } from '@/types/database';
import TrackableCard from '@/components/TrackableCard';

export default async function DashboardPage() {
  const supabase = await createClient();

  // ---- Authenticate -------------------------------------------------------
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // ---- Fetch trackables and latest locations with Cache -------------------
  // Caching for 10 seconds to reduce DB load while keeping data reasonably fresh
  const getCachedDashboardData = unstable_cache(
    async (userId: string) => {
      const adminClient = createAdminClient();

      // Fetch trackables
      const { data: trackables } = await adminClient
        .from('trackables')
        .select('*')
        .eq('account_id', userId)
        .order('created_at', { ascending: false })
        .returns<Trackable[]>();

      const trackableIds = (trackables ?? []).map((t) => t.id);
      const latestLocations: Record<string, any> = {};

      if (trackableIds.length > 0) {
        const { data: logs } = await adminClient
          .from('location_logs_with_coords')
          .select('trackable_id, latitude, longitude, speed, battery_level, created_at')
          .in('trackable_id', trackableIds)
          .order('created_at', { ascending: false });

        if (logs) {
          for (const log of logs) {
            if (!latestLocations[log.trackable_id]) {
              latestLocations[log.trackable_id] = {
                latitude: log.latitude,
                longitude: log.longitude,
                speed: log.speed,
                battery_level: log.battery_level,
                created_at: log.created_at,
              };
            }
          }
        }
      }

      return { trackables, latestLocations };
    },
    ['dashboard-data'],
    { revalidate: 10, tags: ['dashboard'] }
  );

  const { trackables, latestLocations } = await getCachedDashboardData(user.id);

  // ---- Merge trackable + last location ------------------------------------
  const items: TrackableWithLastLocation[] = (trackables ?? []).map((t) => {
    const loc = latestLocations[t.id];
    return {
      ...t,
      last_latitude: loc?.latitude ?? null,
      last_longitude: loc?.longitude ?? null,
      last_speed: loc?.speed ?? null,
      last_battery_level: loc?.battery_level ?? null,
      last_location_at: loc?.created_at ?? null,
    };
  });

  const count = items.length;

  // ---- Render -------------------------------------------------------------

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#f1f5f9]">
            My Trackables
          </h1>
          <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-indigo-500/15 px-2.5 text-xs font-semibold text-indigo-400">
            {count}
          </span>
        </div>

        <Link
          href="/dashboard/add-trackable"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.97]"
        >
          {/* Plus icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Trackable
        </Link>
      </div>

      {/* Grid / Empty state */}
      {count === 0 ? (
        <div className="mt-24 flex flex-col items-center justify-center text-center">
          {/* Empty illustration */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h2 className="mt-6 text-lg font-semibold text-[#f1f5f9]">
            No trackables yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-[#94a3b8]">
            Start tracking people, vehicles, or assets by adding your first
            trackable entity.
          </p>
          <Link
            href="/dashboard/add-trackable"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.97]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Your First Trackable
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <TrackableCard key={item.id} trackable={item} />
          ))}
        </div>
      )}
    </div>
  );
}
