'use client';

import dynamic from 'next/dynamic';

const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const ConnectShell = dynamic(() => import('@/components/connect/ConnectShell'), { ssr: false });

export default function ScholarConnectPage() {
  return (
    <DashboardLayout>
      <ConnectShell />
    </DashboardLayout>
  );
}
