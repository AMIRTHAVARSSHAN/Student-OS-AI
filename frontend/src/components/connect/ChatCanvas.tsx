'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  FileText, 
  Brain, 
  Layers, 
  HelpCircle, 
  Loader2, 
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import SharedArtifactCard from './SharedArtifactCard';

interface ChatCanvasProps {
  channelId: string;
}

export default function ChatCanvas({ channelId }: ChatCanvasProps) {
  const queryClient = useQueryClient();
  const [inputMsg, setInputMsg] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [activeShareType, setActiveShareType] = useState<'text' | 'shared_note' | 'shared_pdf' | 'shared_flashcard' | 'shared_mindmap' | 'shared_quiz'>('text');
  const [shareTitle, setShareTitle] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['connect_messages', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const res = await apiClient.get(`/connect/messages/${channelId}`);
      return res.data || [];
    },
    enabled: Boolean(channelId),
    refetchInterval: 3000,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsgMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/connect/messages', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connect_messages', channelId] });
      setInputMsg('');
      setShareTitle('');
      setActiveShareType('text');
    },
  });

  const handleSend = () => {
    if (!inputMsg.trim() && activeShareType === 'text') return;

    sendMsgMutation.mutate({
      channel_id: channelId,
      content: inputMsg || `Shared ${activeShareType.replace('shared_', '')}`,
      message_type: activeShareType,
      attachment_metadata: activeShareType !== 'text' ? { title: shareTitle || 'Shared Resource', type: activeShareType } : {}
    });
  };

  return (
    <div className="flex flex-col h-full bg-black rounded-3xl border border-[var(--border-default)] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-4 bg-[var(--surface-1)] border-b border-[var(--border-default)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-sm text-white">Channel: {channelId}</h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              ● End-to-End Encrypted Academic Chat
            </span>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isLoading ? (
          <div className="text-center text-xs text-gray-500 py-8">Loading encrypted messages...</div>
        ) : messages && messages.length > 0 ? (
          messages.map((m: any) => (
            <div key={m.id} className="flex flex-col space-y-1">
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <span className="font-bold text-white">{m.sender_name}</span>
                <span className="font-mono text-[10px]">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {m.message_type && m.message_type.startsWith('shared_') ? (
                <SharedArtifactCard type={m.message_type} metadata={m.attachment_metadata} content={m.content} />
              ) : (
                <div className="p-3.5 rounded-2xl bg-[var(--surface-1)] border border-white/10 text-xs sm:text-sm text-gray-100 max-w-xl leading-relaxed whitespace-pre-wrap shadow-md">
                  {m.content}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-gray-500">
            No messages sent in this channel yet. Say hi or share a study note!
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Artifact Attachment Toolbar */}
      <div className="px-4 py-2 border-t border-[var(--border-default)] bg-[var(--surface-1)] flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
        <span className="text-[10px] font-bold text-gray-400 uppercase">Share:</span>
        {[
          { id: 'text', label: '💬 Text' },
          { id: 'shared_note', label: '📝 Note' },
          { id: 'shared_pdf', label: '📄 PDF' },
          { id: 'shared_flashcard', label: '🧠 Flashcard' },
          { id: 'shared_mindmap', label: '📊 Mindmap' },
          { id: 'shared_quiz', label: '❓ Quiz' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveShareType(item.id as any)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 border ${
              activeShareType === item.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                : 'bg-[var(--surface-2)] text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[var(--surface-1)] border-t border-[var(--border-default)] space-y-2 shrink-0">
        {activeShareType !== 'text' && (
          <input
            type="text"
            value={shareTitle}
            onChange={(e) => setShareTitle(e.target.value)}
            placeholder={`Enter title for shared ${activeShareType.replace('shared_', '')}...`}
            className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-indigo-500/40 text-xs text-white focus:outline-none"
          />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceRecording(!isVoiceRecording)}
            className={`p-3 rounded-2xl border transition ${
              isVoiceRecording ? 'bg-rose-600 text-white border-rose-500 animate-pulse' : 'bg-[var(--surface-2)] text-gray-400 border-white/10'
            }`}
            title="Record Voice Note"
          >
            {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type encrypted message or notes link..."
            className="flex-1 px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleSend}
            disabled={sendMsgMutation.isPending || (!inputMsg.trim() && activeShareType === 'text')}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50 shadow-lg"
          >
            {sendMsgMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
