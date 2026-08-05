'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/stores/app-store';

function UserLoader() {
  const { setUser } = useAppStore();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    apiClient
      .get('/users/me/profile')
      .then((res) => {
        const d = res.data;
        setUser({
          id: d.id,
          email: d.email,
          fullName: d.full_name,
          preferredLanguage: d.preferred_language || 'en',
          subscriptionTier: d.subscription_tier || 'free',
          onboardingCompleted: d.onboarding_completed ?? false,
          educationLevel: d.education_level,
          field: d.field,
          specialization: d.specialization,
          institutionName: d.institution_name,
          durationYears: d.duration_years,
          currentYear: d.current_year,
          currentSemester: d.current_semester,
          subjects: d.subjects || [],
        });
      })
      .catch(() => {
        // Token expired or invalid — clear and let interceptor handle redirect
        localStorage.removeItem('access_token');
      });
  }, [setUser]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 mins
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UserLoader />
      {children}
    </QueryClientProvider>
  );
}
