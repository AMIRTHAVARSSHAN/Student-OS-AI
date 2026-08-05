'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/stores/app-store';
import { 
  CalendarDays, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Brain, 
  Loader2,
  Plus,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export default function StudyPlanPage() {
  const queryClient = useQueryClient();
  const { user } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch user profile from Supabase backend for real subjects
  const { data: profile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me/profile');
      return res.data;
    },
  });

  // 2. Fetch user's real study plans from backend
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['study_plans'],
    queryFn: async () => {
      const res = await apiClient.get('/study-plans');
      return res.data || [];
    },
  });

  // 3. Fetch today's study blocks from backend
  const { data: todayBlocks, isLoading: todayLoading } = useQuery({
    queryKey: ['today_blocks'],
    queryFn: async () => {
      const res = await apiClient.get('/study-plans/today');
      return res.data || [];
    },
  });

  // Toggle block completion mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async (blockId: str) => {
      const res = await apiClient.patch(`/study-plans/blocks/${blockId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_plans'] });
      queryClient.invalidateQueries({ queryKey: ['today_blocks'] });
    },
  });

  // Generate 7-Day AI Study Plan based ONLY on user's real enrolled subjects
  const handleGenerateStudyPlan = async () => {
    setGenerating(true);
    setErrorMsg('');
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      const endDateStr = endDate.toISOString().split('T')[0];

      await apiClient.post('/study-plans', {
        title: `7-Day ${profile?.specialization || 'Academic'} Study Plan`,
        start_date: todayStr,
        end_date: endDateStr,
        plan_type: 'daily',
      });

      await queryClient.invalidateQueries({ queryKey: ['study_plans'] });
      await queryClient.invalidateQueries({ queryKey: ['today_blocks'] });
    } catch (err: any) {
      console.error('Error generating study plan:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to generate study plan. Please ensure you have enrolled subjects in onboarding.');
    } finally {
      setGenerating(false);
    }
  };

  const realSubjects: string[] = profile?.subjects || user?.subjects || [];
  const activePlan = plans && plans.length > 0 ? plans[0] : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-black border border-indigo-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Real Academic Timetable
          </div>
          <h1 className="text-3xl font-black text-white">Smart Study Plan & Schedule</h1>
          <p className="text-xs text-gray-300 max-w-xl">
            {profile?.institution_name
              ? `Personalized study timetable for ${profile.full_name || 'Student'} at ${profile.institution_name}.`
              : 'Organize your study blocks based on your real enrolled subjects.'}
          </p>
        </div>

        <button
          onClick={handleGenerateStudyPlan}
          disabled={generating || realSubjects.length === 0}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-105 transform-gpu disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" /> Generating 7-Day Plan...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Generate 7-Day AI Study Plan
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* User Real Enrolled Subjects Pill Strip */}
      <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-default)] space-y-3">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
          Your Enrolled Subjects ({realSubjects.length}):
        </span>
        {realSubjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {realSubjects.map((subj, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                {subj}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-amber-400">
            No subjects registered yet. Complete your profile onboarding to load real subjects.
          </p>
        )}
      </div>

      {/* Today's Real Study Blocks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Today&apos;s Scheduled Study Blocks
          </h2>
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {todayLoading ? (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)]">Loading today&apos;s schedule...</div>
        ) : todayBlocks && todayBlocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayBlocks.map((block: any) => (
              <div
                key={block.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  block.is_completed
                    ? 'bg-emerald-500/5 border-emerald-500/30 opacity-80'
                    : 'bg-[var(--surface-1)] border-[var(--border-default)] hover:border-indigo-500/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {block.start_time ? block.start_time.slice(0, 5) : '09:00'} - {block.end_time ? block.end_time.slice(0, 5) : '10:30'}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        block.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {block.priority || 'medium'} priority
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white leading-tight">{block.topic}</h3>
                </div>

                <button
                  onClick={() => toggleCompleteMutation.mutate(block.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    block.is_completed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[var(--surface-2)] text-gray-200 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${block.is_completed ? 'text-emerald-400' : ''}`} />
                  {block.is_completed ? 'Completed ✓' : 'Mark Completed'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-default)] text-center space-y-3">
            <CalendarDays className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-xs text-gray-400">
              No study blocks scheduled for today. Click <strong>&quot;Generate 7-Day AI Study Plan&quot;</strong> above to create your schedule.
            </p>
          </div>
        )}
      </div>

      {/* Active Study Plan Details */}
      {activePlan && (
        <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-default)] space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
            <div>
              <h3 className="font-bold text-base text-white">{activePlan.title}</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Active Period: {activePlan.start_date} to {activePlan.end_date}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase">
              {activePlan.status || 'Active'}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              All Scheduled Study Blocks ({activePlan.blocks?.length || 0}):
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {activePlan.blocks && activePlan.blocks.length > 0 ? (
                activePlan.blocks.map((blk: any) => (
                  <div
                    key={blk.id}
                    className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-indigo-400 font-bold">{blk.date}</span>
                      <span className="font-medium text-white">{blk.topic}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        blk.is_completed
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {blk.is_completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">No blocks found in active plan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
