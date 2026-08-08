'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Clock, 
  Layers, 
  Loader2,
  AlertCircle,
  Edit3,
  X,
  Plus,
  Globe
} from 'lucide-react';
import { apiClient, getApiUrl } from '@/lib/api-client';
import { useAppStore } from '@/stores/app-store';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface StructuredProfile {
  full_name?: string;
  institution_name?: string;
  institution_details?: {
    name?: string;
    location?: string;
    accreditation?: string;
    grading_system?: string;
    summary?: string;
  };
  field?: string;
  specialization?: string;
  education_level?: string;
  duration_years?: number;
  current_year?: number;
  current_semester?: number;
  subjects?: string[];
  preferred_language?: string;
}

export default function AIOnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState<StructuredProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editDurationYears, setEditDurationYears] = useState(4);
  const [editCurrentYear, setEditCurrentYear] = useState(1);
  const [editCurrentSemester, setEditCurrentSemester] = useState(1);
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, extractedProfile, isEditing]);

  // Initial welcome greeting from Scholar AI
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const welcomeName = user?.fullName ? ` ${user.fullName}` : '';
    setMessages([
      {
        role: 'assistant',
        content: `Vanakkam${welcomeName}! 🎓 Welcome to ScholarOS. I'm Scholar, your AI academic companion.\n\nTo tailor your AI memory system, study schedules, and exam score predictions, I'll ask you 5 quick questions:\n\n1️⃣ **Full Name**: How would you like me to address you?`,
      },
    ]);
  }, [user, router]);

  // Submit User Message & Stream AI Response
  const handleSendMessage = async (textToSend?: string) => {
    const userText = textToSend || input;
    if (!userText.trim() || isStreaming) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsStreaming(true);

    let assistantResponse = '';

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const chatUrl = getApiUrl('/onboarding/chat');
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      // Add empty assistant message for streaming
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'text') {
                assistantResponse += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantResponse,
                  };
                  return updated;
                });
              }
            } catch (err) {
              // Ignore partial JSON parse errors during streaming
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Streaming error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an error connecting to Groq AI. Please try again.',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }

    // Check if Gemini included structured JSON completion payload in isolated block
    if (assistantResponse) {
      const jsonMatch = assistantResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const profileData: StructuredProfile & { onboarding_complete?: boolean } = JSON.parse(
            jsonMatch[1]
          );
          if (profileData.onboarding_complete || profileData.subjects) {
            setExtractedProfile(profileData);
            setIsCompleted(true);
            populateEditForm(profileData);
            saveProfileToSupabase(profileData);
          }
        } catch (e) {
          console.error('Failed to parse onboarding JSON:', e);
        }
      }
    }
  };

  const populateEditForm = (data: StructuredProfile) => {
    setEditFullName(data.full_name || user?.fullName || '');
    setEditInstitution(data.institution_name || '');
    setEditSpecialization(data.specialization || '');
    setEditDurationYears(Number(data.duration_years) || 4);
    setEditCurrentYear(Number(data.current_year) || 1);
    setEditCurrentSemester(Number(data.current_semester) || 1);
    setEditSubjects(data.subjects || []);
  };

  const startEditing = () => {
    if (extractedProfile) {
      populateEditForm(extractedProfile);
    }
    setIsEditing(true);
  };

  const handleAddSubject = () => {
    if (!newSubjectInput.trim()) return;
    const trimmed = newSubjectInput.trim();
    if (!editSubjects.includes(trimmed)) {
      setEditSubjects((prev) => [...prev, trimmed]);
    }
    setNewSubjectInput('');
  };

  const handleRemoveSubject = (indexToRemove: number) => {
    setEditSubjects((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Re-process memory with AI and save to Supabase
  const handleAIReProcessAndSave = async () => {
    setSaving(true);
    setSaveError('');

    const updatedProfile: StructuredProfile = {
      full_name: editFullName || user?.fullName || 'Student',
      institution_name: editInstitution || 'University',
      field: 'engineering',
      specialization: editSpecialization || 'Computer Science',
      education_level: 'college',
      duration_years: Number(editDurationYears) || 4,
      current_year: Number(editCurrentYear) || 1,
      current_semester: Number(editCurrentSemester) || 1,
      subjects: editSubjects,
      preferred_language: 'en',
    };

    try {
      await saveProfileToSupabase(updatedProfile);
      setExtractedProfile(updatedProfile);
      setIsEditing(false);

      // Add assistant confirmation message in chat timeline
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚡ **Scholar AI Re-Processed Your Profile Memory!**\n\nUpdated ${updatedProfile.subjects?.length} subjects and academic details for **${updatedProfile.full_name}** at **${updatedProfile.institution_name}**.`,
        },
      ]);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to re-process memory.');
    } finally {
      setSaving(false);
    }
  };

  // Save extracted academic profile to Supabase database safely
  const saveProfileToSupabase = async (profileData: StructuredProfile) => {
    setSaving(true);
    setSaveError('');
    try {
      await apiClient.post('/onboarding', {
        education_level: profileData.education_level || 'college',
        field: profileData.field || 'engineering',
        specialization: profileData.specialization || profileData.field || 'General',
        institution_name: profileData.institution_name || 'University',
        duration_years: Number(profileData.duration_years) || 4,
        current_year: Number(profileData.current_year) || 1,
        current_semester: Number(profileData.current_semester) || 1,
        subjects: profileData.subjects || [],
        preferred_language: profileData.preferred_language || 'en',
      });

      // Update Zustand local store
      setUser({
        id: user?.id || '',
        email: user?.email || '',
        fullName: profileData.full_name || user?.fullName || 'Student',
        preferredLanguage: (profileData.preferred_language as any) || 'en',
        subscriptionTier: 'free',
        onboardingCompleted: true,
        educationLevel: profileData.education_level,
        field: profileData.field,
        specialization: profileData.specialization,
        institutionName: profileData.institution_name,
        durationYears: profileData.duration_years,
        currentYear: profileData.current_year,
        currentSemester: profileData.current_semester,
        subjects: profileData.subjects,
      });
    } catch (err: any) {
      console.error('Error saving profile to Supabase:', err);
      setSaveError(err.response?.data?.detail || 'Database notice: Memory updated in session.');
    } finally {
      setSaving(false);
    }
  };

  const [launching, setLaunching] = useState(false);

  const handleLaunchCockpit = async () => {
    setLaunching(true);
    try {
      if (extractedProfile) {
        // 1. Commit full profile and college web intelligence to Supabase backend
        await saveProfileToSupabase(extractedProfile);
      }
      
      // 2. Fetch full profile from backend to guarantee complete Zustand store hydration
      const res = await apiClient.get('/users/me/profile');
      if (res.data) {
        setUser({
          id: res.data.id,
          email: res.data.email,
          fullName: res.data.full_name,
          preferredLanguage: res.data.preferred_language,
          subscriptionTier: res.data.subscription_tier,
          onboardingCompleted: true,
          educationLevel: res.data.education_level,
          field: res.data.field,
          specialization: res.data.specialization,
          institutionName: res.data.institution_name,
          durationYears: res.data.duration_years,
          currentYear: res.data.current_year,
          currentSemester: res.data.current_semester,
          subjects: res.data.subjects,
        });
      }
    } catch (err) {
      console.error('Error committing profile before cockpit launch:', err);
    } finally {
      // 3. Enter main app dashboard
      router.push('/');
    }
  };

  // Quick suggestion chips based on step
  const getSuggestions = () => {
    if (messages.length <= 1) {
      return ['Amirthavarsshan', 'Priya Raman', 'Rahul Sharma'];
    }
    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    if (lastMsg.includes('college') || lastMsg.includes('university') || lastMsg.includes('school')) {
      return ['Anna University', 'IIT Madras', 'Loyola College', 'SRM Institute'];
    }
    if (lastMsg.includes('course') || lastMsg.includes('specialization') || lastMsg.includes('field')) {
      return ['B.E Artificial Intelligence & Data Science', 'B.E Computer Science', 'B.Com Finance', 'MBBS Medical'];
    }
    if (lastMsg.includes('duration') || lastMsg.includes('semester') || lastMsg.includes('year')) {
      return ['4 Years, Year 2, Sem 3', '3 Years, Year 1, Sem 1', '4 Years, Year 1, Sem 2'];
    }
    if (lastMsg.includes('subject')) {
      return [
        'Python Programming, Computational Thinking, Mathematics I, Digital Electronics, Data Structures',
        'Anatomy, Physiology, Biochemistry, Pharmacology',
        'Financial Accounting, Business Law, Economics, Tax',
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[140px] pointer-events-none z-0" />

      <div className="w-full max-w-3xl bg-[#0e0d16] border border-white/10 rounded-3xl shadow-2xl flex flex-col h-[85vh] relative z-10 overflow-hidden backdrop-blur-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Brain className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight flex items-center gap-2">
                Scholar AI Onboarding <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400" />
              </h1>
              <p className="text-xs text-gray-400">Step-by-step academic setup powered by Groq Llama 3.3 70B</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium">
              {isCompleted ? 'Setup Complete ✅' : 'AI Memory Active ⚡'}
            </span>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20'
                      : 'bg-white/[0.04] border border-white/10 text-gray-200 rounded-bl-none shadow-inner'
                  }`}
                >
                  {/* Filter out json blocks from chat display */}
                  {msg.content.replace(/```json[\s\S]*?```/g, '').trim()}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isStreaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 animate-pulse">
                <Brain className="w-4 h-4" />
              </div>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-xs text-indigo-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Scholar AI is thinking...
              </div>
            </div>
          )}

          {/* Extracted Profile Summary Card (READ MODE) */}
          {isCompleted && extractedProfile && !isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-black border border-emerald-500/40 space-y-4 shadow-2xl mt-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> Academic Memory Structured & Saved!
                </div>

                <button
                  onClick={startEditing}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile & Memory
                </button>
              </div>

              {saveError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                {extractedProfile.full_name && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
                    <span className="text-gray-400 block text-[10px]">Student Name</span>
                    <span className="font-semibold text-white">{extractedProfile.full_name}</span>
                  </div>
                )}
                {extractedProfile.institution_name && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
                    <span className="text-gray-400 block text-[10px]">Institution</span>
                    <span className="font-semibold text-white">{extractedProfile.institution_name}</span>
                  </div>
                )}
                {extractedProfile.specialization && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
                    <span className="text-gray-400 block text-[10px]">Course / Specialization</span>
                    <span className="font-semibold text-white">{extractedProfile.specialization}</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
                  <span className="text-gray-400 block text-[10px]">Timeline</span>
                  <span className="font-semibold text-white">
                    Year {extractedProfile.current_year || 1} • Sem {extractedProfile.current_semester || 1} ({extractedProfile.duration_years || 4} Yrs)
                  </span>
                </div>
              </div>

              {extractedProfile.institution_details && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                    <Globe className="w-4 h-4 text-indigo-400" /> AI Web-Searched College Intelligence
                  </div>
                  <p className="leading-relaxed text-[11px] text-gray-300">
                    📍 <strong>{extractedProfile.institution_details.location || 'India'}</strong> • 🏆 <strong>{extractedProfile.institution_details.accreditation || 'Accredited'}</strong> • 📊 <strong>{extractedProfile.institution_details.grading_system || '10-Point CGPA'}</strong>
                  </p>
                </div>
              )}

              {extractedProfile.subjects && extractedProfile.subjects.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Structured Memory Subjects ({extractedProfile.subjects.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    {extractedProfile.subjects.map((subj, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleLaunchCockpit}
                disabled={launching}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.02] transform-gpu mt-2 disabled:opacity-50"
              >
                {launching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" /> Storing Memory & Launching Cockpit... 🚀
                  </>
                ) : (
                  <>Launch Cockpit →</>
                )}
              </button>
            </motion.div>
          )}

          {/* Extracted Profile Summary Card (EDIT MODE) */}
          {isCompleted && isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-black/80 border border-indigo-500/50 space-y-5 shadow-2xl mt-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Edit3 className="w-4 h-4" /> Edit Academic Memory & Profile
                </div>

                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-white text-xs font-semibold flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1 font-medium">Student Full Name</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 font-medium">Institution / College Name</label>
                    <input
                      type="text"
                      value={editInstitution}
                      onChange={(e) => setEditInstitution(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-medium">Course & Specialization</label>
                  <input
                    type="text"
                    value={editSpecialization}
                    onChange={(e) => setEditSpecialization(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1 font-medium">Duration (Yrs)</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={editDurationYears}
                      onChange={(e) => setEditDurationYears(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 font-medium">Current Year</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={editCurrentYear}
                      onChange={(e) => setEditCurrentYear(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 font-medium">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={editCurrentSemester}
                      onChange={(e) => setEditCurrentSemester(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Interactive Subject Pill Editor */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 font-semibold block">
                      Enrolled Subjects ({editSubjects.length})
                    </label>
                    <span className="text-[11px] text-gray-400">Click &times; to delete a subject</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-white/[0.02] border border-white/5 rounded-xl">
                    {editSubjects.map((subj, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
                      >
                        {subj}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="hover:text-rose-400 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add New Subject Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newSubjectInput}
                      onChange={(e) => setNewSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubject();
                        }
                      }}
                      placeholder="Add another subject (e.g. Deep Learning Lab)..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubject}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 transition shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/3 py-3 rounded-xl border border-white/10 text-gray-300 font-semibold text-xs hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleAIReProcessAndSave}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> AI Re-Processing & Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300 fill-emerald-300" /> AI Re-Process & Save Memory ⚡
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {!isCompleted && getSuggestions().length > 0 && (
          <div className="px-6 py-2 border-t border-white/5 bg-black/20 flex gap-2 overflow-x-auto no-scrollbar">
            {getSuggestions().map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleSendMessage(chip)}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-indigo-500/20 border border-white/10 text-[11px] text-indigo-300 hover:text-white transition whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        {!isCompleted && (
          <div className="p-4 border-t border-white/10 bg-white/[0.02]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer here..."
                disabled={isStreaming}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-50 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
