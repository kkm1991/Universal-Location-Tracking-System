// ---------------------------------------------------------------------------
// Supabase Admin Client – bypasses RLS (server-only, never expose to browser)
// ---------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client that uses the **service role** key, which bypasses
 * all Row Level Security policies.
 *
 * ⚠️  **This must NEVER be used in client-side code.**  The service role key
 * has full read/write access to every table.
 *
 * Use cases:
 * - Provisioning accounts during sign-up (before RLS context exists)
 * - Admin dashboards / cron jobs
 * - Webhook handlers that must write across tenants
 *
 * **Usage:**
 * ```ts
 * const admin = createAdminClient();
 * await admin.from('accounts').insert({ ... });
 * ```
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
        'Ensure they are defined in your .env.local file.',
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
