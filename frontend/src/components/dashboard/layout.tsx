'use client';

import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, CheckCircle2, BookOpen, Bot, Brain } from 'lucide-react';
import { clsx } from 'clsx';

const mobileTabs = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/tutor', label: 'Tutor AI', icon: Brain },
  { href: '/study-plan', label: 'Plan', icon: CalendarDays },
  { href: '/attendance', label: 'Attendance', icon: CheckCircle2 },
  { href: '/notes', label: 'Notes', icon: BookOpen },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTutorWorkspace = pathname.startsWith('/tutor');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {!isTutorWorkspace && <Topbar />}
        <main className={clsx(
          'flex-1 flex flex-col min-w-0 h-full overflow-y-auto',
          !isTutorWorkspace && 'p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto'
        )}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Quick-Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[var(--surface-1)]/95 backdrop-blur-lg border-t border-[var(--border-default)] z-30 flex items-center justify-around px-2">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all',
                isActive ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-white'
              )}
            >
              <Icon className={clsx('w-4 h-4', isActive && 'scale-110 text-indigo-400')} />
              <span className="text-[9px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
