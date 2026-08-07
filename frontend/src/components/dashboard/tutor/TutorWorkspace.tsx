'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Sparkles,
  BookOpen,
  Send,
  Loader2,
  Mic,
  MicOff,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Plus,
  Play,
  FileText,
  Network,
  PanelLeft,
  ChevronRight,
  X,
  Compass,
  Zap
} from 'lucide-react';

interface TutorWorkspaceProps {
  sessionId?: string;
}

export default function TutorWorkspace({ sessionId }: TutorWorkspaceProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [showSessionsSidebar, setShowSessionsSidebar] = useState(false);
  const [showRightInspector, setShowRightInspector] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'study' | 'notes' | 'mindmap' | 'graph' | 'voice'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('teacher');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Create Session Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('intermediate');

  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: '👋 Welcome to **ScholarOS Tutor AI**! I am your persistent Academic Brain. Select a study session or ask me anything — I remember your notes, weak topics, and past quizzes to guide your study journey!'
    }
  ]);

  // Active Study Mode State
  const [studyTopic, setStudyTopic] = useState('');
  const [studyStep, setStudyStep] = useState<'explain' | 'evaluate' | 'quiz'>('explain');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [studyContent, setStudyContent] = useState('');
  const [loadingStudyStep, setLoadingStudyStep] = useState(false);

  // Voice State
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // 1. Fetch All Sessions for left sidebar navigation
  const { data: allSessions } = useQuery({
    queryKey: ['tutor_sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/tutor/sessions');
      return res.data || [];
    },
  });

  // 2. Fetch Active Session Details
  const { data: sessionData } = useQuery({
    queryKey: ['tutor_session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const res = await apiClient.get(`/tutor/sessions/${sessionId}`);
      return res.data;
    },
    enabled: Boolean(sessionId),
  });

  // 3. Fetch User Academic Memory
  const { data: memory } = useQuery({
    queryKey: ['tutor_memory'],
    queryFn: async () => {
      const res = await apiClient.get('/tutor/memory');
      return res.data;
    },
  });

  // 4. Fetch Concept Graph
  const { data: conceptNodes } = useQuery({
    queryKey: ['concept_graph'],
    queryFn: async () => {
      const res = await apiClient.get('/tutor/concept-graph');
      return res.data || [];
    },
  });

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

  // Send Streaming AI Chat Message
  const handleSendMessage = async (customMessage?: string, actionType?: string) => {
    const textToSend = customMessage || inputMessage;
    if (!textToSend.trim() || isStreaming) return;

    if (!customMessage) setInputMessage('');

    const updatedMsgs = [...messages, { role: 'user', content: textToSend }];
    setMessages(updatedMsgs);
    setIsStreaming(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/tutor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: textToSend,
          action: actionType,
          teaching_style: teachingStyle
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
      setStudyStep(nextStep === 'explain' ? 'evaluate' : nextStep === 'evaluate' ? 'quiz' : 'explain');
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
    <div className="flex h-[calc(100vh-5rem)] max-w-[1700px] mx-auto overflow-hidden bg-black text-white rounded-3xl border border-[var(--border-default)] shadow-2xl">
      
      {/* 1. LEFT SESSIONS SIDEBAR (STUDENT OS COMPACT DRAWER) */}
      <aside
        className={`w-72 bg-[var(--surface-1)] border-r border-[var(--border-default)] flex flex-col justify-between shrink-0 transition-all duration-300 z-30 ${
          showSessionsSidebar ? 'fixed inset-y-0 left-0 w-80 shadow-2xl bg-black md:relative md:w-72' : 'hidden md:flex'
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Header & New Session Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Brain className="w-4 h-4 text-indigo-400" /> SESSIONS ({allSessions?.length || 0})
            </div>
            <button
              onClick={() => setShowSessionsSidebar(false)}
              className="md:hidden p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> + NEW SESSION
          </button>

          {/* Categorized Sessions List */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">
              Active Workspaces
            </span>

            <div className="space-y-1.5">
              {allSessions && allSessions.length > 0 ? (
                allSessions.map((sess: any) => {
                  const isActive = sessionId === sess.id;
                  return (
                    <Link
                      key={sess.id}
                      href={`/tutor/${sess.id}`}
                      onClick={() => setShowSessionsSidebar(false)}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-semibold transition border ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-md font-bold'
                          : 'bg-[var(--surface-2)] text-gray-300 border-transparent hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate text-xs">{sess.title}</p>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">
                          {sess.chapter || 'General'}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                    </Link>
                  );
                })
              ) : (
                <p className="text-[11px] text-gray-500 py-2">No active sessions.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Academic Memory Pills */}
        <div className="p-3 border-t border-[var(--border-default)] bg-[var(--surface-2)] text-[10px] space-y-1">
          <div className="flex items-center justify-between text-gray-400 font-mono">
            <span>WEAK: <strong className="text-rose-400">{memory?.weak_topics?.length || 0}</strong></span>
            <span>MASTERED: <strong className="text-emerald-400">{memory?.strong_topics?.length || 0}</strong></span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CENTER WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden">
        {/* Compact Header Bar */}
        <header className="px-4 py-3 border-b border-[var(--border-default)] bg-[var(--surface-1)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowSessionsSidebar(!showSessionsSidebar)}
              className="p-2 rounded-xl bg-[var(--surface-2)] text-indigo-400 hover:text-white border border-white/10 transition"
              title="Toggle Sessions Drawer"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <h1 className="font-extrabold text-sm sm:text-base text-white truncate flex items-center gap-2">
                {sessionData?.title || 'ScholarOS Tutor AI Workspace'}
                {sessionData?.difficulty && (
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {sessionData.difficulty}
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-gray-400 truncate">
                {sessionData?.goal || 'Persistent AI Academic Brain active.'}
              </p>
            </div>
          </div>

          {/* Style Selector Pills */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-md bg-[var(--surface-2)] p-1 rounded-xl border border-white/10">
            {[
              { id: 'teacher', label: '👨‍🏫 Professor' },
              { id: '10yo', label: '👶 10yo' },
              { id: 'tanglish', label: '🗣️ Tanglish' },
              { id: 'tamil', label: '🇮🇳 Tamil' },
              { id: 'step_by_step', label: '🔢 Step-by-Step' },
              { id: 'visual', label: '📊 Visual' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setTeachingStyle(st.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                  teachingStyle === st.id
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRightInspector(!showRightInspector)}
            className="p-2 rounded-xl bg-[var(--surface-2)] text-gray-400 hover:text-white border border-white/10 transition shrink-0"
            title="Inspect Context Memory"
          >
            <Compass className="w-4 h-4 text-purple-400" />
          </button>
        </header>

        {/* Compact Workspace Tab Strip */}
        <div className="px-4 py-2 border-b border-[var(--border-default)] bg-[var(--surface-1)] flex items-center gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          {[
            { id: 'chat', label: '💬 AI Tutor Chat', icon: Brain },
            { id: 'study', label: '📖 Active Study', icon: Play },
            { id: 'notes', label: '📝 Notes', icon: FileText },
            { id: 'mindmap', label: '📊 Mindmaps', icon: Layers },
            { id: 'graph', label: '🕸️ Knowledge Graph', icon: Network },
            { id: 'voice', label: '🎙️ Voice', icon: Volume2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0 border ${
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: AI TUTOR CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full space-y-3">
              {/* Messages Scroll Box */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold shrink-0 border border-indigo-500/40">
                        <Brain className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                          : 'bg-[var(--surface-2)] text-gray-100 border border-[var(--border-default)] rounded-tl-none space-y-2'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {msg.role === 'assistant' && msg.content && (
                        <div className="flex items-center gap-2 pt-1.5 border-t border-white/10 text-[10px] text-gray-400">
                          <button onClick={() => speakText(msg.content)} className="hover:text-indigo-300 flex items-center gap-1 font-semibold">
                            <Volume2 className="w-3 h-3" /> Read Aloud
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Actions Chips */}
              <div className="py-1.5 flex flex-wrap gap-1.5 border-t border-[var(--border-default)] shrink-0">
                {[
                  { label: '💡 Explain Deeper', action: 'explain_better' },
                  { label: '📌 Executive Summary', action: 'summarize' },
                  { label: '📝 Save to Notes', action: 'notes' },
                  { label: '📊 Mindmap', action: 'mindmap' },
                  { label: '❓ Quiz', action: 'quiz' },
                  { label: '🗣️ Tanglish', action: 'translate_tanglish' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.label, chip.action)}
                    className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-indigo-600/30 border border-white/10 text-[11px] font-semibold text-gray-300 hover:text-white transition"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Tutor AI anything..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !inputMessage.trim()}
                  className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50 shrink-0"
                >
                  {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ACTIVE STUDY MODE */}
          {activeTab === 'study' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-400">Active Socratic Tuition</span>
                  <h2 className="text-lg font-bold text-white">Interactive Step Session</h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={studyTopic}
                    onChange={(e) => setStudyTopic(e.target.value)}
                    placeholder="Topic e.g. Transcription"
                    className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-white/10 text-xs text-white"
                  />
                  <button
                    onClick={() => handleActiveStudyStep('explain')}
                    disabled={loadingStudyStep}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    {loadingStudyStep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Start
                  </button>
                </div>
              </div>

              {studyContent ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-indigo-500/30 text-xs sm:text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {studyContent}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-indigo-300 uppercase block">Your Answer / Response:</label>
                    <textarea
                      rows={3}
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      placeholder="Type your answer to the Socratic question..."
                      className="w-full p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleActiveStudyStep('evaluate')}
                      disabled={loadingStudyStep || !studentAnswer.trim()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      {loadingStudyStep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Submit Answer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-[var(--surface-2)] border border-dashed border-white/10 space-y-2">
                  <Play className="w-8 h-8 text-indigo-400 mx-auto" />
                  <p className="text-xs text-gray-400">Click Start to begin Socratic step-by-step tuition.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Continuous Evolving Notes
                </h2>
                <Link href="/notes" className="text-xs text-indigo-400 font-bold hover:underline">
                  Open Vault 📚
                </Link>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-white/5 space-y-2 text-xs text-gray-200">
                <p className="font-bold text-indigo-300"># {sessionData?.title || 'Academic Notes'}</p>
                <p className="leading-relaxed">1. Key definitions & formulas stored continuously in backend database memory.</p>
              </div>
            </div>
          )}

          {/* TAB 4: MINDMAP */}
          {activeTab === 'mindmap' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Concept Mindmaps
              </h2>
              <div className="p-6 rounded-xl bg-black/60 border border-purple-500/30 font-mono text-xs text-purple-300">
                graph TD; A[{sessionData?.title || 'Topic'}] --&gt; B(Core Concepts); B --&gt; C(Exams & Practice);
              </div>
            </div>
          )}

          {/* TAB 5: CONCEPT GRAPH */}
          {activeTab === 'graph' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-400" /> Knowledge Graph Nodes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(conceptNodes || []).map((node: any) => (
                  <div key={node.id} className="p-4 rounded-xl bg-[var(--surface-2)] border border-emerald-500/30 space-y-1 text-xs">
                    <span className="text-[9px] uppercase font-bold text-emerald-400">{node.subject_name}</span>
                    <h4 className="font-bold text-white">{node.concept_name}</h4>
                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(node.mastery_level || 0.8) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: VOICE TUTOR */}
          {activeTab === 'voice' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500 text-indigo-400 flex items-center justify-center mx-auto shadow-xl">
                <Volume2 className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-lg font-black text-white">Voice Tutor AI</h2>
              <p className="text-xs text-gray-400">Supports English, Tamil, and Tanglish speech interaction.</p>
              <button
                onClick={() => {
                  setIsListening(!isListening);
                  if (!isListening) speakText("Voice Tutor active. Ask your academic question!");
                }}
                className={`px-6 py-3 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition ${
                  isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? 'Stop Listening' : 'Start Voice Conversation'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 3. RIGHT DRAWER / CONTEXT INSPECTOR */}
      {showRightInspector && (
        <aside className="w-72 bg-[var(--surface-1)] border-l border-[var(--border-default)] p-4 space-y-4 shrink-0 overflow-y-auto z-30">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-400" /> Academic Memory Context
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
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">Chapter / Topic</label>
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="e.g. Rotational Mechanics"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">Study Goal</label>
                <textarea
                  rows={2}
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g. Master torque and angular momentum formulas"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-xl bg-[var(--surface-2)] text-gray-300 font-bold hover:bg-white/10"
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
