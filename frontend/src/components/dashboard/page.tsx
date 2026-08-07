'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/stores/app-store';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  Brain,
  BookOpen,
  GraduationCap,
  Building2,
  Layers
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAppStore();

  const { data: profile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me/profile');
      return res.data;
    },
  });

  const { data: attendance } = useQuery({
    queryKey: ['attendance_summary'],
    queryFn: async () => {
      const res = await apiClient.get('/attendance');
      return res.data;
    },
  });

  const { data: todayBlocks } = useQuery({
    queryKey: ['today_blocks'],
    queryFn: async () => {
      const res = await apiClient.get('/study-plans/today');
      return res.data;
    },
  });

  const userName = user?.fullName || profile?.full_name || 'Student';
  const subjects: string[] = user?.subjects || profile?.subjects || [];
  const blockCount = todayBlocks?.length || 0;

  // Friendly labels for education_level and field
  const educationLabels: Record<string, string> = {
    school: 'School (10th / 12th)',
    college: 'College / University',
    competitive: 'Competitive Exams',
    professional: 'Professional Diploma',
  };
  const fieldLabels: Record<string, string> = {
    engineering: 'Engineering & Technology',
    medical: 'Medical & Allied Health',
    commerce: 'Commerce, Finance & CA',
    arts: 'Arts & Humanities',
    law: 'Law & Legal Studies',
    mba: 'MBA & Management',
    science: 'Pure Sciences & Biotech',
  };

  const eduLevel = profile?.education_level;
  const fieldVal = profile?.field;

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-transparent p-6 rounded-2xl border border-indigo-500/20">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Vanakkam, {userName}! 👋</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            You have <span className="font-semibold text-indigo-300">{blockCount} study blocks</span> scheduled today. Let&apos;s excel!
          </p>
        </div>
        <Link
          href="/tutor"
          className="inline-flex items-center justify-center gap-2 bg-[var(--brand-primary)] hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm"
        >
          <Sparkles className="w-4 h-4" /> Ask Scholar AI
        </Link>
      </div>

      {/* Academic Profile & Subjects Card */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" /> My Academic Profile
          </h2>
          <Link href="/onboarding" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium">
            Edit Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {profile?.onboarding_completed ? (
          <>
            {/* Academic Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.institution_name && (
                <div className="bg-[var(--surface-2)] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Institution</span>
                  </div>
                  <p className="text-sm font-semibold truncate">{profile.institution_name}</p>
                </div>
              )}
              {fieldVal && (
                <div className="bg-[var(--surface-2)] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Course</span>
                  </div>
                  <p className="text-sm font-semibold truncate">{fieldLabels[fieldVal] || fieldVal}</p>
                </div>
              )}
              {profile.specialization && (
                <div className="bg-[var(--surface-2)] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Specialization</span>
                  </div>
                  <p className="text-sm font-semibold truncate">{profile.specialization}</p>
                </div>
              )}
              <div className="bg-[var(--surface-2)] rounded-xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Year / Semester</span>
                </div>
                <p className="text-sm font-semibold">
                  Year {profile.current_year || '–'} • Sem {profile.current_semester || '–'}
                  {profile.duration_years ? <span className="text-[var(--text-secondary)] font-normal"> / {profile.duration_years}yr</span> : ''}
                </p>
              </div>
            </div>

            {/* Enrolled Subjects as Pills */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Enrolled Subjects</h3>
              {subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subj, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                    >
                      <BookOpen className="w-3 h-3" />
                      {subj}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)]">No subjects found. Complete onboarding to add subjects.</p>
              )}
            </div>
          </>
        ) : (
          <div className="p-6 text-center rounded-xl bg-[var(--surface-2)] border border-dashed border-[var(--border-default)] space-y-3">
            <GraduationCap className="w-8 h-8 text-[var(--text-tertiary)] mx-auto" />
            <p className="text-sm text-[var(--text-secondary)]">Complete your academic onboarding to unlock personalized AI features.</p>
            <Link
              href="/onboarding"
              className="inline-block text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg hover:bg-indigo-600/30 transition"
            >
              Start Academic Setup
            </Link>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Study Plan (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Study Plan Section */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Today&apos;s Study Schedule
              </h2>
              <Link href="/study-plan" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium">
                View full plan <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {todayBlocks && todayBlocks.length > 0 ? (
                todayBlocks.map((block: any) => (
                  <div 
                    key={block.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] hover:border-indigo-500/30 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{block.topic}</h4>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {block.start_time} - {block.end_time} • Priority: <span className="capitalize">{block.priority}</span>
                        </p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg border border-gray-700 hover:border-indigo-500 hover:text-indigo-400 text-gray-400 transition">
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-xl bg-[var(--surface-2)] border border-dashed border-[var(--border-default)] space-y-3">
                  <BookOpen className="w-8 h-8 text-[var(--text-tertiary)] mx-auto" />
                  <p className="text-sm text-[var(--text-secondary)]">No study blocks scheduled for today.</p>
                  <Link 
                    href="/study-plan"
                    className="inline-block text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg hover:bg-indigo-600/30 transition"
                  >
                    Generate AI Study Plan
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance & Alerts */}
        <div className="space-y-6">
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Attendance Status
              </h3>
              <Link href="/attendance" className="text-xs text-indigo-400 hover:underline">
                Details
              </Link>
            </div>

            <div className="space-y-3">
              {attendance && attendance.length > 0 ? (
                attendance.slice(0, 4).map((item: any) => (
                  <div 
                    key={item.subject_id}
                    className="p-3.5 rounded-xl bg-[var(--surface-2)] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-medium">{item.subject_name}</h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Can miss: {item.can_miss_classes} classes
                      </p>
                    </div>
                    <div className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                      item.status_indicator === 'safe' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      item.status_indicator === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.percentage}%
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-secondary)] text-center py-4">
                  No attendance records marked yet.
                </p>
              )}
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" /> ScholarOS Ready
            </div>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              ScholarOS AI Engine is active and storing real academic notes, study plans, and attendance memory in your database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
