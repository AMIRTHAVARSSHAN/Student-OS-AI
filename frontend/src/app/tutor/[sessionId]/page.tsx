'use client';

import { use } from 'react';
import DashboardLayout from '@/components/dashboard/layout';
import TutorWorkspace from '@/components/dashboard/tutor/TutorWorkspace';

interface SessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function TutorSessionWorkspacePage({ params }: SessionPageProps) {
  const { sessionId } = use(params);

  return (
    <DashboardLayout>
      <TutorWorkspace sessionId={sessionId} />
    </DashboardLayout>
  );
}
