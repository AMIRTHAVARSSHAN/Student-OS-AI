'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExamsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-[var(--text-secondary)]">
      Redirecting to Dashboard...
    </div>
  );
}
