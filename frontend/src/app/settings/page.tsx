'use client';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const SettingsPage = dynamic(() => import('@/components/dashboard/settings/page'), { ssr: false });
export default function Page() { return <DashboardLayout><SettingsPage /></DashboardLayout>; }
