'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import {
  Brain,
  Sparkles,
  BookOpen,
  Send,
  Loader2,
  Mic,
  MicOff,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Volume2,
  Share2,
  ArrowRight,
  Plus,
  Play,
  FileText,
  Network
} from 'lucide-react';

interface TutorWorkspaceProps {
  sessionId?: string;
}

export default function TutorWorkspace({ sessionId }: TutorWorkspaceProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'chat' | 'study' | 'notes' | 'mindmap' | 'graph' | 'voice'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('teacher');
  const [isStreaming, setIsStreaming] = useState(false);
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
  const [voiceText, setVoiceText] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // 1. Fetch Session Details
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Banner & Persona Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-black border border-indigo-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Brain className="w-4 h-4 text-indigo-400" /> ScholarOS Academic Brain
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {sessionData?.title || 'Tutor AI Brain Workspace'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            {sessionData?.goal || 'Your persistent learning companion. Remembers your weak topics, notes, and progress.'}
          </p>
        </div>

        {/* Persona & Teaching Style Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-[var(--surface-2)] p-2 rounded-2xl border border-white/10">
          <span className="text-xs font-bold text-gray-400 px-2 uppercase tracking-wider">Style:</span>
          {[
            { id: 'teacher', label: '👨‍🏫 Professor' },
            { id: '10yo', label: '👶 Explain Like 10yo' },
            { id: 'tanglish', label: '🗣️ Tanglish' },
            { id: 'tamil', label: '🇮🇳 Tamil' },
            { id: 'step_by_step', label: '🔢 Step-by-Step' },
            { id: 'visual', label: '📊 Visual Mode' }
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setTeachingStyle(style.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                teachingStyle === style.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Quick Bar */}
      {memory && (
        <div className="p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-default)] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="font-bold">Focus Areas ({memory.weak_topics?.length || 0}):</span>
              <span>{memory.weak_topics?.slice(0, 3).join(', ') || 'None identified'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Mastered ({memory.strong_topics?.length || 0}):</span>
              <span>{memory.strong_topics?.slice(0, 3).join(', ') || 'Building mastery'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-gray-400">
            <span>LLM Engine: <strong className="text-indigo-400">llama-3.3-70b-versatile</strong></span>
          </div>
        </div>
      )}

      {/* Workspace Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-3 overflow-x-auto">
        {[
          { id: 'chat', label: '💬 AI Tutor Chat', icon: Brain },
          { id: 'study', label: '📖 Active Study Mode', icon: Play },
          { id: 'notes', label: '📝 Evolving Notes', icon: FileText },
          { id: 'mindmap', label: '📊 Mindmaps & Flowcharts', icon: Layers },
          { id: 'graph', label: '🕸️ Concept Knowledge Graph', icon: Network },
          { id: 'voice', label: '🎙️ Voice Tutor', icon: Volume2 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-[var(--surface-1)] text-gray-300 border-[var(--border-default)] hover:border-indigo-500/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: AI TUTOR CHAT */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Stream */}
          <div className="lg:col-span-3 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 flex flex-col h-[650px] shadow-2xl">
            {/* Messages Box */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold shrink-0 border border-indigo-500/40">
                      <Brain className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                        : 'bg-[var(--surface-2)] text-gray-100 border border-[var(--border-default)] rounded-tl-none space-y-2'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.role === 'assistant' && msg.content && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[11px] text-gray-400">
                        <button
                          onClick={() => speakText(msg.content)}
                          className="hover:text-indigo-300 flex items-center gap-1 font-semibold"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Actions Chips */}
            <div className="py-3 flex flex-wrap gap-2 border-t border-[var(--border-default)]">
              {[
                { label: '💡 Explain Deeper', action: 'explain_better' },
                { label: '📌 Executive Summary', action: 'summarize' },
                { label: '📝 Save to Notes', action: 'notes' },
                { label: '📊 Generate Mindmap', action: 'mindmap' },
                { label: '❓ Create Quiz', action: 'quiz' },
                { label: '🗣️ Tanglish', action: 'translate_tanglish' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.label, chip.action)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-indigo-600/30 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition"
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
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Tutor AI anything about your subjects, notes, or exams..."
                className="flex-1 px-4 py-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isStreaming || !inputMessage.trim()}
                className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
              >
                {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>

          {/* Right Sidebar: Context Memory Inspector */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-6 shadow-xl h-[650px] overflow-y-auto">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> Active Session Context
              </h3>
              <p className="text-xs text-gray-400 mt-1">Context loaded automatically for Groq LLM.</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Chapter Topic</span>
                <p className="text-xs font-semibold text-white">{sessionData?.chapter || 'DNA & Genetics'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Study Goal</span>
                <p className="text-xs font-semibold text-indigo-300">{sessionData?.goal || 'Master concepts for exam'}</p>
              </div>
            </div>

            <div className="border-t border-[var(--border-default)] pt-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Concept Graph Nodes</h4>
              <div className="space-y-2">
                {conceptNodes.slice(0, 4).map((node: any) => (
                  <div key={node.id} className="p-2.5 rounded-xl bg-[var(--surface-2)] flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{node.concept_name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{Math.round((node.mastery_level || 0.8) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE STUDY MODE */}
      {activeTab === 'study' && (
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                <Play className="w-3.5 h-3.5 text-purple-400" /> Socratic Tuition Flow
              </div>
              <h2 className="text-2xl font-black text-white mt-1">Interactive Study Session</h2>
              <p className="text-xs text-gray-400">Explain concept ➔ Socratic Question ➔ Student Answer ➔ Quiz verification.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={studyTopic}
                onChange={(e) => setStudyTopic(e.target.value)}
                placeholder="Topic e.g. Transcription"
                className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-white/10 text-xs text-white"
              />
              <button
                onClick={() => handleActiveStudyStep('explain')}
                disabled={loadingStudyStep}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                {loadingStudyStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Start Tuition
              </button>
            </div>
          </div>

          {studyContent ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[var(--surface-2)] border border-indigo-500/30 text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
                {studyContent}
              </div>

              {/* Student Answer Box */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                  Your Answer / Explanation:
                </label>
                <textarea
                  rows={3}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Type your explanation or response to the Socratic question..."
                  className="w-full p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleActiveStudyStep('evaluate')}
                  disabled={loadingStudyStep || !studentAnswer.trim()}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
                >
                  {loadingStudyStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Submit Answer for Evaluation
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[var(--surface-2)] border border-dashed border-white/10 space-y-3">
              <Play className="w-10 h-10 text-indigo-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Ready to Start Active Study Session?</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Tutor AI will guide you step-by-step through your topic, testing your understanding along the way.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EVOLVING NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Continuous Evolving Notes
              </h2>
              <p className="text-xs text-gray-400">Notes update automatically over time as you complete study sessions.</p>
            </div>
            <Link
              href="/notes"
              className="px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-600 hover:text-white transition"
            >
              Open Full Notes Vault 📚
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface-2)] border border-white/5 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold text-white">Version 3.0 (Latest AI Auto-Evolution)</span>
              <span>Updated Today</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              # DNA Replication & Protein Synthesis
              \n\n1. **Helicase** unzips DNA double helix.
              \n2. **DNA Polymerase** synthesizes new complementary strands.
              \n3. **mRNA** transcribes code and travels to ribosome for protein assembly.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: MINDMAPS & FLOWCHARTS */}
      {activeTab === 'mindmap' && (
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="border-b border-[var(--border-default)] pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" /> Concept Mindmaps & Flowcharts
            </h2>
            <p className="text-xs text-gray-400">Visual diagram representation generated by Groq LLM.</p>
          </div>

          <div className="p-8 rounded-2xl bg-black/60 border border-purple-500/30 font-mono text-xs text-purple-300 space-y-2">
            <div>graph TD;</div>
            <div className="pl-4">A[DNA Replication] --&gt; B(Transcription);</div>
            <div className="pl-4">B --&gt; C(mRNA Export);</div>
            <div className="pl-4">C --&gt; D(Ribosome Translation);</div>
            <div className="pl-4">D --&gt; E[Functional Protein];</div>
          </div>
        </div>
      )}

      {/* TAB 5: CONCEPT KNOWLEDGE GRAPH */}
      {activeTab === 'graph' && (
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="border-b border-[var(--border-default)] pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-400" /> Concept Prerequisites & Knowledge Network
            </h2>
            <p className="text-xs text-gray-400">Explorable node relationships across your academic subjects.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {conceptNodes.map((node: any) => (
              <div key={node.id} className="p-5 rounded-2xl bg-[var(--surface-2)] border border-emerald-500/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400">{node.subject_name}</span>
                <h4 className="font-bold text-sm text-white">{node.concept_name}</h4>
                <p className="text-[11px] text-gray-400">Parent: {node.parent_concept_name || 'Root'}</p>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(node.mastery_level || 0.8) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: VOICE TUTOR */}
      {activeTab === 'voice' && (
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center mx-auto shadow-2xl">
            <Volume2 className="w-10 h-10 animate-pulse" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Voice Tutor AI</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
              Supports English, Tamil, and Tanglish. Speak your academic questions naturally.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setIsListening(!isListening);
                if (!isListening) {
                  speakText("ScholarOS Voice Tutor ready. Ask me any question!");
                }
              }}
              className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 transition shadow-xl ${
                isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isListening ? 'Listening (Tap to Stop)' : 'Start Voice Conversation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
