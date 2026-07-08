import React from "react";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import TrackingView from "@/components/TrackingView";

export const dynamic = "force-dynamic";

interface TrackingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { id: trackableId } = await params;
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const getCachedTrackData = unstable_cache(
    async (id: string) => {
      const adminClient = createAdminClient();

      const { data: trackable, error: trackableError } = await adminClient
        .from("trackables")
        .select("id, name, entity_type, tracker_type, hardware_imei, account_id")
        .eq("id", id)
        .single();

      if (trackableError || !trackable) {
        return { trackable: null, locations: [] };
      }

      const { data: locations, error: locationsError } = await adminClient
        .from("location_logs_with_coords")
        .select("id, latitude, longitude, speed, battery_level, created_at")
        .eq("trackable_id", id)
        .order("created_at", { ascending: false })
        .limit(50);

      return { trackable, locations: locations || [] };
    },
    ['track-data'],
    { revalidate: 10, tags: ['track'] }
  );

  const { trackable, locations } = await getCachedTrackData(trackableId);

  if (!trackable) {
    console.error("Trackable not found");
    redirect("/dashboard");
  }

  // Format trackable details for typed output
  const trackableInfo = {
    id: trackable.id,
    name: trackable.name,
    entity_type: trackable.entity_type as "person" | "vehicle" | "asset",
    tracker_type: trackable.tracker_type as "app" | "hardware",
    hardware_imei: trackable.hardware_imei,
  };

  const initialLogs = (locations || []).map((loc) => ({
    id: Number(loc.id),
    latitude: Number(loc.latitude),
    longitude: Number(loc.longitude),
    speed: loc.speed !== null ? Number(loc.speed) : null,
    battery_level: loc.battery_level !== null ? Number(loc.battery_level) : null,
    created_at: loc.created_at,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Mini top bar header */}
      <header className="h-[64px] border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-[#12121a]/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="font-semibold text-white tracking-wide text-sm">Real-time Location Console</span>
        </div>
        <div className="text-xs text-[#94a3b8]">
          Signal Status: <span className="text-emerald-400 font-semibold">Online</span>
        </div>
      </header>

      {/* Interactive view container */}
      <TrackingView trackable={trackableInfo} initialLogs={initialLogs} />
    </div>
  );
}
