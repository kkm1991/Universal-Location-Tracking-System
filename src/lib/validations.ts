// ---------------------------------------------------------------------------
// Zod Validation Schemas – Universal Location Tracking System
// ---------------------------------------------------------------------------

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const uuidString = z.string().uuid();

const latitude = z
  .number()
  .min(-90, 'Latitude must be ≥ -90')
  .max(90, 'Latitude must be ≤ 90');

const longitude = z
  .number()
  .min(-180, 'Longitude must be ≥ -180')
  .max(180, 'Longitude must be ≤ 180');

// ---------------------------------------------------------------------------
// trackLocationSchema
// ---------------------------------------------------------------------------

/**
 * Validates an incoming location report from either the mobile app
 * (identified by `trackable_id`) or a hardware tracker (identified by
 * `hardware_imei`).  At least one identifier must be supplied.
 */
export const trackLocationSchema = z
  .object({
    trackable_id: uuidString.optional(),
    hardware_imei: z.string().min(1, 'IMEI must not be empty').optional(),
    latitude,
    longitude,
    speed: z.number().min(0, 'Speed must be ≥ 0').optional(),
    battery_level: z
      .number()
      .min(0, 'Battery level must be ≥ 0')
      .max(100, 'Battery level must be ≤ 100')
      .optional(),
  })
  .refine((data) => data.trackable_id || data.hardware_imei, {
    message: 'Either trackable_id or hardware_imei must be provided',
    path: ['trackable_id'],
  });

/** Inferred type for a validated location payload */
export type TrackLocationInput = z.infer<typeof trackLocationSchema>;

// ---------------------------------------------------------------------------
// createTrackableSchema
// ---------------------------------------------------------------------------

/**
 * Validates the payload when a parent/admin creates a new trackable entity.
 * If `tracker_type` is `"hardware"`, `hardware_imei` becomes required.
 */
export const createTrackableSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be 100 characters or fewer'),
    entity_type: z.enum(['person', 'vehicle', 'asset'], {
      errorMap: () => ({ message: 'Entity type must be person, vehicle, or asset' }),
    }),
    tracker_type: z.enum(['app', 'hardware'], {
      errorMap: () => ({ message: 'Tracker type must be app or hardware' }),
    }),
    hardware_imei: z.string().min(1, 'IMEI must not be empty').optional(),
  })
  .refine(
    (data) => {
      if (data.tracker_type === 'hardware') {
        return !!data.hardware_imei;
      }
      return true;
    },
    {
      message: 'hardware_imei is required when tracker_type is "hardware"',
      path: ['hardware_imei'],
    },
  );

/** Inferred type for a validated create-trackable payload */
export type CreateTrackableInput = z.infer<typeof createTrackableSchema>;

// ---------------------------------------------------------------------------
// updateRoleSchema
// ---------------------------------------------------------------------------

/**
 * Validates a role-change request issued by an admin.
 * Only `child` ↔ `parent` transitions are permitted through this schema;
 * promoting to `admin` requires a separate, more privileged flow.
 */
export const updateRoleSchema = z.object({
  user_id: uuidString,
  new_role: z.enum(['child', 'parent'], {
    errorMap: () => ({ message: 'Role must be child or parent' }),
  }),
});

/** Inferred type for a validated role-update payload */
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
