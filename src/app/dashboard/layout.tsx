// ---------------------------------------------------------------------------
// Dashboard Layout – Server Component
// ---------------------------------------------------------------------------

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Account } from '@/types/database';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // ---- Authenticate (always getUser, never getSession) --------------------
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // ---- Fetch account row (use admin client to bypass RLS) -----------------
  const adminClient = createAdminClient();
  const { data: account } = await adminClient
    .from('accounts')
    .select('*')
    .eq('id', user.id)
    .single<Account>();

  if (!account) {
    redirect('/login');
  }

  // Build a lightweight props object for the client nav component
  const navUser = {
    name: account.name,
    account_type: account.account_type,
    email: user.email ?? '',
    avatar_url: user.user_metadata?.avatar_url ?? '',
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      {/* Sidebar Navigation */}
      <DashboardNav user={navUser} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
