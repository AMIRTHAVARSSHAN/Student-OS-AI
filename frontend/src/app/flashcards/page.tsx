'use client';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const FlashcardsPage = dynamic(() => import('@/components/dashboard/flashcards/page'), { ssr: false });
export default function Page() { return <DashboardLayout><FlashcardsPage /></DashboardLayout>; }
