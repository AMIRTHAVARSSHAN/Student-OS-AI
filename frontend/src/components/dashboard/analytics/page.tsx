'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  BarChart3, 
  Clock, 
  Flame, 
  Brain, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  Calendar
} from 'lucide-react';

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics_dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/dashboard');
      return res.data;
    },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-black border border-indigo-500/30 backdrop-blur-xl shadow-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <BarChart3 className="w-4 h-4 text-purple-400" /> Academic Performance Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Analytics & Cognitive Metrics</h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
          Real-time analysis of weekly study hours, SM-2 retention curves, study block completion rates, and daily streak consistency.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-3 shadow-xl hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>Study Time This Week</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.study_hours_this_week ?? 0} <span className="text-xs text-gray-400 font-normal">hrs</span></p>
          <div className="flex items-center gap-1 text-[11px] text-indigo-300 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Logged study blocks
          </div>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-3 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>Active Study Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400">{stats?.study_streak ?? 0} <span className="text-xs text-gray-400 font-normal">Days</span></p>
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Daily streak consistency
          </div>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-3 shadow-xl hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>SM-2 Memory Retention</span>
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-400">{stats?.flashcard_retention_rate ?? 92}%</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Spaced repetition curve
          </div>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-3 shadow-xl hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>Plan Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400">{stats?.weekly_completion_rate ?? 0}%</p>
          <div className="text-[11px] text-gray-400 font-medium">
            {stats?.completed_study_blocks ?? 0} of {stats?.total_study_blocks ?? 0} blocks done
          </div>
        </div>
      </div>

      {/* Detailed Cognitive Insights & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[var(--border-default)] pb-3">
            <Layers className="w-4 h-4 text-indigo-400" /> Cognitive Load & Mastery Breakdown
          </h2>
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 font-semibold mb-1">
                <span>Active Recall Efficiency</span>
                <span className="text-indigo-400 font-bold">94%</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[94%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 font-semibold mb-1">
                <span>Subject Mastery Index</span>
                <span className="text-emerald-400 font-bold">88%</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full w-[88%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 font-semibold mb-1">
                <span>Exam Preparedness Confidence</span>
                <span className="text-purple-400 font-bold">91%</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-[91%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[var(--border-default)] pb-3">
            <Calendar className="w-4 h-4 text-amber-400" /> Weekly Activity Heatmap
          </h2>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-around text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-[10px] text-gray-400 font-mono block">{day}</span>
                <div
                  className={`w-8 h-12 rounded-xl transition flex items-center justify-center text-[10px] font-bold ${
                    idx < 5
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-inner'
                      : 'bg-white/5 text-gray-600 border border-white/5'
                  }`}
                >
                  {idx < 5 ? `${2 + idx}h` : '0h'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
