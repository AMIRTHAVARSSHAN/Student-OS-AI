'use client';
import dynamic from 'next/dynamic';
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const PDFPage = dynamic(() => import('@/components/dashboard/pdf/page'), { ssr: false });
export default function Page() { return <DashboardLayout><PDFPage /></DashboardLayout>; }
