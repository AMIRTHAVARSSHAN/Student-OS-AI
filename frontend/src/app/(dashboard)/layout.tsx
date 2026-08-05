'use client';

import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, CheckCircle2, BookOpen, Bot } from 'lucide-react';
import { clsx } from 'clsx';

const mobileTabs = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/study-plan', label: 'Plan', icon: CalendarDays },
  { href: '/attendance', label: 'Attendance', icon: CheckCircle2 },
  { href: '/notes', label: 'Notes', icon: BookOpen },
  { href: '/ai', label: 'Scholar AI', icon: Bot },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Quick-Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--surface-1)]/95 backdrop-blur-lg border-t border-[var(--border-default)] z-30 flex items-center justify-around px-2">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all',
                isActive ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-white'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive && 'scale-110 text-indigo-400')} />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
