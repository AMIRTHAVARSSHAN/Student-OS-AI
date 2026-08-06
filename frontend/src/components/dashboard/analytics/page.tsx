'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { BarChart3, Clock, Flame, Brain, CheckCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics_dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/dashboard');
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-400" /> Academic Analytics
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Real-time metrics on study hours, streak consistency, and review efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
            <span>Study Time This Week</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.study_hours_this_week ?? 0} hrs</p>
          <span className="text-xs text-[var(--text-secondary)] font-medium">Logged study blocks</span>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{stats?.study_streak ?? 0} Days</p>
          <span className="text-xs text-[var(--text-secondary)] font-medium">Active daily streak</span>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
            <span>Flashcard Retention</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-purple-400">{stats?.flashcard_retention_rate ?? 0}%</p>
          <span className="text-xs text-emerald-400 font-medium">SM-2 memory curve</span>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
            <span>Weekly Plan Completion</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{stats?.weekly_completion_rate ?? 0}%</p>
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            {stats?.completed_study_blocks ?? 0} of {stats?.total_study_blocks ?? 0} blocks complete
          </span>
        </div>
      </div>
    </div>
  );
}
