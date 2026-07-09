// ---------------------------------------------------------------------------
// OAuth Callback Route Handler
// ---------------------------------------------------------------------------
// After the user authenticates with Google, Supabase redirects here with a
// `code` query parameter.  We exchange that code for a session and redirect
// the user to the dashboard.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // ── Missing code ────────────────────────────────────────────────────────
  if (!code) {
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'no-code');
    return NextResponse.redirect(errorUrl);
  }

  // ── Exchange code for session ───────────────────────────────────────────
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] Code exchange failed:', error.message);
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'auth');
    errorUrl.searchParams.set('details', error.message);
    return NextResponse.redirect(errorUrl);
  }

  // ── Success – send to dashboard ─────────────────────────────────────────
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
