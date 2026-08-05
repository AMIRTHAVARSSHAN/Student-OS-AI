'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/stores/app-store';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Sparkles, 
  Pin, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Check, 
  Globe,
  FileText,
  Copy,
  Maximize2,
  Minimize2,
  FileDown
} from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface NoteItem {
  id: string;
  subject_id?: string;
  title: string;
  content: string;
  plain_text: string;
  source: string;
  tags: string[];
  unit_number?: number;
  topic?: string;
  is_pinned: boolean;
  is_archived: boolean;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const queryClient = useQueryClient();
  const { user } = useAppStore();

  // Manual note state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  // AI Note Generator state
  const [isCreatingAI, setIsCreatingAI] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('');
  const [aiLang, setAiLang] = useState('en');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Active Note Modal Viewer state
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [isEditingActive, setIsEditingActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real enrolled subjects for suggestions
  const { data: profile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me/profile');
      return res.data;
    },
  });
  const realSubjects: string[] = profile?.subjects || user?.subjects || [];

  // Fetch all user notes from backend database
  const { data: notes, isLoading } = useQuery<NoteItem[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await apiClient.get('/notes');
      return res.data || [];
    },
  });

  // Manual Note Creation Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: { title: string; content: string }) => {
      const res = await apiClient.post('/notes', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setTitle('');
      setContent('');
      setIsCreatingManual(false);
    },
  });

  // Update Note Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<NoteItem> }) => {
      const res = await apiClient.patch(`/notes/${id}`, payload);
      return res.data;
    },
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setActiveNote(updatedNote);
      setIsEditingActive(false);
    },
  });

  // Delete Note Mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await apiClient.delete(`/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setActiveNote(null);
    },
  });

  // AI Note Generator Handler
  const handleGenerateAINote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    setAiError('');

    try {
      const res = await apiClient.post('/notes/generate-ai', {
        topic: aiTopic,
        subject_name: aiSubject || undefined,
        language: aiLang,
      });

      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      setAiGenerating(false);
      setIsCreatingAI(false);
      setAiTopic('');
      
      // Automatically open the compiled generated markdown note!
      if (res.data) {
        setActiveNote(res.data);
      }
    } catch (err: any) {
      console.error('Error generating AI note:', err);
      setAiError(err.response?.data?.detail || 'AI generation failed. Please try again.');
      setAiGenerating(false);
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate({ title, content });
  };

  const handleOpenNote = (note: NoteItem) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditingActive(false);
    setIsFullscreen(false);
  };

  const handleCopyContent = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PDF Handler in exact rendered view
  const handleDownloadPDF = () => {
    if (!activeNote) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const contentElement = document.getElementById('rendered-markdown-content');
    const renderedHtml = contentElement ? contentElement.innerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeNote.title} - ScholarOS Notes</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              background-color: #0d0c15;
              color: #e2e8f0;
              padding: 40px;
              margin: 0;
            }
            h1 { font-size: 24px; color: #ffffff; border-bottom: 2px solid #6366f1; padding-bottom: 8px; margin-top: 24px; }
            h2 { font-size: 18px; color: #a5b4fc; margin-top: 20px; }
            h3 { font-size: 15px; color: #d8b4fe; margin-top: 16px; }
            h4 { font-size: 13px; color: #c7d2fe; margin-top: 12px; text-transform: uppercase; }
            p, li { font-size: 13px; line-height: 1.6; color: #cbd5e1; }
            code { font-family: 'JetBrains Mono', monospace; background: #1e1b4b; color: #6ee7b7; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
            blockquote { border-left: 4px solid #6366f1; background: rgba(99, 102, 241, 0.1); padding: 8px 16px; margin: 12px 0; color: #c7d2fe; }
            .math-box { border: 1px solid rgba(168, 85, 247, 0.4); background: rgba(88, 28, 135, 0.2); padding: 12px; border-radius: 12px; font-family: 'JetBrains Mono', monospace; color: #e9d5ff; margin: 12px 0; }
            @media print {
              body { background: #ffffff !important; color: #0f172a !important; padding: 20px; }
              h1 { color: #1e1b4b !important; border-bottom-color: #4338ca !important; }
              h2 { color: #3730a3 !important; }
              h3 { color: #581c87 !important; }
              p, li { color: #334155 !important; }
              code { background: #f1f5f9 !important; color: #065f46 !important; border: 1px solid #cbd5e1 !important; }
              blockquote { background: #eff6ff !important; color: #1e40af !important; border-left-color: #2563eb !important; }
              .math-box { background: #faf5ff !important; color: #6b21a8 !important; border-color: #c084fc !important; }
            }
          </style>
        </head>
        <body>
          <div style="margin-bottom: 24px; border-bottom: 1px solid #334155; padding-bottom: 12px;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a5b4fc; font-weight: bold;">ScholarOS AI Study Vault Note</span>
            <h1 style="margin: 4px 0 8px 0;">${activeNote.title}</h1>
            <div style="font-size: 12px; color: #94a3b8;">Source: ${activeNote.source} • Created: ${new Date(activeNote.created_at).toLocaleDateString()} • Word count: ${activeNote.word_count}</div>
          </div>
          <div>${renderedHtml}</div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filter notes by search
  const filteredNotes = notes?.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.plain_text.toLowerCase().includes(q) ||
      n.source.toLowerCase().includes(q) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-black border border-indigo-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Compiled Markdown Vault
          </div>
          <h1 className="text-3xl font-black text-white">Notes & Knowledge Memory</h1>
          <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
            Create, view compiled markdown scripts, or generate full in-depth academic study notes on any topic powered by Google Gemini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setIsCreatingAI(true);
              setIsCreatingManual(false);
            }}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition hover:scale-105 transform-gpu"
          >
            <Sparkles className="w-4 h-4" /> Generate AI Note by Topic
          </button>

          <button
            onClick={() => {
              setIsCreatingManual(!isCreatingManual);
              setIsCreatingAI(false);
            }}
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Manual Note
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl px-4 py-3 shadow-md">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search notes by title, topic, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-white focus:outline-none w-full"
        />
      </div>

      {/* AI Note Generator Form Modal */}
      {isCreatingAI && (
        <form onSubmit={handleGenerateAINote} className="p-6 rounded-2xl bg-gradient-to-br from-[#12101e] to-black border border-purple-500/40 space-y-4 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Note Generator by Topic
            </div>
            <button type="button" onClick={() => setIsCreatingAI(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {aiError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {aiError}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Topic Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Operating Systems Process Scheduling Algorithms, Loss Functions in ML"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Quick Topic Pill Suggestions from Real Enrolled Subjects */}
            {realSubjects.length > 0 && (
              <div>
                <span className="text-[11px] text-gray-400 font-medium block mb-1.5">Your Registered Subjects:</span>
                <div className="flex flex-wrap gap-1.5">
                  {realSubjects.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAiSubject(s);
                        if (!aiTopic) setAiTopic(`${s} Core Fundamentals & Exam Notes`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                        aiSubject === s
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Globe className="w-4 h-4 text-indigo-400" /> Language:
              <select
                value={aiLang}
                onChange={(e) => setAiLang(e.target.value)}
                className="bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="tanglish">Tanglish</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingAI(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={aiGenerating || !aiTopic.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" /> Authoring AI Markdown Note...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate & Save Note 🚀
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Manual Note Creation Form */}
      {isCreatingManual && (
        <form onSubmit={handleCreateManual} className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white">Write Manual Markdown Study Note</h3>
            <button type="button" onClick={() => setIsCreatingManual(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            required
            placeholder="Note Title (e.g. Data Structures - Trees Unit 2)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />

          <textarea
            required
            placeholder="Write markdown content using # Headings, **bold**, lists, and code blocks ```..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreatingManual(false)}
              className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-bold rounded-xl"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      )}

      {/* Note Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading notes vault...</div>
      ) : filteredNotes && filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleOpenNote(note)}
              className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between shadow-xl group transform-gpu hover:scale-[1.01]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    note.source === 'ai-generated'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {note.source}
                  </span>

                  <div className="flex items-center gap-1.5 text-gray-400 opacity-80 group-hover:opacity-100">
                    {note.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    <Eye className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                <h3 className="font-bold text-base text-white leading-snug group-hover:text-indigo-300 transition-colors">
                  {note.title}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                  {note.plain_text}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)] text-[11px] text-gray-400">
                <span>{note.word_count} words</span>
                <span className="font-mono text-indigo-300 flex items-center gap-1 font-semibold">
                  <Eye className="w-3 h-3 text-indigo-400" /> View Markdown
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface-1)] border border-dashed border-[var(--border-default)] space-y-4 max-w-lg mx-auto mt-8">
          <BookOpen className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="font-semibold text-lg text-white">Your Notes Vault is Empty</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Generate AI study notes by topic or write manual markdown scripts to store in your database memory.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreatingAI(true)}
              className="text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Generate AI Note
            </button>
            <button
              onClick={() => setIsCreatingManual(true)}
              className="text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 px-4 py-2.5 rounded-xl transition"
            >
              Write Manual Note
            </button>
          </div>
        </div>
      )}

      {/* Compiled Markdown Reader & Editor Modal */}
      {activeNote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className={`w-full transition-all duration-300 bg-[#0d0c15] border border-indigo-500/40 shadow-2xl flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 ${
            isFullscreen 
              ? 'w-screen h-screen rounded-none p-6 md:p-10 max-w-none max-h-none' 
              : 'max-w-4xl max-h-[90vh] rounded-3xl p-6 md:p-8 space-y-6'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    activeNote.source === 'ai-generated'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {activeNote.source}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    Created {new Date(activeNote.created_at).toLocaleDateString()} • {activeNote.word_count} words
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white">{activeNote.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyContent}
                  title="Copy Raw Markdown"
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                <button
                  onClick={handleDownloadPDF}
                  title="Download as PDF in same rendered view"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileDown className="w-3.5 h-3.5 text-indigo-400" /> Download PDF
                </button>

                <button
                  onClick={() => setIsEditingActive(!isEditingActive)}
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition font-bold ${
                    isEditingActive
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  {isEditingActive ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  {isEditingActive ? 'Compiled View' : 'Edit Note'}
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? 'Exit Full Screen' : 'View in Full Screen'}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-purple-400" /> : <Maximize2 className="w-4 h-4 text-indigo-400" />}
                </button>

                <button
                  onClick={() => deleteMutation.mutate(activeNote.id)}
                  title="Delete Note"
                  className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveNote(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Compiled Markdown vs Editor */}
            <div 
              id="rendered-markdown-content" 
              className={`flex-1 overflow-y-auto pr-2 space-y-4 ${
                isFullscreen ? 'h-full max-h-none' : 'max-h-[60vh]'
              }`}
            >
              {isEditingActive ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white font-bold focus:outline-none"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={14}
                    className="w-full bg-black/60 border border-white/15 rounded-xl p-4 text-xs font-mono text-gray-200 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-black/50 border border-white/10 min-h-[300px]">
                  <MarkdownRenderer content={activeNote.content} />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {isEditingActive && (
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingActive(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateMutation.mutate({
                      id: activeNote.id,
                      payload: { title: editTitle, content: editContent },
                    })
                  }
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Save Changes 💾
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
