// ---------------------------------------------------------------------------
// Supabase Server Client – runs in Server Components, Route Handlers, Actions
// ---------------------------------------------------------------------------

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates an authenticated Supabase client for server-side usage.
 *
 * Must be called inside an `async` context (Server Components, Route Handlers,
 * or Server Actions) because `cookies()` returns a `Promise` in Next.js 15+.
 *
 * **Important:** Always use `supabase.auth.getUser()` instead of
 * `supabase.auth.getSession()` on the server to revalidate the JWT.
 *
 * **Usage:**
 * ```ts
 * const supabase = await createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` is called from Server Components where the response
            // headers are read-only.  The middleware will pick up the
            // refreshed tokens on the next request, so this is safe to
            // swallow.
          }
        },
      },
    },
  );
}
