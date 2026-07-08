"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import MapView from "./MapView";
import RealtimeLocationProvider from "./RealtimeLocationProvider";

interface TrackableInfo {
  id: string;
  name: string;
  entity_type: "person" | "vehicle" | "asset";
  tracker_type: "app" | "hardware";
  hardware_imei: string | null;
}

interface LocationLogEntry {
  id: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  battery_level: number | null;
  created_at: string;
}

interface TrackingViewProps {
  trackable: TrackableInfo;
  initialLogs: LocationLogEntry[];
}

// Consider "online" if a signal was received within this many ms
const ONLINE_TIMEOUT_MS = 15_000;

export default function TrackingView({ trackable, initialLogs }: TrackingViewProps) {
  const [logs, setLogs] = useState<LocationLogEntry[]>(initialLogs);
  const [lastSignalAt, setLastSignalAt] = useState<number | null>(
    initialLogs.length > 0 ? new Date(initialLogs[0].created_at).getTime() : null
  );
  const [isOnline, setIsOnline] = useState(() => {
    if (initialLogs.length === 0) return false;
    return Date.now() - new Date(initialLogs[0].created_at).getTime() < ONLINE_TIMEOUT_MS;
  });
  const [secondsSinceLastSignal, setSecondsSinceLastSignal] = useState<number | null>(null);

  const latestLog = logs[0];

  // Stable array that only changes when trackable.id changes
  const trackableIds = useMemo(() => [trackable.id], [trackable.id]);

  const handleLocationUpdate = useCallback((update: {
    id: string;
    lat: number;
    lng: number;
    speed?: number;
    battery_level?: number;
    updated_at: string;
  }) => {
    const newLogEntry: LocationLogEntry = {
      id: Date.now(),
      latitude: update.lat,
      longitude: update.lng,
      speed: update.speed !== undefined ? update.speed : null,
      battery_level: update.battery_level !== undefined ? update.battery_level : null,
      created_at: update.updated_at,
    };
    setLogs((prev) => [newLogEntry, ...prev.slice(0, 49)]);
    setLastSignalAt(Date.now());
    setIsOnline(true);
  }, []);

  // Timer: check online/offline status every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSignalAt) {
        const elapsed = Date.now() - lastSignalAt;
        setSecondsSinceLastSignal(Math.floor(elapsed / 1000));
        setIsOnline(elapsed < ONLINE_TIMEOUT_MS);
      } else {
        setIsOnline(false);
        setSecondsSinceLastSignal(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSignalAt]);

  // Build markers
  const markers = useMemo(() => {
    if (!latestLog) return [];
    return [
      {
        id: trackable.id,
        name: trackable.name,
        lat: latestLog.latitude,
        lng: latestLog.longitude,
        speed: latestLog.speed || undefined,
        battery_level: latestLog.battery_level || undefined,
        entity_type: trackable.entity_type,
        updated_at: latestLog.created_at,
      },
    ];
  }, [
    trackable.id,
    trackable.name,
    trackable.entity_type,
    latestLog?.latitude,
    latestLog?.longitude,
    latestLog?.speed,
    latestLog?.battery_level,
    latestLog?.created_at,
  ]);

  // Format seconds to readable string
  const formatElapsed = (sec: number | null) => {
    if (sec === null) return "—";
    if (sec < 5) return "just now";
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    return `${hr}h ${min % 60}m ago`;
  };

  return (
    <RealtimeLocationProvider
      trackableIds={trackableIds}
      onLocationUpdate={handleLocationUpdate}
    >
      <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden">
        {/* Sidebar Status Panel */}
        <div className="w-full lg:w-80 bg-[#12121a] border-r border-white/5 flex flex-col h-full shrink-0">
          {/* Header */}
          <div className="p-5 border-b border-white/5 space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                  trackable.entity_type === "person"
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : trackable.entity_type === "vehicle"
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : "bg-amber-500/10 border border-amber-500/20"
                }`}
              >
                {trackable.entity_type === "person" ? (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : trackable.entity_type === "vehicle" ? (
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="font-bold text-white leading-tight">{trackable.name}</h2>
                <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-[#94a3b8] capitalize">
                  {trackable.tracker_type} Tracker
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Signal Status */}
          <div className="p-5 border-b border-white/5">
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
              isOnline
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}>
              <span className={`relative flex h-3 w-3`}>
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  isOnline ? "bg-emerald-500" : "bg-red-500"
                }`}></span>
              </span>
              <div className="flex-1">
                <span className={`text-sm font-bold ${isOnline ? "text-emerald-400" : "text-red-400"}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
                <span className="block text-[10px] text-[#94a3b8]">
                  {isOnline
                    ? `Signal received ${formatElapsed(secondsSinceLastSignal)}`
                    : lastSignalAt
                      ? `Last signal ${formatElapsed(secondsSinceLastSignal)}`
                      : "No signals received yet"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 p-5 border-b border-white/5 bg-white/[0.01]">
            <div className="bg-[#12121a] border border-white/5 rounded-xl p-3">
              <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Speed</span>
              <span className="text-base font-extrabold text-white mt-1 block">
                {latestLog && latestLog.speed !== null ? `${latestLog.speed.toFixed(1)} km/h` : "0 km/h"}
              </span>
            </div>
            <div className="bg-[#12121a] border border-white/5 rounded-xl p-3">
              <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Battery</span>
              <span className="text-base font-extrabold text-white mt-1 block">
                {latestLog && latestLog.battery_level !== null ? `${latestLog.battery_level}%` : "N/A"}
              </span>
            </div>
            <div className="bg-[#12121a] border border-white/5 rounded-xl p-3 col-span-2">
              <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Last Ping Received</span>
              <span className="text-xs font-semibold text-white mt-1 block font-mono">
                {latestLog ? new Date(latestLog.created_at).toLocaleTimeString() : "No signals received"}
              </span>
            </div>
          </div>

          {/* Location Trail Logs */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Location Trail</h3>
            {logs.length === 0 ? (
              <p className="text-xs text-[#94a3b8] py-8 text-center italic">Waiting for tracking signal...</p>
            ) : (
              <div className="space-y-2.5 font-mono text-xs">
                {logs.slice(0, 10).map((log, idx) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-colors ${
                      idx === 0
                        ? "bg-indigo-500/10 border-indigo-500/20 text-white"
                        : "bg-white/5 border-white/5 text-[#94a3b8] hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between font-bold text-[10px]">
                      <span>Signal #{logs.length - idx}</span>
                      <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#94a3b8]">
                      <span>{log.latitude.toFixed(5)}°, {log.longitude.toFixed(5)}°</span>
                      {log.speed !== null && <span>{log.speed.toFixed(1)} km/h</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Rendering Pane */}
        <div className="flex-1 h-full relative">
          <MapView markers={markers} zoom={14} />
        </div>
      </div>
    </RealtimeLocationProvider>
  );
}
