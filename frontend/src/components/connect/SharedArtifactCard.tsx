'use client';

import { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Brain, 
  HelpCircle, 
  FileDown, 
  Check, 
  Download, 
  Sparkles,
  BookmarkPlus
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface SharedArtifactProps {
  type: string;
  metadata?: any;
  content?: string;
}

export default function SharedArtifactCard({ type, metadata = {}, content }: SharedArtifactProps) {
  const [imported, setImported] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleImportToVault = async () => {
    setImporting(true);
    try {
      if (type === 'shared_note') {
        await apiClient.post('/notes', {
          title: metadata.title || 'Shared Note Import',
          content: content || metadata.content || 'Imported shared note content.',
          topic: metadata.topic || 'Shared',
          tags: ['shared_import', 'scholar_connect']
        });
      }
      setImported(true);
      setTimeout(() => setImported(false), 3000);
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'shared_note':
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'shared_pdf':
        return <FileDown className="w-5 h-5 text-rose-400" />;
      case 'shared_flashcard':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'shared_mindmap':
        return <Layers className="w-5 h-5 text-emerald-400" />;
      case 'shared_quiz':
        return <HelpCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getTitle = () => {
    return metadata?.title || metadata?.topic || 'Shared Academic Artifact';
  };

  return (
    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 max-w-sm w-full my-2 shadow-xl hover:border-indigo-500/40 transition">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            {getIcon()}
          </div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-300">
            {type.replace('shared_', '').toUpperCase()}
          </span>
        </div>

        <button
          onClick={handleImportToVault}
          disabled={importing || imported}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
            imported
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
          }`}
        >
          {imported ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> In My Vault
            </>
          ) : (
            <>
              <BookmarkPlus className="w-3.5 h-3.5" /> Import
            </>
          )}
        </button>
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-sm text-white truncate">{getTitle()}</h4>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {content || metadata.description || 'Academic resource shared via ScholarConnect.'}
        </p>
      </div>
    </div>
  );
}
