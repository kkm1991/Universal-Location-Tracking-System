// ---------------------------------------------------------------------------
// Database Schema Types – Universal Location Tracking System
// ---------------------------------------------------------------------------

/** Roles within a tenant account */
export type AccountType = 'child' | 'parent' | 'admin';

/** Physical classification of a tracked entity */
export type EntityType = 'person' | 'vehicle' | 'asset';

/** How location data is sourced */
export type TrackerType = 'app' | 'hardware';

// ---------------------------------------------------------------------------
// Core table interfaces
// ---------------------------------------------------------------------------

/** Row in the `accounts` table (maps 1-to-1 with auth.users via id) */
export interface Account {
  id: string;
  name: string;
  account_type: AccountType;
  created_at: string;
}

/** Row in the `trackables` table */
export interface Trackable {
  id: string;
  account_id: string;
  name: string;
  entity_type: EntityType;
  tracker_type: TrackerType;
  hardware_imei: string | null;
  created_at: string;
}

/** Row in the `location_logs` table – parsed coordinates */
export interface LocationLog {
  id: number;
  trackable_id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  battery_level: number | null;
  created_at: string;
}

/**
 * Raw row coming out of PostGIS before coordinate extraction.
 * `coordinates` is the WKT / GeoJSON string representation of the point.
 */
export interface LocationLogRaw {
  id: number;
  trackable_id: string;
  coordinates: string;
  speed: number | null;
  battery_level: number | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Composite / view types
// ---------------------------------------------------------------------------

/** Trackable enriched with the most recent known location (nullable). */
export interface TrackableWithLastLocation extends Trackable {
  last_latitude?: number | null;
  last_longitude?: number | null;
  last_speed?: number | null;
  last_battery_level?: number | null;
  last_location_at?: string | null;
}

// ---------------------------------------------------------------------------
// Helper – Supabase-compatible generic row type
// ---------------------------------------------------------------------------

/** Union of every table row type for generic helpers */
export type DatabaseRow = Account | Trackable | LocationLog | LocationLogRaw;
