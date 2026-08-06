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
  FileText,
  Bot,
  Shield,
  X
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

  const isAdmin = Boolean(profile?.is_admin || user?.is_admin || user?.email === 'admin2009@gmail.com');

  const baseNavItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/study-plan', label: 'Study Plan', icon: CalendarDays },
    { href: '/attendance', label: 'Attendance', icon: CheckCircle2 },
    { href: '/notes', label: 'Notes & OCR', icon: BookOpen },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/pdf', label: 'PDF & RAG Vault', icon: FileText },
    { href: '/ai', label: 'Scholar AI', icon: Bot },
  ];

  const navItems = isAdmin
    ? [...baseNavItems, { href: '/admin', label: 'Admin Control Panel', icon: Shield }]
    : baseNavItems;

  const handleNavClick = () => {
    // Close sidebar on mobile navigation
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

      {/* Sidebar Navigation */}
      <aside
        className={clsx(
          'w-64 border-r border-[var(--border-default)] bg-[var(--surface-1)] flex flex-col justify-between h-screen sticky top-0 transition-transform duration-300 ease-in-out z-50',
          // Desktop behavior
          'hidden md:flex',
          // Mobile slide-over drawer behavior
          sidebarOpen ? 'fixed left-0 top-0 h-full flex !flex' : 'hidden'
        )}
      >
        <div>
          {/* Header & Logo */}
          <div className="p-5 md:p-6 flex items-center justify-between border-b border-[var(--border-default)]">
            <Link href="/" onClick={handleNavClick} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                  ScholarOS
                  {isAdmin && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      ADMIN
                    </span>
                  )}
                </h1>
                <span className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> One AI Brain
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[var(--surface-2)] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-indigo-600/25 font-semibold'
                      : item.href === '/admin'
                      ? 'text-rose-300 hover:text-white hover:bg-rose-500/10 font-bold border border-rose-500/20'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-2)]'
                  )}
                >
                  <Icon className={clsx('w-5 h-5', isActive ? 'text-white' : item.href === '/admin' ? 'text-rose-400' : 'text-indigo-400')} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Settings Link */}
        <div className="p-4 border-t border-[var(--border-default)] bg-[var(--surface-1)]">
          <Link
            href="/settings"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-2)] transition-all"
          >
            <Settings className="w-5 h-5 text-indigo-400" />
            Settings & Profile
          </Link>
        </div>
      </aside>
    </>
  );
}
