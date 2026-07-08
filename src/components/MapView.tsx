"use client";

import dynamic from "next/dynamic";
import React from "react";

interface MapViewProps {
  markers: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    speed?: number;
    battery_level?: number;
    entity_type?: "person" | "vehicle" | "asset";
    updated_at?: string;
  }>;
  center?: [number, number];
  zoom?: number;
}

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#12121a] rounded-2xl border border-white/5 relative overflow-hidden animate-pulse">
      <svg
        className="w-12 h-12 text-indigo-500/50 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
      <span className="text-[#94a3b8] text-sm">Loading real-time map...</span>
    </div>
  ),
});

export default function MapView(props: MapViewProps) {
  return <MapInner {...props} />;
}
