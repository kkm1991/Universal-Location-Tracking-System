"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface LocationUpdate {
  id: string;
  lat: number;
  lng: number;
  speed?: number;
  battery_level?: number;
  updated_at: string;
}

interface RealtimeLocationProviderProps {
  trackableIds: string[];
  onLocationUpdate: (update: LocationUpdate) => void;
  children: React.ReactNode;
}

// Decodes PostGIS EWKB Point hex string (SRID 4326) to { lat, lng }
function parseCoordinates(coordString: string): { lat: number; lng: number } | null {
  if (!coordString) return null;

  // Handle standard WKT if returned: POINT(lng lat)
  if (coordString.startsWith("POINT")) {
    const match = coordString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
  }

  // Handle EWKB hex representation
  try {
    const hex = coordString.toLowerCase();
    if (hex.length < 42) return null;

    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);

    const hasSRID = hex.substring(10, 12) === "20";
    const xOffset = hasSRID ? 18 : 10;
    const yOffset = xOffset + 16;

    for (let i = 0; i < 8; i++) {
      view.setUint8(i, parseInt(hex.substring(xOffset + i * 2, xOffset + (i + 1) * 2), 16));
    }
    const lng = view.getFloat64(0, true);

    for (let i = 0; i < 8; i++) {
      view.setUint8(i, parseInt(hex.substring(yOffset + i * 2, yOffset + (i + 1) * 2), 16));
    }
    const lat = view.getFloat64(0, true);

    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  } catch (e) {
    console.error("Failed to parse PostGIS coordinates:", e);
    return null;
  }
}

// Singleton supabase client – created once for entire app lifecycle
let singletonClient: ReturnType<typeof createClient> | null = null;
function getSupabaseClient() {
  if (!singletonClient) {
    singletonClient = createClient();
  }
  return singletonClient;
}

export default function RealtimeLocationProvider({
  trackableIds,
  onLocationUpdate,
  children,
}: RealtimeLocationProviderProps) {
  // Store callback in a ref so the useEffect never re-runs when it changes
  const callbackRef = useRef(onLocationUpdate);
  callbackRef.current = onLocationUpdate;

  // Store trackableIds as a stable string key
  const idsKey = trackableIds.join(",");

  useEffect(() => {
    if (!idsKey) return;

    const supabase = getSupabaseClient();
    const ids = idsKey.split(",");
    const lastUpdateTimes = new Map<string, number>();

    const channels = ids.map((id) => {
      const channel = supabase
        .channel(`trackable:${id}`)
        .on(
          "broadcast",
          { event: "location_update" },
          (payload) => {
            console.log("Location broadcast received:", payload);
            const now = Date.now();
            const lastUpdate = lastUpdateTimes.get(id) || 0;

            // Throttle: max once per 800ms
            if (now - lastUpdate < 800) return;
            lastUpdateTimes.set(id, now);

            const record = payload.payload;
            if (record && record.lat !== undefined && record.lng !== undefined) {
              callbackRef.current({
                id: record.id,
                lat: record.lat,
                lng: record.lng,
                speed: record.speed,
                battery_level: record.battery_level,
                updated_at: record.updated_at,
              });
            } else {
              console.warn("Invalid broadcast payload:", record);
            }
          }
        )
        .subscribe();

      return channel;
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [idsKey]); // ONLY re-run when the tracked IDs actually change

  return <>{children}</>;
}
