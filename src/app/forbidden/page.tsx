'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function ForbiddenPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    router.push('/login');
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* ── Ambient Background Gradients ─────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Top-left warm glow */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#ef4444]/[0.07] blur-[120px]" />
        {/* Bottom-right indigo glow */}
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#6366f1]/[0.07] blur-[120px]" />
        {/* Center subtle pulse */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef4444]/[0.04] blur-[150px] animate-pulse" />
      </div>

      {/* ── Floating Particles (decorative) ──────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#ef4444]/20"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              top: `${15 + i * 14}%`,
              left: `${10 + i * 15}%`,
              animation: `float-particle ${4 + i * 0.8}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* ── Main Card ────────────────────────────────────────────────── */}
      <div
        className={`relative z-10 w-full max-w-md px-4 transition-all duration-700 ease-out ${
          mounted
            ? 'translate-y-0 opacity-100'
            : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="rounded-2xl border border-white/[0.08] bg-[#12121a]/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* ── Animated Shield Icon ───────────────────────────────── */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="relative">
              {/* Outer ring pulse */}
              <div className="absolute inset-0 h-24 w-24 animate-ping rounded-full border-2 border-[#ef4444]/20" />
              {/* Inner ring */}
              <div className="absolute inset-2 h-20 w-20 animate-[spin_8s_linear_infinite] rounded-full border border-dashed border-[#ef4444]/30" />
              {/* Shield SVG */}
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg
                  className="h-12 w-12 animate-[shield-bob_3s_ease-in-out_infinite] text-[#ef4444] drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L3 7V12C3 17.25 6.75 22.13 12 23C17.25 22.13 21 17.25 21 12V7L12 2Z"
                    fill="currentColor"
                    fillOpacity="0.15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Lock keyhole */}
                  <circle
                    cx="12"
                    cy="11"
                    r="2"
                    fill="currentColor"
                    fillOpacity="0.8"
                  />
                  <rect
                    x="11"
                    y="12.5"
                    width="2"
                    height="3"
                    rx="0.5"
                    fill="currentColor"
                    fillOpacity="0.8"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ── 403 Badge ──────────────────────────────────────────── */}
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-[#ef4444]/20 bg-[#ef4444]/[0.08] px-4 py-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ef4444]" />
            <span className="text-xs font-semibold tracking-widest text-[#ef4444] uppercase">
              Error 403
            </span>
          </div>

          {/* ── Heading ────────────────────────────────────────────── */}
          <h1
            className={`mb-3 text-center text-3xl font-bold tracking-tight transition-all delay-200 duration-700 ease-out sm:text-4xl ${
              mounted
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            <span className="bg-gradient-to-r from-[#f1f5f9] via-[#ef4444] to-[#f1f5f9] bg-clip-text text-transparent">
              Access Denied
            </span>
          </h1>

          {/* ── Description ────────────────────────────────────────── */}
          <p
            className={`mb-8 text-center text-sm leading-relaxed text-[#94a3b8] transition-all delay-300 duration-700 ease-out sm:text-base ${
              mounted
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            You don&apos;t have permission to access this page.
            <br />
            <span className="text-[#64748b]">
              Contact your administrator if you believe this is an error.
            </span>
          </p>

          {/* ── Divider ────────────────────────────────────────────── */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <div className="h-1 w-1 rounded-full bg-[#ef4444]/40" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          {/* ── Action Buttons ─────────────────────────────────────── */}
          <div
            className={`flex flex-col gap-3 transition-all delay-[400ms] duration-700 ease-out sm:flex-row ${
              mounted
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            {/* Go to Dashboard */}
            <button
              onClick={() => router.push('/dashboard')}
              className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366f1]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#6366f1]/30 active:scale-[0.98]"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#818cf8] to-[#6366f1] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
                  />
                </svg>
                Go to Dashboard
              </span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="group flex-1 rounded-xl border border-white/[0.08] bg-[#1a1a2e]/50 px-6 py-3 text-sm font-semibold text-[#94a3b8] backdrop-blur-sm transition-all duration-300 hover:border-[#ef4444]/30 hover:bg-[#ef4444]/[0.06] hover:text-[#f1f5f9] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </span>
            </button>
          </div>
        </div>

        {/* ── Footer Text ──────────────────────────────────────────── */}
        <p className="mt-6 text-center text-xs text-[#475569]">
          Universal Location Tracking System
        </p>
      </div>

      {/* ── Keyframe Animations ──────────────────────────────────────── */}
      <style jsx>{`
        @keyframes shield-bob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes float-particle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          100% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
