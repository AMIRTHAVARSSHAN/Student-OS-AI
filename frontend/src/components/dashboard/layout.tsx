'use client';

import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import CommandPalette from '@/components/CommandPalette';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, BookOpen, Brain, Settings, Users } from 'lucide-react';
import { clsx } from 'clsx';

const mobileTabs = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/tutor', label: 'Tutor', icon: Brain },
  { href: '/study-plan', label: 'Study Plan', icon: CalendarDays },
  { href: '/notes', label: 'Notes', icon: BookOpen },
  { href: '/connect', label: 'Connect', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTutorWorkspace = pathname.startsWith('/tutor');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white selection:bg-indigo-600 selection:text-white">
      <CommandPalette />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {!isTutorWorkspace && <Topbar />}
        <main className={clsx(
          'flex-1 flex flex-col min-w-0 h-full overflow-y-auto max-w-full overflow-x-hidden',
          !isTutorWorkspace ? 'p-3 sm:p-6 md:p-8 pb-28 md:pb-8 max-w-7xl w-full mx-auto' : 'pb-24 md:pb-0'
        )}>
          {children}
        </main>

        {/* Mobile Bottom Navigation Dock with Safe Area Padding & Touch Targets */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--surface-1)]/95 backdrop-blur-2xl border-t border-[var(--border-default)] z-50 flex items-center justify-around px-1 shadow-2xl pb-[env(safe-area-inset-bottom)]">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  'flex flex-col items-center justify-center gap-0.5 py-1 px-1.5 min-w-[48px] min-h-[48px] rounded-2xl transition-all duration-200 relative',
                  isActive ? 'text-indigo-300 font-bold bg-indigo-500/15 border border-indigo-500/30' : 'text-gray-400 hover:text-white'
                )}
              >
                <Icon className={clsx('w-4 h-4', isActive && 'scale-110 text-indigo-400')} />
                <span className="text-[9px] tracking-tight truncate max-w-[54px]">{tab.label}</span>

                {/* Floating Active Pill Indicator */}
                {isActive && (
                  <span className="absolute -top-1 w-2 h-1 bg-indigo-400 rounded-full shadow-lg shadow-indigo-500/50" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
