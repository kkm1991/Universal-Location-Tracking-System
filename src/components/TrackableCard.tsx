'use client';

// ---------------------------------------------------------------------------
// TrackableCard – Glassmorphism card for a single trackable entity
// ---------------------------------------------------------------------------

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { TrackableWithLastLocation, EntityType } from '@/types/database';

const ONLINE_TIMEOUT_MS = 15_000; // 15 seconds

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a human-readable relative time string. */
function timeAgo(timestampMs: number): string {
  const diffSec = Math.floor((Date.now() - timestampMs) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

// ---------------------------------------------------------------------------
// Entity type icons
// ---------------------------------------------------------------------------

const entityIcons: Record<
  EntityType,
  { icon: React.ReactNode; bg: string; text: string }
> = {
  person: {
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-400',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  vehicle: {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 17h14M5 17a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.5l1.5-3h6l1.5 3H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2M5 17l-1 3m15-3 1 3" />
        <circle cx="7.5" cy="17" r="1" />
        <circle cx="16.5" cy="17" r="1" />
      </svg>
    ),
  },
  asset: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TrackableCard({
  trackable,
}: {
  trackable: TrackableWithLastLocation;
}) {
  const router = useRouter();
  const entityStyle = entityIcons[trackable.entity_type];

  // Real-time online/offline state
  const [lastSignalAt, setLastSignalAt] = useState<number | null>(
    trackable.last_location_at ? new Date(trackable.last_location_at).getTime() : null
  );
  const [online, setOnline] = useState(() => {
    if (!trackable.last_location_at) return false;
    return Date.now() - new Date(trackable.last_location_at).getTime() < ONLINE_TIMEOUT_MS;
  });
  const [lastSeenText, setLastSeenText] = useState('...');

  // Subscribe to broadcast for this trackable
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`trackable:${trackable.id}`)
      .on('broadcast', { event: 'location_update' }, () => {
        setLastSignalAt(Date.now());
        setOnline(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [trackable.id]);

  // Tick every second to update online/offline and elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSignalAt) {
        const elapsed = Date.now() - lastSignalAt;
        setOnline(elapsed < ONLINE_TIMEOUT_MS);
        setLastSeenText(timeAgo(lastSignalAt));
      } else {
        setOnline(false);
        setLastSeenText('No data yet');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSignalAt]);

  return (
    <button
      type="button"
      onClick={() => router.push(`/dashboard/track/${trackable.id}`)}
      className="group relative w-full cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/30 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(99,102,241,0.08)]"
    >
      {/* Top row: entity icon + tracker badge */}
      <div className="flex items-start justify-between">
        {/* Entity icon */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${entityStyle.bg} ${entityStyle.text}`}
        >
          {entityStyle.icon}
        </div>

        {/* Tracker type badge */}
        <span className="inline-flex items-center rounded-lg bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
          {trackable.tracker_type === 'app' ? '📱 App' : '📡 Hardware'}
        </span>
      </div>

      {/* Name + entity type */}
      <div className="mt-4">
        <h3 className="text-base font-semibold text-white transition-colors group-hover:text-indigo-300">
          {trackable.name}
        </h3>
        <p className="mt-0.5 text-xs capitalize text-[#94a3b8]">
          {trackable.entity_type}
        </p>
      </div>

      {/* IMEI (hardware only) */}
      {trackable.tracker_type === 'hardware' && trackable.hardware_imei && (
        <p className="mt-2 truncate text-xs text-[#94a3b8]">
          <span className="font-medium text-[#64748b]">IMEI:</span>{' '}
          {trackable.hardware_imei}
        </p>
      )}

      {/* Trackable ID (UUID) — click to copy */}
      <div className="mt-2 flex items-center gap-2">
        <p className="truncate text-xs text-[#64748b] font-mono">
          <span className="font-medium font-sans text-[#94a3b8]">ID:</span>{' '}
          {trackable.id}
        </p>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(trackable.id);
            const el = e.currentTarget;
            el.textContent = '✓';
            setTimeout(() => { el.textContent = '📋'; }, 1500);
          }}
          className="flex-shrink-0 cursor-pointer rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] text-[#94a3b8] transition-colors hover:bg-white/[0.12] hover:text-white"
          title="Copy ID"
        >
          📋
        </span>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-white/[0.06]" />

      {/* Status row */}
      <div className="flex items-center justify-between">
        {/* Online / Offline indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              online
                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              online ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {online ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Last seen - real-time */}
        <span className="text-[11px] text-[#64748b]">
          {lastSeenText}
        </span>
      </div>

      {/* Track button */}
      <div className="mt-3 pt-3 border-t border-white/[0.06]">
        <span
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600/20 py-2 text-sm font-semibold text-indigo-400 transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Track Live
        </span>
      </div>
    </button>
  );
}
