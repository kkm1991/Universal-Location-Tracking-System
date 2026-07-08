'use client';

// ---------------------------------------------------------------------------
// Google Sign-In Button – Client Component
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        throw authError;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        className="group relative flex w-full items-center justify-center gap-3
                   rounded-xl bg-white px-6 py-3.5 text-sm font-semibold
                   text-gray-800 shadow-lg shadow-white/5
                   transition-all duration-300 ease-out
                   hover:bg-gray-50 hover:shadow-xl hover:shadow-white/10
                   hover:scale-[1.02]
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-[#6366f1] focus-visible:ring-offset-2
                   focus-visible:ring-offset-[#0a0a0f]
                   disabled:cursor-not-allowed disabled:opacity-60
                   disabled:hover:scale-100"
      >
        {/* ── Loading Spinner ──────────────────────────────────────────── */}
        {isLoading ? (
          <svg
            className="h-5 w-5 animate-spin text-gray-500"
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
        ) : (
          /* ── Google Logo SVG ────────────────────────────────────────── */
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.42l3.66-2.84v-.49z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}

        <span>{isLoading ? 'Signing in…' : 'Sign in with Google'}</span>

        {/* Hover shimmer effect */}
        <div
          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r
                      from-transparent via-white/20 to-transparent
                      opacity-0 transition-opacity duration-500
                      group-hover:opacity-100"
          style={{ transform: 'translateX(-100%)' }}
        />
      </button>

      {/* ── Error Toast ──────────────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-500/20
                     bg-red-500/10 px-4 py-2.5 text-sm text-red-400
                     animate-in fade-in slide-in-from-top-1 duration-300"
          role="alert"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-400/60 transition-colors hover:text-red-400"
            aria-label="Dismiss error"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
