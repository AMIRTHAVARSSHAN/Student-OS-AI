'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/stores/app-store';
import { 
  User, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Globe, 
  Plus, 
  X, 
  Check, 
  Save, 
  Loader2, 
  Camera,
  Award,
  Layers,
  Brain,
  Trash2,
  RefreshCw
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAppStore();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [prefLang, setPrefLang] = useState('en');

  // Academic fields
  const [institutionName, setInstitutionName] = useState('');
  const [field, setField] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [durationYears, setDurationYears] = useState(4);
  const [currentYear, setCurrentYear] = useState(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch real user profile from backend
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me/profile');
      return res.data;
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

  // Memory Reset Mutation
  const resetMemoryMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete('/tutor/memory');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor_memory'] });
      setSuccessMessage('Academic Memory reset successfully! 🧹');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  // Populate state when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
      setPrefLang(profile.preferred_language || 'en');
      setInstitutionName(profile.institution_name || '');
      setField(profile.field || '');
      setSpecialization(profile.specialization || '');
      setDurationYears(profile.duration_years || 4);
      setCurrentYear(profile.current_year || 1);
      setSubjects(profile.subjects || []);
    }
  }, [profile]);

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.patch('/users/me/profile', payload);
      return res.data;
    },
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['user_profile'] });
      
      // Hydrate Zustand store
      if (user) {
        setUser({
          ...user,
          fullName: updatedProfile.full_name,
          avatar_url: updatedProfile.avatar_url,
          subjects: updatedProfile.subjects,
        });
      }

      setSuccessMessage('Profile & Academic Memory updated successfully! 🚀');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 4000);
    },
    onError: (err: any) => {
      console.error('Error updating profile:', err);
      setErrorMessage(err.response?.data?.detail || 'Failed to update profile.');
    },
  });

  const handleAddSubject = () => {
    if (!newSubjectInput.trim()) return;
    const trimmed = newSubjectInput.trim();
    if (!subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
    }
    setNewSubjectInput('');
  };

  const handleRemoveSubject = (subjToRemove: string) => {
    setSubjects(subjects.filter((s) => s !== subjToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    updateProfileMutation.mutate({
      full_name: fullName,
      avatar_url: avatarUrl,
      preferred_language: prefLang,
      institution_name: institutionName,
      field: field,
      specialization: specialization,
      duration_years: Number(durationYears),
      current_year: Number(currentYear),
      subjects: subjects,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-black border border-indigo-500/30 backdrop-blur-xl shadow-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <User className="w-4 h-4 text-indigo-400" /> Account & Profile Memory
        </div>
        <h1 className="text-3xl font-black text-white">Settings & Academic Identity</h1>
        <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
          Manage your personal details, profile picture, college details, degree field, and enrolled subjects stored in backend database memory.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <X className="w-4 h-4 text-rose-400" /> {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading academic settings...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Identity & Avatar */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[var(--border-default)] pb-4">
              <User className="w-5 h-5 text-indigo-400" /> Identity & Profile Picture
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Active Avatar Preview */}
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/50 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-black text-2xl text-white shadow-xl border-4 border-indigo-500/50">
                    {fullName?.charAt(0).toUpperCase() || 'P'}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Preset Avatars & Custom URL */}
              <div className="space-y-3 w-full">
                <label className="text-xs font-semibold text-gray-300 block">Select Avatar Preset</label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                        avatarUrl === url
                          ? 'border-indigo-400 ring-2 ring-indigo-500/40 scale-110'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-300 hover:text-white"
                  >
                    Clear Picture
                  </button>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Custom Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || user?.email || ''}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">AI Language Preference</label>
                <select
                  value={prefLang}
                  onChange={(e) => setPrefLang(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="tanglish">Tanglish</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: College & Course Academic Details */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[var(--border-default)] pb-4">
              <Building2 className="w-5 h-5 text-indigo-400" /> College & Academic Program
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-300 block mb-1">College / University Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indian Institute of Technology Madras, Anna University"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Course / Major Degree Field</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering, Medicine, Commerce"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Specialization / Branch</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Course Duration (Years)</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={durationYears}
                  onChange={(e) => setDurationYears(Number(e.target.value))}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Current Academic Year</label>
                <input
                  type="number"
                  min={1}
                  max={durationYears}
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Academic Memory Inspector */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" /> Academic Memory Inspector
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">Inspect and manage persistent weak topics, mastered concepts, and learning history.</p>
              </div>

              <button
                type="button"
                onClick={() => resetMemoryMutation.mutate()}
                disabled={resetMemoryMutation.isPending}
                className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
              >
                {resetMemoryMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Reset Memory
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-rose-500/20 space-y-2">
                <span className="text-[10px] uppercase font-bold text-rose-400 block">Weak Topics Identified:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(memory?.weak_topics && memory.weak_topics.length > 0) ? (
                    memory.weak_topics.map((t: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 font-semibold text-[11px]">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">No weak topics logged yet.</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-emerald-500/20 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Mastered Concepts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(memory?.strong_topics && memory.strong_topics.length > 0) ? (
                    memory.strong_topics.map((t: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-semibold text-[11px]">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">No mastered topics logged yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Enrolled Subjects */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[var(--border-default)] pb-4">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Enrolled Subjects Memory
            </h2>

            <div className="flex flex-wrap gap-2 min-h-[50px] p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] items-center">
              {subjects.map((subj, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold"
                >
                  <span>{subj}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subj)}
                    className="hover:text-white transition"
                  >
                    <X className="w-3.5 h-3.5 text-indigo-400 hover:text-rose-400" />
                  </button>
                </div>
              ))}

              {subjects.length === 0 && (
                <span className="text-xs text-gray-500 italic">No subjects added yet. Add your subjects below.</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a new subject name (e.g. Data Structures, Machine Learning)"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
                className="flex-1 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Add Subject
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-105 transform-gpu disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile & Re-thinking AI...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile & Re-think AI 🚀
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
