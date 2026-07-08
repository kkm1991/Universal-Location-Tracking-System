// ---------------------------------------------------------------------------
// Add Trackable Page – Server Component
// ---------------------------------------------------------------------------

import Link from 'next/link';
import AddTrackableForm from '@/components/AddTrackableForm';

export default function AddTrackablePage() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#94a3b8] transition-colors hover:bg-white/[0.08] hover:text-white"
          aria-label="Back to dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f1f5f9]">
            Add New Trackable
          </h1>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Register a person, vehicle, or asset for location tracking.
          </p>
        </div>
      </div>

      {/* Form */}
      <AddTrackableForm />
    </div>
  );
}
