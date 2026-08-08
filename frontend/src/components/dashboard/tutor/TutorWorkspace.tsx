'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FormattedChatMessage from './FormattedChatMessage';
import { useAppStore } from '@/stores/app-store';
import {
  Brain,
  Send,
  Loader2,
  Mic,
  MicOff,
  Layers,
  CheckCircle2,
  Volume2,
  Plus,
  Play,
  FileText,
  Network,
  PanelLeft,
  X,
  Compass,
  BookmarkPlus,
  Check,
  Zap,
  Sparkles
} from 'lucide-react';

interface TutorWorkspaceProps {
  sessionId?: string;
}

export default function TutorWorkspace({ sessionId }: TutorWorkspaceProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toggleSidebar } = useAppStore();
  
  const [showRightInspector, setShowRightInspector] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'study' | 'notes' | 'mindmap' | 'graph' | 'voice'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Note saving loading & success states per message
  const [savingNotesStatus, setSavingNotesStatus] = useState<Record<number, boolean>>({});
  const [savedNotesStatus, setSavedNotesStatus] = useState<Record<number, boolean>>({});

  // Small Toast Notification Popup
  const [toastPopup, setToastPopup] = useState<{ show: boolean; message: string; type: 'saving' | 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Create Session Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('intermediate');

  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: '👋 Welcome to **ScholarOS Tutor AI**! I am your persistent Academic Brain. Ask me anything about your subjects — I remember your notes, weak topics, and past quizzes to guide your study journey!'
    }
  ]);

  // Active Study Mode State
  const [studyTopic, setStudyTopic] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [studyContent, setStudyContent] = useState('');
  const [loadingStudyStep, setLoadingStudyStep] = useState(false);

  // Voice State
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // 1. Fetch Active Session Details
  const { data: sessionData } = useQuery({
    queryKey: ['tutor_session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const res = await apiClient.get(`/tutor/sessions/${sessionId}`);
      return res.data;
    },
    enabled: Boolean(sessionId),
  });

  // 2. Fetch User Academic Memory
  const { data: memory } = useQuery({
    queryKey: ['tutor_memory'],
    queryFn: async () => {
      const res = await apiClient.get('/tutor/memory');
      return res.data;
    },
  });

  // 3. Fetch Concept Graph
  const { data: conceptNodes } = useQuery({
    queryKey: ['concept_graph'],
    queryFn: async () => {
      const res = await apiClient.get('/tutor/concept-graph');
      return res.data || [];
    },
  });

  // 4. Fetch Session Chat History from Backend Memory Engine
  const { data: sessionHistory } = useQuery({
    queryKey: ['tutor_session_history', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await apiClient.get(`/tutor/sessions/${sessionId}/history`);
      return res.data || [];
    },
    enabled: Boolean(sessionId),
  });

  // Automatically populate chat workspace when history finishes loading
  useEffect(() => {
    if (sessionHistory && sessionHistory.length > 0) {
      setMessages(sessionHistory);
    }
  }, [sessionHistory]);

  // Create Session Mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/tutor/sessions', {
        title: newTitle,
        chapter: newChapter,
        goal: newGoal,
        difficulty: newDifficulty
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tutor_sessions'] });
      setShowCreateModal(false);
      setNewTitle('');
      setNewChapter('');
      setNewGoal('');
      if (data?.id) {
        router.push(`/tutor/${data.id}`);
      }
    },
  });

  // Save Response to Backend User Notes with Small Popup Loading Indicator
  const handleSaveToNotes = async (msgIndex: number, textContent: string) => {
    setSavingNotesStatus((prev) => ({ ...prev, [msgIndex]: true }));
    setToastPopup({
      show: true,
      message: 'Saving note to Vault memory... ⏳',
      type: 'saving'
    });

    try {
      const noteTitle = sessionData?.title ? `${sessionData.title} - Tutor AI Note` : 'Tutor AI Study Note';
      await apiClient.post('/notes', {
        title: noteTitle,
        content: textContent,
        topic: sessionData?.chapter || sessionData?.title || 'General',
        tags: ['tutor_ai', 'study_notes']
      });

      queryClient.invalidateQueries({ queryKey: ['notes'] });

      setSavingNotesStatus((prev) => ({ ...prev, [msgIndex]: false }));
      setSavedNotesStatus((prev) => ({ ...prev, [msgIndex]: true }));

      setToastPopup({
        show: true,
        message: 'Saved to Notes Vault! 📝',
        type: 'success'
      });

      setTimeout(() => {
        setSavedNotesStatus((prev) => ({ ...prev, [msgIndex]: false }));
        setToastPopup((prev) => ({ ...prev, show: false }));
      }, 3000);
    } catch (err) {
      console.error('Save to notes error:', err);
      setSavingNotesStatus((prev) => ({ ...prev, [msgIndex]: false }));
      setToastPopup({
        show: true,
        message: 'Failed to save note. Please try again.',
        type: 'error'
      });
      setTimeout(() => {
        setToastPopup((prev) => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // Send Streaming AI Chat Message
  const handleSendMessage = async (customMessage?: string, actionType?: string) => {
    const textToSend = customMessage || inputMessage;
    if (!textToSend.trim() || isStreaming) return;

    if (!customMessage) setInputMessage('');

    const updatedMsgs = [...messages, { role: 'user', content: textToSend }];
    setMessages(updatedMsgs);
    setIsStreaming(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || localStorage.getItem('token') : null;
      const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const apiUrl = envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;

      const response = await fetch(`${apiUrl}/tutor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: textToSend,
          action: actionType
        })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'text') {
                assistantMsg += data.content;
                setMessages((prev) => {
                  const newArr = [...prev];
                  newArr[newArr.length - 1] = { role: 'assistant', content: assistantMsg };
                  return newArr;
                });
              }
            } catch (e) {
              // chunk parse ignore
            }
          }
        }
      }

      // Invalidate history query so new messages are fresh in cache
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['tutor_session_history', sessionId] });
      }
    } catch (err) {
      console.error('Streaming error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: '❌ Connection error while querying Tutor AI.' }]);
    } finally {
      setIsStreaming(false);
    }
  };

  // Handle Active Study Step
  const handleActiveStudyStep = async (nextStep: 'explain' | 'evaluate' | 'quiz') => {
    if (!sessionId) return;
    setLoadingStudyStep(true);
    try {
      const res = await apiClient.post('/tutor/study-step', {
        session_id: sessionId,
        current_topic: studyTopic || sessionData?.chapter || sessionData?.title || 'Core Subject',
        student_response: studentAnswer,
        step_type: nextStep
      });
      setStudyContent(res.data?.ai_response || '');
    } catch (err) {
      console.error('Study step error:', err);
    } finally {
      setLoadingStudyStep(false);
    }
  };

  // Voice Synthesizer
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`]/g, ''));
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-black text-white relative">
      {/* Small Floating Notification Popup Toast */}
      {toastPopup.show && (
        <div className={`fixed bottom-20 right-3 sm:bottom-6 sm:right-6 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 z-50 border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toastPopup.type === 'saving'
            ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
            : toastPopup.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
            : 'bg-rose-950/90 text-rose-300 border-rose-500/50'
        }`}>
          {toastPopup.type === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
          {toastPopup.type === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          {toastPopup.type === 'error' && <X className="w-3.5 h-3.5 text-rose-400" />}
          <span>{toastPopup.message}</span>
        </div>
      )}

      {/* MAIN CENTER WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden h-full pb-16 md:pb-0">
        {/* Header Bar with Centered Topic Title & Sidebar Toggle */}
        <header className="px-3 sm:px-4 py-2.5 border-b border-[var(--border-default)] bg-[var(--surface-1)] flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-[var(--surface-2)] text-indigo-400 hover:text-white border border-white/10 transition shrink-0"
            title="Toggle OS Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Centered Topic Title */}
          <div className="flex-1 text-center truncate px-1">
            <h1 className="font-extrabold text-sm sm:text-base text-white truncate inline-flex items-center justify-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{sessionData?.title || sessionData?.chapter || 'ScholarOS Tutor AI'}</span>
              {sessionData?.difficulty && (
                <span className="hidden sm:inline text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {sessionData.difficulty}
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition"
              title="New Session"
            >
              <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New</span>
            </button>

            <button
              onClick={() => setShowRightInspector(!showRightInspector)}
              className="p-2 rounded-xl bg-[var(--surface-2)] text-gray-400 hover:text-white border border-white/10 transition"
              title="Inspect Memory Context"
            >
              <Compass className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </header>

        {/* Workspace Tab Strip (Scrollable without ugly scrollbar) */}
        <div className="no-scrollbar px-3 py-1.5 border-b border-[var(--border-default)] bg-[var(--surface-1)] flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto shrink-0 text-xs font-bold">
          {[
            { id: 'chat', label: '💬 Chat', icon: Brain },
            { id: 'study', label: '📖 Study', icon: Play },
            { id: 'notes', label: '📝 Notes', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition shrink-0 border ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                  : 'bg-[var(--surface-2)] text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          
          {/* TAB 1: AI TUTOR CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full space-y-2">
              {/* Messages Scroll Box */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold shrink-0 border border-indigo-500/40 mt-1">
                        <Brain className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'max-w-[80%] sm:max-w-xl bg-indigo-600 text-white font-medium rounded-tr-none shadow-md'
                          : 'max-w-[92%] sm:max-w-3xl bg-[var(--surface-1)] text-gray-100 border border-[var(--border-default)] rounded-tl-none space-y-2.5 shadow-xl'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <FormattedChatMessage content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}

                      {msg.role === 'assistant' && msg.content && (
                        <div className="flex items-center gap-3 pt-2 border-t border-white/10 text-[11px] text-gray-400">
                          <button onClick={() => speakText(msg.content)} className="hover:text-indigo-300 flex items-center gap-1 font-semibold transition">
                            <Volume2 className="w-3 h-3" /> Read
                          </button>

                          <button
                            onClick={() => handleSaveToNotes(idx, msg.content)}
                            disabled={savingNotesStatus[idx]}
                            className="hover:text-emerald-300 flex items-center gap-1 font-semibold transition text-emerald-400/90 disabled:opacity-60"
                          >
                            {savingNotesStatus[idx] ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> Saving...
                              </>
                            ) : savedNotesStatus[idx] ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Saved!
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-3 h-3" /> Save Note 📌
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Action Chips (Single line horizontal touch scroll) */}
              <div className="no-scrollbar py-1.5 px-1 flex items-center gap-1.5 overflow-x-auto border-t border-[var(--border-default)] shrink-0">
                {[
                  { label: '💡 Explain Deeper', action: 'explain_better' },
                  { label: '📌 Summary', action: 'summarize' },
                  { label: '📝 Save Note', action: 'notes' },
                  { label: '📊 Mindmap', action: 'mindmap' },
                  { label: '❓ Quiz', action: 'quiz' },
                  { label: '🗣️ Tanglish', action: 'translate_tanglish' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.label, chip.action)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-indigo-600/30 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition shrink-0 shadow-sm"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Form Pinned above Mobile Bottom Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 shrink-0 pt-1"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Tutor AI anything..."
                  className="flex-1 px-3.5 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !inputMessage.trim()}
                  className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50 shrink-0 shadow-lg"
                >
                  {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ACTIVE STUDY MODE */}
          {activeTab === 'study' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-400">Active Socratic Tuition</span>
                  <h2 className="text-base sm:text-lg font-bold text-white">Interactive Step Session</h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={studyTopic}
                    onChange={(e) => setStudyTopic(e.target.value)}
                    placeholder="Topic e.g. Transcription"
                    className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-white/10 text-xs text-white flex-1"
                  />
                  <button
                    onClick={() => handleActiveStudyStep('explain')}
                    disabled={loadingStudyStep}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
                  >
                    {loadingStudyStep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Start
                  </button>
                </div>
              </div>

              {studyContent ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-indigo-500/30 text-xs sm:text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {studyContent}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-indigo-300 uppercase block">Your Explanation:</label>
                    <textarea
                      rows={3}
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      placeholder="Type your answer to the Socratic question..."
                      className="w-full p-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleActiveStudyStep('evaluate')}
                      disabled={loadingStudyStep || !studentAnswer.trim()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                    >
                      {loadingStudyStep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Submit Answer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl bg-[var(--surface-2)] border border-dashed border-white/10 space-y-2">
                  <Play className="w-8 h-8 text-indigo-400 mx-auto" />
                  <p className="text-xs text-gray-400">Click Start to begin Socratic step-by-step tuition.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Continuous Evolving Notes
                </h2>
                <Link href="/notes" className="text-xs text-indigo-400 font-bold hover:underline">
                  Open Vault 📚
                </Link>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-white/5 space-y-2 text-xs text-gray-200">
                <p className="font-bold text-indigo-300"># {sessionData?.title || 'Academic Notes'}</p>
                <p className="leading-relaxed">1. Key definitions & formulas stored continuously in backend database memory.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* RIGHT DRAWER / CONTEXT INSPECTOR */}
      {showRightInspector && (
        <aside className="w-72 bg-[var(--surface-1)] border-l border-[var(--border-default)] p-4 space-y-4 shrink-0 overflow-y-auto z-40 fixed right-0 top-0 bottom-0 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-400" /> Memory Context
            </h3>
            <button onClick={() => setShowRightInspector(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[var(--surface-2)] space-y-1">
              <span className="text-[9px] uppercase font-bold text-gray-400">Session Goal</span>
              <p className="font-semibold text-indigo-300">{sessionData?.goal || 'Master course concepts'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-2)] space-y-1">
              <span className="text-[9px] uppercase font-bold text-gray-400">Chapter</span>
              <p className="font-semibold text-white">{sessionData?.chapter || 'General Topic'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-2)] space-y-1">
              <span className="text-[9px] uppercase font-bold text-rose-400">Focus Areas</span>
              <p className="font-semibold text-rose-300">{memory?.weak_topics?.join(', ') || 'None'}</p>
            </div>
          </div>
        </aside>
      )}

      {/* CREATE SESSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" /> New Study Session
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white font-bold text-xs">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSessionMutation.mutate();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Physics Mechanics Revision"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">Chapter / Topic</label>
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="e.g. Rotational Mechanics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">Study Goal</label>
                <textarea
                  rows={2}
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g. Master torque and angular momentum formulas"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] text-gray-300 font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSessionMutation.isPending || !newTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  {createSessionMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Create 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
