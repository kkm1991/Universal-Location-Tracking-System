'use client';

// ---------------------------------------------------------------------------
// AddTrackableForm – Premium dark form for creating a trackable entity
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createTrackableSchema } from '@/lib/validations';
import type { EntityType, TrackerType } from '@/types/database';

// ---------------------------------------------------------------------------
// Entity type config
// ---------------------------------------------------------------------------

const ENTITY_TYPES: {
  value: EntityType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'person',
    label: 'Person',
    description: 'Track a family member or individual',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
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
  {
    value: 'vehicle',
    label: 'Vehicle',
    description: 'Track a car, truck, or motorcycle',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
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
  {
    value: 'asset',
    label: 'Asset',
    description: 'Track equipment, packages, or valuables',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
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
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AddTrackableForm() {
  const router = useRouter();


  // ---- Form state ---------------------------------------------------------
  const [name, setName] = useState('');
  const [entityType, setEntityType] = useState<EntityType>('person');
  const [trackerType, setTrackerType] = useState<TrackerType>('app');
  const [hardwareImei, setHardwareImei] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---- Submit handler -----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    // Build payload
    const payload = {
      name: name.trim(),
      entity_type: entityType,
      tracker_type: trackerType,
      ...(trackerType === 'hardware' ? { hardware_imei: hardwareImei.trim() } : {}),
    };

    // Validate with Zod
    const result = createTrackableSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? '_';
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/trackables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.data.name,
          entity_type: result.data.entity_type,
          tracker_type: result.data.tracker_type,
          hardware_imei: result.data.hardware_imei ?? undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.error || 'Failed to create trackable');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      // Brief delay so the success toast is visible
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1200);
    } catch {
      setGlobalError('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  // ---- Render -------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ---- Success toast ---- */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p className="text-sm font-medium text-emerald-400">
            Trackable created successfully! Redirecting…
          </p>
        </div>
      )}

      {/* ---- Global error ---- */}
      {globalError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p className="text-sm font-medium text-red-400">{globalError}</p>
        </div>
      )}

      {/* ====== Name ====== */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-[#f1f5f9]"
        >
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mom's Car, Delivery Van #3"
          className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-3 text-white placeholder-[#64748b] outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
        )}
      </div>

      {/* ====== Entity Type (visual cards) ====== */}
      <div>
        <label className="mb-3 block text-sm font-medium text-[#f1f5f9]">
          Entity Type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {ENTITY_TYPES.map((et) => {
            const selected = entityType === et.value;
            return (
              <button
                key={et.value}
                type="button"
                onClick={() => setEntityType(et.value)}
                className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 ${
                  selected
                    ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.06]'
                }`}
              >
                {/* Selection dot */}
                {selected && (
                  <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
                )}

                <span
                  className={`${
                    selected ? 'text-indigo-400' : 'text-[#94a3b8] group-hover:text-white'
                  } transition-colors`}
                >
                  {et.icon}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    selected ? 'text-white' : 'text-[#94a3b8]'
                  }`}
                >
                  {et.label}
                </span>
                <span className="text-[11px] text-[#64748b]">
                  {et.description}
                </span>
              </button>
            );
          })}
        </div>
        {errors.entity_type && (
          <p className="mt-1.5 text-xs text-red-400">{errors.entity_type}</p>
        )}
      </div>

      {/* ====== Tracker Type (toggle) ====== */}
      <div>
        <label className="mb-3 block text-sm font-medium text-[#f1f5f9]">
          Tracker Type <span className="text-red-400">*</span>
        </label>
        <div className="inline-flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {(['app', 'hardware'] as TrackerType[]).map((type) => {
            const active = trackerType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setTrackerType(type)}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {type === 'app' ? '📱 App' : '📡 Hardware'}
              </button>
            );
          })}
        </div>
        {errors.tracker_type && (
          <p className="mt-1.5 text-xs text-red-400">{errors.tracker_type}</p>
        )}
      </div>

      {/* ====== IMEI (hardware only) ====== */}
      {trackerType === 'hardware' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label
            htmlFor="hardware_imei"
            className="mb-2 block text-sm font-medium text-[#f1f5f9]"
          >
            Hardware IMEI <span className="text-red-400">*</span>
          </label>
          <input
            id="hardware_imei"
            type="text"
            value={hardwareImei}
            onChange={(e) => setHardwareImei(e.target.value)}
            placeholder="e.g. 353456789012345"
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-3 text-white placeholder-[#64748b] outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="mt-1.5 text-xs text-[#64748b]">
            Enter the IMEI number found on your GPS hardware tracker.
          </p>
          {errors.hardware_imei && (
            <p className="mt-1 text-xs text-red-400">{errors.hardware_imei}</p>
          )}
        </div>
      )}

      {/* ====== Submit ====== */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting || success}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              {/* Spinner */}
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating…
            </>
          ) : (
            'Create Trackable'
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="rounded-xl px-5 py-3 text-sm font-medium text-[#94a3b8] transition-colors hover:text-white disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
