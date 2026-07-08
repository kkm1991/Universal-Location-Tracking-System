// ---------------------------------------------------------------------------
// Login Page – Server Component
// ---------------------------------------------------------------------------
// Checks authentication on the server; redirects to /dashboard if the user
// is already signed in.  Otherwise renders the premium login UI.
// ---------------------------------------------------------------------------

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export const metadata = {
  title: 'Sign In — Universal Tracker',
  description: 'Sign in to track people, vehicles, and assets in real-time.',
};

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const errorParam = resolvedSearchParams.error as string;
  const detailsParam = resolvedSearchParams.details as string;

  // ── Server-side auth check ────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only redirect if user is authenticated AND there is no error
  // (If the middleware sent us here with an error, don't bounce back to /dashboard
  //  or we'll create an infinite redirect loop that crashes the browser)
  if (user && !errorParam) {
    redirect('/dashboard');
  }

  // ── Render login UI ───────────────────────────────────────────────────
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] font-sans">
      {/* ── Animated Gradient Background ─────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Primary blob */}
        <div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full
                     bg-gradient-to-br from-[#6366f1]/30 to-[#22d3ee]/10
                     blur-[120px] animate-pulse"
          style={{ animationDuration: '6s' }}
        />
        {/* Secondary blob */}
        <div
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full
                     bg-gradient-to-tl from-[#6366f1]/20 to-purple-700/10
                     blur-[140px] animate-pulse"
          style={{ animationDuration: '8s', animationDelay: '2s' }}
        />
        {/* Tertiary accent blob */}
        <div
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2
                     rounded-full bg-[#22d3ee]/5 blur-[100px] animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '4s' }}
        />
      </div>

      {/* ── Glassmorphism Card ────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full max-w-md animate-float rounded-2xl
                   border border-white/10 bg-white/[0.05] p-8
                   shadow-2xl shadow-black/40 backdrop-blur-xl
                   sm:p-10"
      >
        {/* Glow ring behind the card */}
        <div
          className="pointer-events-none absolute -inset-px -z-10 rounded-2xl
                     bg-gradient-to-b from-[#6366f1]/20 via-transparent to-[#22d3ee]/10
                     opacity-60"
        />

        {/* ── Branding ─────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Location Pin Icon */}
          <div className="mb-4 flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="Brand Logo" 
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#22d3ee] shadow-lg shadow-[#6366f1]/25">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#f1f5f9]">
            Universal Tracker
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
            Track people, vehicles, and assets in real-time
          </p>
        </div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-xs font-medium uppercase tracking-widest text-[#94a3b8]/60">
            continue with
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* ── Google Sign-In ───────────────────────────────────────── */}
        {errorParam && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-400 border border-red-500/20">
            {errorParam === 'auth' ? 'Authentication failed.' 
             : errorParam === 'account_not_found' ? 'Your account could not be found or initialized.'
             : errorParam === 'no-code' ? 'Invalid login request (missing code).'
             : 'An error occurred during sign in.'}
            {detailsParam && (
              <div className="mt-1 text-xs opacity-80">
                Reason: {detailsParam}
              </div>
            )}
          </div>
        )}
        <GoogleSignInButton />

        {/* ── Footer ───────────────────────────────────────────────── */}
        <p className="mt-8 text-center text-xs text-[#94a3b8]/40">
          Secured by{' '}
          <span className="font-medium text-[#94a3b8]/60">Supabase</span>
        </p>
      </div>

      {/* ── Floating Animation Keyframes ─────────────────────────────── */}
      {/* Injected via a <style> tag so we can use custom @keyframes.      */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50%      { transform: translateY(-10px); }
            }
            .animate-float {
              animation: float 5s ease-in-out infinite;
            }
          `,
        }}
      />
    </main>
  );
}
