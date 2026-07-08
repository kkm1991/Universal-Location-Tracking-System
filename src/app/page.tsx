// ---------------------------------------------------------------------------
// Root Page – Auth Gate
// ---------------------------------------------------------------------------

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * The root `/` page acts as an authentication gate:
 * - Authenticated users → `/dashboard`
 * - Unauthenticated users → `/login`
 *
 * This is a Server Component so we can safely call `getUser()`.
 */
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  redirect('/login');
}
