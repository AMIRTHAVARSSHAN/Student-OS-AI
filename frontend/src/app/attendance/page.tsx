'use client';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const AttendancePage = dynamic(() => import('@/components/dashboard/attendance/page'), { ssr: false });
export default function Page() { return <DashboardLayout><AttendancePage /></DashboardLayout>; }
