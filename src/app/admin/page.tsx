import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UserTable from "@/components/UserTable";

export const dynamic = "force-dynamic";

export default async function AdminPanel() {
  const supabase = await createClient();

  // double check security in page
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the account to verify admin role (use admin client to bypass RLS)
  const adminClient = createAdminClient();
  const { data: currentAccount } = await adminClient
    .from("accounts")
    .select("account_type")
    .eq("id", user.id)
    .single();

  if (!currentAccount || currentAccount.account_type !== "admin") {
    redirect("/forbidden");
  }

  // Fetch accounts from db
  const { data: dbAccounts, error: dbError } = await adminClient
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbError) {
    console.error("DB Fetch Error:", dbError);
    throw new Error("Failed to load user accounts from database");
  }

  // Fetch user auth list to get email and avatar
  const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();

  if (authError) {
    console.error("Auth Fetch Error:", authError);
    throw new Error("Failed to load user authentication data");
  }

  // Merge database accounts with auth user records
  const usersList = dbAccounts.map((account) => {
    const authUser = authUsers.users.find((u) => u.id === account.id);
    return {
      id: account.id,
      name: account.name || "Unknown",
      account_type: account.account_type,
      created_at: account.created_at,
      email: authUser?.email || null,
      avatar_url: authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null,
    };
  });

  // Calculate statistics
  const totalUsers = usersList.length;
  const adminCount = usersList.filter((u) => u.account_type === "admin").length;
  const parentCount = usersList.filter((u) => u.account_type === "parent").length;
  const childCount = usersList.filter((u) => u.account_type === "child").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-xs text-[#94a3b8]">Manage system users and change membership roles.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-[#12121a]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">Total Accounts</span>
          <span className="text-3xl font-extrabold text-white mt-2">{totalUsers}</span>
        </div>

        {/* Admins */}
        <div className="bg-[#12121a]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">System Admins</span>
          <span className="text-3xl font-extrabold text-purple-400 mt-2">{adminCount}</span>
        </div>

        {/* Parents */}
        <div className="bg-[#12121a]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Parent Managers</span>
          <span className="text-3xl font-extrabold text-emerald-400 mt-2">{parentCount}</span>
        </div>

        {/* Children */}
        <div className="bg-[#12121a]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Trackable Children</span>
          <span className="text-3xl font-extrabold text-blue-400 mt-2">{childCount}</span>
        </div>
      </div>

      {/* User Management Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Registered Accounts</h2>
        <UserTable users={usersList} currentUserId={user.id} />
      </div>
    </div>
  );
}
