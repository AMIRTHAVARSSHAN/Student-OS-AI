'use client';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const ExamsPage = dynamic(() => import('@/components/dashboard/exams/page'), { ssr: false });
export default function Page() { return <DashboardLayout><ExamsPage /></DashboardLayout>; }
