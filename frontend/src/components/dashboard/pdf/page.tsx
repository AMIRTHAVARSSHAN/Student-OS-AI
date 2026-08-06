'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  FileText, 
  Upload, 
  Search, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  FileCheck, 
  Trash2, 
  X, 
  Loader2, 
  Send, 
  Plus, 
  Save, 
  Check, 
  Globe
} from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface PDFDocument {
  id: string;
  filename: string;
  file_path?: string;
  file_size: number | string;
  page_count: number;
  summary?: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function PDFReaderPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Active PDF for AI Chat Modal
  const [activePdfForChat, setActivePdfForChat] = useState<PDFDocument | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Active PDF Note Generation state
  const [generatingNoteForId, setGeneratingNoteForId] = useState<string | null>(null);
  const [noteSuccessMsg, setNoteSuccessMsg] = useState('');

  // Fetch real uploaded PDFs from backend database
  const { data: pdfs, isLoading } = useQuery<PDFDocument[]>({
    queryKey: ['pdfs'],
    queryFn: async () => {
      const res = await apiClient.get('/pdf');
      return res.data || [];
    },
  });

  // Delete PDF Mutation
  const deleteMutation = useMutation({
    mutationFn: async (pdfId: string) => {
      await apiClient.delete(`/pdf/${pdfId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdfs'] });
    },
  });

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files (.pdf) are supported.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await apiClient.post('/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await queryClient.invalidateQueries({ queryKey: ['pdfs'] });
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading PDF:', err);
      setUploadError(err.response?.data?.detail || 'Failed to upload and process PDF.');
      setIsUploading(false);
    }
  };

  // Open Chat with PDF Modal
  const handleOpenChat = (pdf: PDFDocument) => {
    setActivePdfForChat(pdf);
    setChatMessages([
      {
        sender: 'ai',
        text: `Hello! I am Scholar AI. Ask me any question about **${pdf.filename}** (${pdf.page_count} pages), and I will explain concepts and pull answers directly from the textbook context!`,
      },
    ]);
    setChatInput('');
  };

  // Send Question to PDF Chat
  const handleSendChatQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activePdfForChat) return;

    const question = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setChatLoading(true);

    try {
      const res = await apiClient.post(`/pdf/${activePdfForChat.id}/chat`, {
        question: question,
        language: 'en',
      });

      const aiAnswer = res.data?.answer || 'Unable to generate answer from PDF context.';
      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiAnswer }]);
      setChatLoading(false);
    } catch (err: any) {
      console.error('Error in PDF Chat:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ Error retrieving answer: ${err.response?.data?.detail || 'Failed to connect to AI server.'}`,
        },
      ]);
      setChatLoading(false);
    }
  };

  // Generate & Save Note from PDF directly to Notes Vault
  const handleGenerateNoteFromPdf = async (pdf: PDFDocument) => {
    setGeneratingNoteForId(pdf.id);
    setNoteSuccessMsg('');

    try {
      const res = await apiClient.post(`/pdf/${pdf.id}/generate-note`, {
        topic_or_instructions: 'Create full unit study notes with headings and summary checklist',
        language: 'en',
      });

      setNoteSuccessMsg(`Generated & saved study note "${res.data?.title}" to Notes Vault! 🚀`);
      setGeneratingNoteForId(null);
      setTimeout(() => setNoteSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error('Error generating note from PDF:', err);
      alert(err.response?.data?.detail || 'Failed to generate note from PDF.');
      setGeneratingNoteForId(null);
    }
  };

  // Save AI Chat Answer to Notes Vault
  const handleSaveAnswerToNotes = async (answerText: string) => {
    if (!activePdfForChat) return;
    try {
      await apiClient.post('/notes', {
        title: `Q&A Note: ${activePdfForChat.filename}`,
        content: answerText,
        source: 'pdf-extracted',
        topic: activePdfForChat.filename,
      });

      alert('Answer saved directly into your Notes Vault memory! 💾');
    } catch (err: any) {
      console.error('Error saving note:', err);
      alert('Failed to save note to database.');
    }
  };

  // Filter PDFs by search
  const filteredPdfs = pdfs?.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.filename.toLowerCase().includes(q) || (p.summary && p.summary.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-black border border-indigo-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Vector Textbook RAG Vault
          </div>
          <h1 className="text-3xl font-black text-white">PDF Reader & AI Knowledge RAG</h1>
          <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
            Upload real textbooks, syllabus sheets, and lecture PDFs to store in your database memory, ask questions via AI Chat, and extract study notes.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-105 transform-gpu disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading & Indexing PDF...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Upload PDF Textbook
            </>
          )}
        </button>
      </div>

      {uploadError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <X className="w-4 h-4 text-rose-400" /> {uploadError}
        </div>
      )}

      {noteSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" /> {noteSuccessMsg}
        </div>
      )}

      {/* Semantic Search Box */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-4 flex items-center gap-3 shadow-md">
        <Search className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
        <input
          type="text"
          placeholder="Search inside your uploaded textbooks (e.g. Data Structures, Operating Systems)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-xs text-white focus:outline-none"
        />
      </div>

      {/* Real PDF Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading document vault...</div>
      ) : filteredPdfs && filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-4 hover:border-indigo-500/50 transition flex flex-col justify-between shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="font-bold text-base text-white truncate leading-snug" title={pdf.filename}>
                    {pdf.filename}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-mono">
                    {pdf.page_count} Pages • {pdf.file_size} • {new Date(pdf.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => deleteMutation.mutate(pdf.id)}
                  title="Delete PDF"
                  className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border-default)]">
                <button
                  onClick={() => handleOpenChat(pdf)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-4 h-4" /> AI Chat with PDF
                </button>

                <button
                  onClick={() => handleGenerateNoteFromPdf(pdf)}
                  disabled={generatingNoteForId === pdf.id}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  {generatingNoteForId === pdf.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-300" /> Extracting Note...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate & Save Note 🚀
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[var(--surface-1)] border border-dashed border-[var(--border-default)] space-y-4 max-w-lg mx-auto mt-8">
          <BookOpen className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="font-semibold text-lg text-white">Your PDF RAG Vault is Empty</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Upload real textbooks, syllabus sheets, or lecture PDF files to enable AI Q&A Chat and automated note generation.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/30"
          >
            <Upload className="w-4 h-4" /> Upload First PDF
          </button>
        </div>
      )}

      {/* PDF AI Chat Modal Drawer */}
      {activePdfForChat && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-4xl h-[85vh] bg-[#0d0c15] border border-indigo-500/40 rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      PDF Vector RAG
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{activePdfForChat.page_count} Pages</span>
                  </div>
                  <h3 className="font-bold text-base text-white truncate" title={activePdfForChat.filename}>
                    {activePdfForChat.filename}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActivePdfForChat(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 select-text">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white font-medium rounded-br-none'
                        : 'bg-black/60 border border-white/15 text-gray-200 rounded-bl-none shadow-lg'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p>{msg.text}</p>
                    ) : (
                      <>
                        <MarkdownRenderer content={msg.text} />

                        {idx > 0 && (
                          <div className="pt-3 border-t border-white/10 flex justify-end">
                            <button
                              onClick={() => handleSaveAnswerToNotes(msg.text)}
                              className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition"
                            >
                              <Save className="w-3 h-3" /> Save to Notes Memory 💾
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/15 text-indigo-300 text-xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Scholar AI is analyzing document context...
                  </div>
                </div>
              )}
            </div>

            {/* Question Input Form */}
            <form onSubmit={handleSendChatQuestion} className="flex gap-3 shrink-0 pt-2 border-t border-white/10">
              <input
                type="text"
                placeholder={`Ask any question about ${activePdfForChat.filename}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Ask AI
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
