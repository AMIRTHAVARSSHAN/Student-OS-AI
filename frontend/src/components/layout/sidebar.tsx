'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckCircle2, 
  BookOpen, 
  GraduationCap,
  Sparkles,
  Settings,
  BarChart3,
  Brain,
  Shield,
  X,
  Plus,
  ChevronRight,
  Layers,
  Users
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { clsx } from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, user } = useAppStore();

  const { data: profile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me/profile');
      return res.data;
    },
  });

  const { data: sessions } = useQuery({
    queryKey: ['tutor_sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/tutor/sessions');
      return res.data || [];
    },
  });

  const isAdmin = Boolean(profile?.is_admin || user?.is_admin || user?.email === 'admin2009@gmail.com');

  const baseNavItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tutor', label: 'Tutor AI Brain', icon: Brain },
    { href: '/connect', label: 'ScholarConnect', icon: Users },
    { href: '/study-plan', label: 'Study Plan', icon: CalendarDays },
    { href: '/attendance', label: 'Attendance', icon: CheckCircle2 },
    { href: '/notes', label: 'Notes & Vault', icon: BookOpen },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const navItems = isAdmin
    ? [...baseNavItems, { href: '/admin', label: 'Admin Panel', icon: Shield }]
    : baseNavItems;

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && sidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity animate-in fade-in"
        />
      )}

      {/* Primary ScholarOS Unified Sidebar */}
      <aside
        className={clsx(
          'w-64 border-r border-[var(--border-default)] bg-[var(--surface-1)] flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 ease-in-out z-50 shrink-0',
          // Desktop toggle
          sidebarOpen ? 'flex' : 'hidden md:flex',
          // Mobile slide-over drawer behavior
          sidebarOpen ? 'fixed left-0 top-0 h-full flex !flex' : 'hidden'
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header & Logo */}
          <div className="p-4 md:p-5 flex items-center justify-between border-b border-[var(--border-default)] shrink-0">
            <Link href="/" onClick={handleNavClick} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-extrabold text-base leading-tight tracking-tight text-white flex items-center gap-1.5">
                  ScholarOS
                  {isAdmin && (
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      ADMIN
                    </span>
                  )}
                </h1>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" /> Academic OS
                </span>
              </div>
            </Link>

            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[var(--surface-2)] transition"
              title="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                        : item.href === '/admin'
                        ? 'text-rose-300 hover:text-white hover:bg-rose-500/10 font-bold border border-rose-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-[var(--surface-2)]'
                    )}
                  >
                    <Icon className={clsx('w-4 h-4', isActive ? 'text-white' : item.href === '/admin' ? 'text-rose-400' : 'text-indigo-400')} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Embedded Active Study Sessions Section */}
            <div className="pt-4 space-y-2 border-t border-[var(--border-default)] mt-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-indigo-400" /> Active Workspaces
                </span>
                <Link
                  href="/tutor"
                  onClick={handleNavClick}
                  className="p-1 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-600/20 text-[10px] font-bold"
                  title="Create Session"
                >
                  + New
                </Link>
              </div>

              <div className="space-y-1">
                {sessions && sessions.length > 0 ? (
                  sessions.slice(0, 5).map((sess: any) => {
                    const isSessActive = pathname === `/tutor/${sess.id}`;
                    return (
                      <Link
                        key={sess.id}
                        href={`/tutor/${sess.id}`}
                        onClick={handleNavClick}
                        className={clsx(
                          'w-full p-2.5 rounded-xl flex items-center justify-between text-xs transition border',
                          isSessActive
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-bold'
                            : 'bg-[var(--surface-2)] text-gray-400 border-transparent hover:border-white/10 hover:text-white'
                        )}
                      >
                        <div className="truncate pr-1">
                          <p className="truncate text-xs text-white font-medium">{sess.title}</p>
                          <span className="text-[9px] text-gray-400 block truncate font-mono">
                            {sess.chapter || 'General'}
                          </span>
                        </div>
                        <ChevronRight className={clsx('w-3 h-3 shrink-0', isSessActive ? 'text-indigo-400' : 'text-gray-600')} />
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-gray-500 px-2 py-1">No sessions created.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Settings Link */}
          <div className="p-3 border-t border-[var(--border-default)] bg-[var(--surface-1)] shrink-0">
            <Link
              href="/settings"
              onClick={handleNavClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[var(--surface-2)] transition-all"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              Settings & Profile
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
