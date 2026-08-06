'use client';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const AIPage = dynamic(() => import('@/components/dashboard/ai/page'), { ssr: false });
export default function Page() { return <DashboardLayout><AIPage /></DashboardLayout>; }
