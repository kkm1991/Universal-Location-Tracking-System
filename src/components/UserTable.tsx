"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface UserAccount {
  id: string;
  name: string;
  email: string | null;
  account_type: "child" | "parent" | "admin";
  avatar_url: string | null;
  created_at: string;
}

interface UserTableProps {
  users: UserAccount[];
  currentUserId: string;
}

export default function UserTable({ users, currentUserId }: UserTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [modalUser, setModalUser] = useState<{
    id: string;
    name: string;
    newRole: "child" | "parent";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === "all" ? true : u.account_type === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: "child" | "parent") => {
    setError(null);
    try {
      const response = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          new_role: newRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update user role");
      }

      setModalUser(null);
      // Refresh the page data
      startTransition(() => {
        router.refresh();
      });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to update role");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-[#94a3b8]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#94a3b8] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-[#ffffff14] text-white text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
        >
          <option value="all" className="bg-[#12121a]">All Roles</option>
          <option value="admin" className="bg-[#12121a]">Admin</option>
          <option value="parent" className="bg-[#12121a]">Parent</option>
          <option value="child" className="bg-[#12121a]">Child</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Responsive Table */}
      <div className="bg-[#12121a]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-[#94a3b8] text-sm">
            No users found matching your filters.
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#94a3b8] bg-white/[0.01]">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Joined</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-[#f1f5f9]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img
                          src={u.avatar_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                          alt={u.name}
                          className="w-8 h-8 rounded-full border border-white/10"
                        />
                        <span className="font-semibold text-white">{u.name}</span>
                      </td>
                      <td className="py-4 px-6 text-[#94a3b8] font-mono text-xs">{u.email || "N/A"}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            u.account_type === "admin"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : u.account_type === "parent"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {u.account_type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#94a3b8] text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {u.id === currentUserId ? (
                          <span className="text-[#94a3b8] text-xs italic">You</span>
                        ) : u.account_type === "admin" ? (
                          <span className="text-[#94a3b8] text-xs italic">Cannot modify admin</span>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {u.account_type === "child" ? (
                              <button
                                onClick={() => setModalUser({ id: u.id, name: u.name, newRole: "parent" })}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                              >
                                Promote to Parent
                              </button>
                            ) : (
                              <button
                                onClick={() => setModalUser({ id: u.id, name: u.name, newRole: "child" })}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                              >
                                Demote to Child
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-5 space-y-4 hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                      alt={u.name}
                      className="w-10 h-10 rounded-full border border-white/10"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{u.name}</h4>
                      <p className="text-xs text-[#94a3b8] font-mono">{u.email || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-medium border ${
                        u.account_type === "admin"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : u.account_type === "parent"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {u.account_type}
                    </span>
                    <span className="text-[#94a3b8]">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                  </div>

                  {u.id !== currentUserId && u.account_type !== "admin" && (
                    <div className="pt-2 border-t border-white/5 flex justify-end">
                      {u.account_type === "child" ? (
                        <button
                          onClick={() => setModalUser({ id: u.id, name: u.name, newRole: "parent" })}
                          className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-center"
                        >
                          Promote to Parent
                        </button>
                      ) : (
                        <button
                          onClick={() => setModalUser({ id: u.id, name: u.name, newRole: "child" })}
                          className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-center"
                        >
                          Demote to Child
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm glass rounded-2xl border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-semibold text-white mb-2">Change User Role</h3>
            <p className="text-xs text-[#94a3b8] mb-6 leading-relaxed">
              Are you sure you want to change <span className="text-white font-medium">{modalUser.name}</span>'s role to{" "}
              <span className="text-indigo-400 font-semibold capitalize">{modalUser.newRole}</span>?
            </p>

            <div className="flex gap-2">
              <button
                disabled={isPending}
                onClick={() => setModalUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#94a3b8] text-xs font-semibold hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={() => handleRoleChange(modalUser.id, modalUser.newRole)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && (
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
