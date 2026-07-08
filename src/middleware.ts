import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Public routes that do not require authentication.
 * Any path starting with '/auth' is also considered public.
 */
const PUBLIC_ROUTES = new Set(['/', '/login']);

/**
 * Check if a route is public (no auth needed).
 */
function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  if (pathname.startsWith('/auth')) return true;
  // /api/track handles its own auth (API key or session) — skip middleware auth
  if (pathname.startsWith('/api/track')) return true;
  return false;
}

/**
 * Roles allowed per route prefix.
 * - /admin/* → only 'admin'
 * - /dashboard/* → 'parent' or 'admin'
 * - /api/track → any authenticated user (no role restriction)
 */
function getRequiredRoles(pathname: string): string[] | null {
  if (pathname.startsWith('/admin')) {
    return ['admin'];
  }
  if (pathname.startsWith('/dashboard')) {
    return ['parent', 'admin'];
  }
  // /api/track requires auth but any role
  if (pathname.startsWith('/api/track')) {
    return [];
  }
  return null;
}

export async function middleware(request: NextRequest) {
  // ─── 1. Create Supabase Response (for cookie forwarding) ───────────
  let supabaseResponse = NextResponse.next({
    request,
  });

  // ─── 2. Create Supabase Server Client with cookie handling ─────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          // Write cookies to the request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          // Recreate the response to carry forward the modified request
          supabaseResponse = NextResponse.next({
            request,
          });

          // Write cookies to the response (for the browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ─── 3. Refresh the auth session using getUser() ───────────────────
  // IMPORTANT: Always use getUser() instead of getSession() for server-side
  // auth. getUser() contacts the Supabase Auth server to revalidate the
  // Auth token, while getSession() does not. This is critical for security
  // as the session token could be tampered with by the client.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ─── 4. Allow public routes without auth ───────────────────────────
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  // ─── 5. Redirect unauthenticated users to /login ───────────────────
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── 6. Determine required roles for the route ─────────────────────
  const requiredRoles = getRequiredRoles(pathname);

  // If requiredRoles is null, the route doesn't have role restrictions
  // but still requires authentication (which we've already verified).
  if (requiredRoles === null) {
    return supabaseResponse;
  }

  // Empty array means any authenticated user is allowed (e.g., /api/track)
  if (requiredRoles.length === 0) {
    return supabaseResponse;
  }

  // ─── 7. Fetch account type from the accounts table ─────────────────
  // Use a direct fetch with the service role key to bypass RLS
  // (The user client triggers RLS which causes infinite recursion on accounts)
  const accountRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/accounts?id=eq.${user.id}&select=account_type`,
    {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    }
  );

  let account: { account_type: string } | null = null;
  let error: string | null = null;

  if (accountRes.ok) {
    const rows = await accountRes.json();
    account = rows.length > 0 ? rows[0] : null;
  } else {
    error = `HTTP ${accountRes.status}`;
  }

  if (error || !account) {
    console.error('[middleware] Failed to fetch account for user', user.id, 'Error:', error);
    // If we can't determine the role, redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('error', 'account_not_found');
    if (error) {
      loginUrl.searchParams.set('details', error);
    }
    return NextResponse.redirect(loginUrl);
  }

  // ─── 8. Check if user's role matches the required roles ────────────
  if (!requiredRoles.includes(account.account_type)) {
    const forbiddenUrl = request.nextUrl.clone();
    forbiddenUrl.pathname = '/forbidden';
    return NextResponse.redirect(forbiddenUrl);
  }

  // ─── 9. ALWAYS return supabaseResponse ─────────────────────────────
  // Never return a plain NextResponse.next() — it will break cookie
  // forwarding between the middleware and Server Components.
  return supabaseResponse;
}

// ─── Matcher Configuration ─────────────────────────────────────────────
// Exclude static files, images, favicon, and other non-page assets.
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - Common image/asset extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)',
  ],
};
