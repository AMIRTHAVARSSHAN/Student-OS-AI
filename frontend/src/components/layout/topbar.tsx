'use client';

import Link from 'next/link';
import { useAppStore } from '@/stores/app-store';
import { Menu, Search, User as UserIcon, Sparkles } from 'lucide-react';

export default function Topbar() {
  const { toggleSidebar, user } = useAppStore();

  return (
    <header className="h-16 border-b border-[var(--border-default)] bg-[var(--surface-1)]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-2)] transition border border-[var(--border-default)] md:border-transparent"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search notes, subjects, exams... (Cmd + K)"
            className="bg-[var(--surface-2)] border border-[var(--border-default)] text-xs rounded-xl pl-9 pr-4 py-2.5 w-72 lg:w-96 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition"
          />
        </div>

        {/* Mobile App Branding */}
        <div className="flex md:hidden items-center gap-2">
          <span className="font-extrabold text-base text-white tracking-tight">ScholarOS</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> AI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Profile Avatar linked to Settings Page */}
        <Link
          href="/settings"
          title="Profile & Academic Settings"
          className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-full hover:bg-[var(--surface-2)] transition group border border-transparent hover:border-indigo-500/30"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.fullName || 'User'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-indigo-500/40 group-hover:border-indigo-400 transition"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md group-hover:scale-105 transition-transform">
              {user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
            </div>
          )}
          <span className="hidden sm:inline text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-400 transition">
            {user?.fullName || 'Academic Profile'}
          </span>
        </Link>
      </div>
    </header>
  );
}
