'use client';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const NotesPage = dynamic(() => import('@/components/dashboard/notes/page'), { ssr: false });
export default function Page() { return <DashboardLayout><NotesPage /></DashboardLayout>; }
