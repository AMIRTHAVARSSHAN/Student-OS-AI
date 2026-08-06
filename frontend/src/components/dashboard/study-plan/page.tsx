'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/stores/app-store';
import Link from 'next/link';
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
  ChevronRight,
  Layers,
  Calendar
} from 'lucide-react';

export default function StudyPlanPage() {
  const queryClient = useQueryClient();
  const { user } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

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

  // 4. Fetch all user notes to allow attaching/linking notes to study blocks
  const { data: notesVault } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await apiClient.get('/notes');
      return res.data || [];
    },
  });

  // Toggle block completion mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const res = await apiClient.patch(`/study-plans/blocks/${blockId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_plans'] });
      queryClient.invalidateQueries({ queryKey: ['today_blocks'] });
    },
  });

  // Link Note Mutation
  const linkNoteMutation = useMutation({
    mutationFn: async ({ blockId, noteId }: { blockId: string; noteId: string }) => {
      const res = await apiClient.patch(`/study-plans/blocks/${blockId}/link-note`, { note_id: noteId });
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

      const res = await apiClient.post('/study-plans', {
        title: `7-Day ${profile?.specialization || 'Academic'} Study Plan`,
        start_date: todayStr,
        end_date: endDateStr,
        plan_type: 'daily',
      });

      await queryClient.invalidateQueries({ queryKey: ['study_plans'] });
      await queryClient.invalidateQueries({ queryKey: ['today_blocks'] });
      if (res.data?.id) {
        setSelectedPlanId(res.data.id);
      }
    } catch (err: any) {
      console.error('Error generating study plan:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to generate study plan. Please ensure you have enrolled subjects in onboarding.');
    } finally {
      setGenerating(false);
    }
  };

  const realSubjects: string[] = profile?.subjects || user?.subjects || [];
  
  // Currently displayed plan (defaults to user selected or first plan)
  const activePlan = plans && plans.length > 0 
    ? (plans.find((p: any) => p.id === selectedPlanId) || plans[0]) 
    : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-black border border-indigo-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Real Academic Timetable
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Smart Study Plan & Schedule</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            {profile?.institution_name
              ? `Personalized study timetable for ${profile.full_name || 'Student'} at ${profile.institution_name}.`
              : 'Organize your study blocks based on your real enrolled subjects.'}
          </p>
        </div>

        <button
          onClick={handleGenerateStudyPlan}
          disabled={generating || realSubjects.length === 0}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition hover:scale-105 transform-gpu disabled:opacity-50 w-full sm:w-auto"
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

      {/* Today's Scheduled Study Blocks Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
            <Clock className="w-5 h-5 text-indigo-400" /> Scheduled Study Blocks
          </h2>
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {todayLoading ? (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)]">Loading schedule...</div>
        ) : todayBlocks && todayBlocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayBlocks.map((block: any) => (
              <div
                key={block.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  block.is_completed
                    ? 'bg-emerald-500/5 border-emerald-500/30 opacity-85'
                    : 'bg-[var(--surface-1)] border-[var(--border-default)] hover:border-indigo-500/50 shadow-lg'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 font-mono">
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

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => toggleCompleteMutation.mutate(block.id)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      block.is_completed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[var(--surface-2)] text-gray-200 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${block.is_completed ? 'text-emerald-400' : ''}`} />
                    {block.is_completed ? 'Completed ✓' : 'Mark Completed'}
                  </button>

                  {block.note_id ? (
                    <Link
                      href="/notes"
                      className="px-3 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                    >
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      View Note 📚
                    </Link>
                  ) : (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          linkNoteMutation.mutate({ blockId: block.id, noteId: e.target.value });
                        }
                      }}
                      defaultValue=""
                      className="px-2 py-2 rounded-xl bg-[var(--surface-2)] border border-white/15 text-[11px] text-gray-300 focus:outline-none focus:border-indigo-500 max-w-[120px] truncate"
                    >
                      <option value="" disabled>+ Link Note</option>
                      {notesVault?.map((n: any) => (
                        <option key={n.id} value={n.id}>
                          {n.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
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

      {/* View All Generated Study Plans Selector */}
      {plans && plans.length > 0 && (
        <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-default)] space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-4">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" /> Study Plans History ({plans.length})
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Select any plan to inspect all scheduled blocks.</p>
            </div>

            {/* Plan Selector Pills */}
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              {plans.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    activePlan?.id === p.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-[var(--surface-2)] text-gray-300 border-white/10 hover:border-indigo-500/30'
                  }`}
                >
                  {p.title} ({p.blocks?.length || 0} blocks)
                </button>
              ))}
            </div>
          </div>

          {/* Selected Plan Detail View */}
          {activePlan && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--surface-2)] p-4 rounded-xl">
                <div>
                  <h4 className="font-bold text-sm text-white">{activePlan.title}</h4>
                  <p className="text-xs text-gray-400">
                    Period: {activePlan.start_date} to {activePlan.end_date}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase self-start sm:self-auto">
                  {activePlan.status || 'Active'}
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  All Scheduled Blocks ({activePlan.blocks?.length || 0}):
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1 sm:pr-2">
                  {activePlan.blocks && activePlan.blocks.length > 0 ? (
                    activePlan.blocks.map((blk: any) => (
                      <div
                        key={blk.id}
                        className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-indigo-400 font-bold shrink-0">{blk.date}</span>
                          <span className="font-medium text-white">{blk.topic}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-between sm:justify-end">
                          <span className="text-[11px] text-gray-400 font-mono">
                            {blk.start_time ? blk.start_time.slice(0, 5) : '09:00'} - {blk.end_time ? blk.end_time.slice(0, 5) : '10:30'}
                          </span>
                          
                          {blk.note_id && (
                            <Link
                              href="/notes"
                              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition"
                            >
                              Notes 📚
                            </Link>
                          )}

                          <button
                            onClick={() => toggleCompleteMutation.mutate(blk.id)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${
                              blk.is_completed
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
                            }`}
                          >
                            {blk.is_completed ? 'Completed ✓' : 'Mark Done'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No blocks found in selected plan.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
