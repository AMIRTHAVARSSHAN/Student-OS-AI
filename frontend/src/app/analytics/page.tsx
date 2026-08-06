'use client';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const AnalyticsPage = dynamic(() => import('@/components/dashboard/analytics/page'), { ssr: false });
export default function Page() { return <DashboardLayout><AnalyticsPage /></DashboardLayout>; }
