'use client';
import dynamic from 'next/dynamic';

const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const AdminPage = dynamic(() => import('@/components/dashboard/admin/page'), { ssr: false });

export default function Page() {
  return (
    <DashboardLayout>
      <AdminPage />
    </DashboardLayout>
  );
}
