'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/layout';
import TutorWorkspace from '@/components/dashboard/tutor/TutorWorkspace';

export default function TutorSessionWorkspacePage() {
  const params = useParams();
  const sessionId = (params?.sessionId as string) || '';

  return (
    <DashboardLayout>
      <TutorWorkspace sessionId={sessionId} />
    </DashboardLayout>
  );
}
