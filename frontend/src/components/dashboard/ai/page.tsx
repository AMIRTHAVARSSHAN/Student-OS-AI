'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, BookOpen, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const quickPrompts = [
  { label: 'Create a study plan for Linear Regression', icon: CalendarDays },
  { label: 'Create notes for Deadlock Prevention', icon: BookOpen },
  { label: 'Check my attendance status', icon: CheckCircle2 },
];

export default function AIChatPage() {
  const { user } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Vanakkam! I am Scholar, your AI study companion. Ask me anything about your study plan, attendance, weak topics, or syllabus concepts! Try asking **\"Create a study plan for Linear Regression\"** or **\"Create notes for Deadlock Prevention\"** to auto-generate and save them directly to your database memory."
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (userTextToSubmit?: string) => {
    const text = userTextToSubmit || input.trim();
    if (!text || isGenerating) return;

    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value);
        const lines = chunkText.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr === '[DONE]') break;

            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'text') {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              }
            } catch (err) {
              // Parse fallback
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: 'Scholar AI is currently in offline mode. Make sure backend and Groq API are configured.' }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-6xl mx-auto pb-16 md:pb-0">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-default)] mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Groq Llama 3.3 70B Ultra-Fast Engine Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="font-bold text-xs sm:text-sm leading-tight text-white">Scholar AI Assistant</h2>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              Live Connection
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}

            <div
              className={`max-w-[90%] sm:max-w-xl p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--brand-primary)] text-white rounded-br-none shadow-md font-medium'
                  : 'bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-bl-none shadow-lg'
              }`}
            >
              {msg.role === 'assistant' ? (
                msg.content ? (
                  <MarkdownRenderer content={msg.content} />
                ) : isGenerating ? (
                  <span className="flex items-center gap-2 text-indigo-400 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thinking & generating notes...
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs italic">No response content</span>
                )
              ) : (
                <p>{msg.content}</p>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md mt-1">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Bar */}
      <div className="px-3 sm:px-4 py-2 bg-[var(--surface-2)]/20 border-t border-[var(--border-default)] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-indigo-400 shrink-0 uppercase tracking-wider hidden sm:inline">Try:</span>
        {quickPrompts.map((prompt, idx) => {
          const Icon = prompt.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(prompt.label)}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/20 whitespace-nowrap shrink-0 flex items-center gap-1 transition"
            >
              <Icon className="w-3 h-3 text-indigo-400" /> {prompt.label}
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-[var(--border-default)] bg-[var(--surface-2)]/30 flex items-center gap-2 sm:gap-3"
      >
        <input
          type="text"
          placeholder="Ask Scholar anything (e.g. Create a study plan for Linear Regression)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
        />
        <button
          type="submit"
          disabled={isGenerating || !input.trim()}
          className="bg-[var(--brand-primary)] hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 sm:p-3 rounded-xl transition shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
