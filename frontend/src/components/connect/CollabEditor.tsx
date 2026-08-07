'use client';

import { useState } from 'react';
import { FileText, Users, Sparkles, Save, Check } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function CollabEditor() {
  const [collabText, setCollabText] = useState(
    '# 📖 Shared Collaborative Study Note\n\n- **Topic**: Data Structures & Algorithms\n- **Collaborators**: Priya, Amirthavarsshan\n\n## Core Concepts\n1. Binary Trees traversal order: Pre-order, In-order, Post-order.\n2. Graph shortest path: Dijkstra algorithm.'
  );
  const [isEditing, setIsEditing] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Live Collaborative Note Canvas</h2>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Users className="w-3 h-3 text-emerald-400" /> 2 Co-Editors Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300"
          >
            {isEditing ? 'Preview Compiled' : 'Edit Text'}
          </button>
          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save State'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <textarea
          rows={10}
          value={collabText}
          onChange={(e) => setCollabText(e.target.value)}
          className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
        />
      ) : (
        <div className="p-6 rounded-2xl bg-black/60 border border-white/10 text-xs leading-relaxed text-white">
          <MarkdownRenderer content={collabText} />
        </div>
      )}
    </div>
  );
}
