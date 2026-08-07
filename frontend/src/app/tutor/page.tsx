'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import {
  Brain,
  Plus,
  Play,
  Sparkles,
  BookOpen,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';

export default function TutorSessionsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [goal, setGoal] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');

  // Fetch Study Sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['tutor_sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/tutor/sessions');
      return res.data || [];
    },
  });

  // Fetch Academic Memory
  const { data: memory } = useQuery({
    queryKey: ['tutor_memory'],
    queryFn: async () => {
      const res = await apiClient.get('/tutor/memory');
      return res.data;
    },
  });

  // Create Session Mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/tutor/sessions', {
        title,
        chapter,
        goal,
        difficulty
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor_sessions'] });
      setShowModal(false);
      setTitle('');
      setChapter('');
      setGoal('');
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-black border border-indigo-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Brain className="w-4 h-4 text-indigo-400" /> ScholarOS Academic Brain
            </div>
            <h1 className="text-3xl font-black text-white">ScholarOS Tutor AI</h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Your persistent academic companion that learns, remembers, teaches, and quizzes you across unlimited study sessions.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition hover:scale-105 transform-gpu shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Study Session
          </button>
        </div>

        {/* Academic Brain Memory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-default)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Active Study Sessions</span>
            <p className="text-2xl font-black text-white">{sessions?.length || 0}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-rose-500/30 space-y-1">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Focus Weak Areas</span>
            <p className="text-2xl font-black text-rose-300">{memory?.weak_topics?.length || 0} Topics</p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-emerald-500/30 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Mastered Topics</span>
            <p className="text-2xl font-black text-emerald-300">{memory?.strong_topics?.length || 0} Topics</p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-purple-500/30 space-y-1">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">LLM Backend Engine</span>
            <p className="text-sm font-bold text-purple-300 font-mono">llama-3.3-70b-versatile</p>
          </div>
        </div>

        {/* Study Sessions Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> Active Study Sessions ({sessions?.length || 0})
          </h2>

          {sessionsLoading ? (
            <div className="p-12 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Loading Academic Brain Sessions...
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((sess: any) => (
                <Link
                  key={sess.id}
                  href={`/tutor/${sess.id}`}
                  className="p-6 rounded-3xl bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border-default)] hover:border-indigo-500/50 transition-all duration-200 group flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold uppercase">
                        {sess.difficulty || 'Intermediate'}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">
                        {Math.round((sess.time_studied_seconds || 0) / 60)} mins
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors leading-tight">
                      {sess.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {sess.goal || `Chapter: ${sess.chapter}`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs font-bold text-indigo-400">
                    <span>Open AI Workspace</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border-default)] space-y-4">
              <Brain className="w-12 h-12 text-indigo-400 mx-auto" />
              <div>
                <h3 className="font-bold text-white text-base">No Study Sessions Created Yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                  Create your first study session (e.g. Physics Midterm, DNA Revision, Java Programming) to launch Tutor AI.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" /> Create Study Session
              </button>
            </div>
          )}
        </div>

        {/* Create Session Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" /> Create Tutor AI Study Session
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white font-bold text-sm">
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createSessionMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Session Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. DNA & Genetics Midterm Revision"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Chapter / Topic</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="e.g. Transcription & Translation"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Study Goal</label>
                  <textarea
                    rows={2}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Master formulas, solve 10 practice questions, and clarify past exam mistakes"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="beginner">Beginner (Foundations)</option>
                    <option value="intermediate">Intermediate (Standard)</option>
                    <option value="advanced">Advanced (Exam Mastery)</option>
                    <option value="exam_cram">Exam Cram (High Yield)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[var(--surface-2)] text-gray-300 text-xs font-bold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSessionMutation.isPending || !title.trim()}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {createSessionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Session 🚀
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
