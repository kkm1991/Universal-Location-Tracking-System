'use client';

// ---------------------------------------------------------------------------
// DashboardNav – Collapsible sidebar navigation
// ---------------------------------------------------------------------------

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AccountType } from '@/types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavUser {
  name: string;
  account_type: AccountType;
  email: string;
  avatar_url: string;
}

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------

const GridIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CollapseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="11 17 6 12 11 7" />
    <polyline points="18 17 13 12 18 7" />
  </svg>
);

// ---------------------------------------------------------------------------
// Navigation links
// ---------------------------------------------------------------------------

const NAV_LINKS: NavLink[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <GridIcon />,
  },
  {
    label: 'Add Trackable',
    href: '/dashboard/add-trackable',
    icon: <PlusIcon />,
  },
  {
    label: 'Admin Panel',
    href: '/admin',
    icon: <ShieldIcon />,
    adminOnly: true,
  },
];

// ---------------------------------------------------------------------------
// Role badge
// ---------------------------------------------------------------------------

function RoleBadge({ role }: { role: AccountType }) {
  const map: Record<AccountType, { bg: string; text: string; label: string }> =
    {
      admin: {
        bg: 'bg-indigo-500/20',
        text: 'text-indigo-400',
        label: 'Admin',
      },
      parent: {
        bg: 'bg-cyan-500/20',
        text: 'text-cyan-400',
        label: 'Parent',
      },
      child: {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        label: 'Child',
      },
    };

  const style = map[role];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // ---- Helpers ------------------------------------------------------------

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // ---- Filter links by role -----------------------------------------------

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.adminOnly || user.account_type === 'admin',
  );

  // ---- Shared sidebar content builder -------------------------------------

  const sidebarContent = (isMobile: boolean) => {
    const wide = isMobile || !collapsed;

    return (
      <div className="flex h-full flex-col justify-between">
        {/* ---- Top: Logo + Nav ---- */}
        <div>
          {/* Logo */}
          <div className="flex items-center justify-center   ">
            {/* Brand mark */}
            <div className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg transition-all duration-300 ${wide ? 'h-60 w-60' : 'h-14 w-14'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="Brand Logo" 
                className="h-full w-full object-contain"
              />
              <div className="hidden flex h-full w-full flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={wide ? 48 : 24}
                  height={wide ? 48 : 24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className=" border-t border-white/[0.06]" />

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1 px-3">
            {visibleLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-indigo-500/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                      : 'text-[#94a3b8] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-500" />
                  )}

                  <span
                    className={`flex-shrink-0 ${
                      active ? 'text-indigo-400' : 'text-[#94a3b8] group-hover:text-white'
                    } transition-colors`}
                  >
                    {link.icon}
                  </span>

                  {wide && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ---- Bottom: User profile + sign out ---- */}
        <div className="space-y-2 px-3 pb-4">
          {/* Divider */}
          <div className="mx-1 border-t border-white/[0.06]" />

          {/* User card */}
          <div
            className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
              wide ? '' : 'justify-center'
            }`}
          >
            {/* Avatar */}
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="h-8 w-8 flex-shrink-0 rounded-full ring-2 ring-white/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {wide && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user.name}
                </p>
                <RoleBadge role={user.account_type} />
              </div>
            )}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 ${
              wide ? '' : 'justify-center'
            }`}
          >
            <LogOutIcon className="flex-shrink-0" />
            {wide && <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>}
          </button>
        </div>
      </div>
    );
  };

  // ---- Render -------------------------------------------------------------

  return (
    <>
      {/* ---- Mobile: hamburger toggle ---- */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-[#12121a] p-2 text-white shadow-lg md:hidden"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      {/* ---- Mobile: overlay sidebar ---- */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#12121a] shadow-2xl md:hidden">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-[#94a3b8] hover:text-white"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>

            {sidebarContent(true)}
          </aside>
        </>
      )}

      {/* ---- Desktop: persistent sidebar ---- */}
      <aside
        className={`relative hidden border-r border-white/[0.08] bg-[#12121a] transition-all duration-300 ease-in-out md:flex md:flex-col ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent(false)}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#12121a] text-[#94a3b8] shadow-md transition-colors hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <CollapseIcon
            className={`h-3.5 w-3.5 transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </aside>
    </>
  );
}
