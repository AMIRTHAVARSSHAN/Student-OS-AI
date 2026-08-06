'use client';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const StudyPlanPage = dynamic(() => import('@/components/dashboard/study-plan/page'), { ssr: false });
export default function Page() { return <DashboardLayout><StudyPlanPage /></DashboardLayout>; }
