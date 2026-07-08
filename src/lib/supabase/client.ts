// ---------------------------------------------------------------------------
// Supabase Browser Client – runs in Client Components
// ---------------------------------------------------------------------------

import { createBrowserClient } from '@supabase/ssr';

/**
 * Returns a Supabase client suitable for use inside `"use client"` components.
 *
 * The client automatically handles cookie-based auth token storage and
 * refresh in the browser environment.
 *
 * **Usage:**
 * ```ts
 * const supabase = createClient();
 * const { data } = await supabase.from('trackables').select('*');
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
