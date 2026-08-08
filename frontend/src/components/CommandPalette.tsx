'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Search, 
  BookOpen, 
  Brain, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Plus, 
  X, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const { data: notes } = useQuery({
    queryKey: ['notes_search'],
    queryFn: async () => {
      const res = await apiClient.get('/notes');
      return res.data || [];
    },
    enabled: isOpen,
  });

  const { data: sessions } = useQuery({
    queryKey: ['tutor_sessions_search'],
    queryFn: async () => {
      const res = await apiClient.get('/tutor/sessions');
      return res.data || [];
    },
    enabled: isOpen,
  });

  const filteredNotes = (notes || []).filter((n: any) => 
    n.title?.toLowerCase().includes(query.toLowerCase()) || 
    n.topic?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredSessions = (sessions || []).filter((s: any) => 
    s.title?.toLowerCase().includes(query.toLowerCase()) || 
    s.chapter?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl space-y-3">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[var(--border-default)] flex items-center gap-3 bg-[var(--surface-2)]">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, study sessions, subjects, or actions..."
            className="flex-1 bg-transparent text-sm text-white focus:outline-none"
          />
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="p-3 space-y-4 max-h-[380px] overflow-y-auto text-xs">
          {/* Quick Actions */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 px-2 tracking-wider">Quick Actions</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/tutor');
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-gray-200 hover:text-white flex items-center justify-between text-left transition border border-transparent hover:border-indigo-500/30"
              >
                <span className="flex items-center gap-2 font-bold"><Brain className="w-4 h-4 text-indigo-400" /> Start AI Study Session</span>
                <ArrowRight className="w-3 h-3 text-gray-500" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/notes');
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-gray-200 hover:text-white flex items-center justify-between text-left transition border border-transparent hover:border-indigo-500/30"
              >
                <span className="flex items-center gap-2 font-bold"><BookOpen className="w-4 h-4 text-purple-400" /> Open Notes Vault</span>
                <ArrowRight className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Sessions */}
          {filteredSessions.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 px-2 tracking-wider">Active Study Workspaces</span>
              {filteredSessions.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/tutor/${s.id}`);
                  }}
                  className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-left flex items-center justify-between transition border border-transparent hover:border-indigo-500/30"
                >
                  <div>
                    <h4 className="font-bold text-white text-xs">{s.title}</h4>
                    <span className="text-[10px] text-gray-400">{s.chapter || 'General'}</span>
                  </div>
                  <Brain className="w-4 h-4 text-indigo-400" />
                </button>
              ))}
            </div>
          )}

          {/* Notes */}
          {filteredNotes.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 px-2 tracking-wider">Notes & Vault</span>
              {filteredNotes.map((n: any) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/notes');
                  }}
                  className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-left flex items-center justify-between transition border border-transparent hover:border-indigo-500/30"
                >
                  <div>
                    <h4 className="font-bold text-white text-xs">{n.title}</h4>
                    <span className="text-[10px] text-gray-400">{n.topic || 'Vault Note'}</span>
                  </div>
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
