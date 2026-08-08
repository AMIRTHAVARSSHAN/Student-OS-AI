'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import CodeBlock from '@/components/CodeBlock';
import MathRenderer, { renderTextWithMath } from '@/components/MathRenderer';
import RechartsBlock from './RechartsBlock';
import ComparisonBlock from './ComparisonBlock';
import InteractiveQuizBlock from './InteractiveQuizBlock';
import { Lightbulb, Award, ShieldAlert, Sparkles, Copy, Check, HelpCircle } from 'lucide-react';

const MermaidDiagram = dynamic(() => import('@/components/MermaidDiagram'), { ssr: false });

interface TiptapRendererProps {
  tiptapJson?: any;
  content?: string;
  onAskAI?: (prompt: string) => void;
}

export default function TiptapRenderer({ tiptapJson, content, onAskAI }: TiptapRendererProps) {
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlockId(id);
      setTimeout(() => setCopiedBlockId(null), 2000);
    } catch (err) {
      console.error('Failed to copy block text:', err);
    }
  };

  const renderNode = (node: any, idx: number): React.ReactNode => {
    if (!node) return null;
    const key = `node-${idx}-${node.type}`;

    switch (node.type) {
      case 'doc':
        return (
          <div key={key} className="space-y-4 print-container select-text">
            {(node.content || []).map((child: any, cIdx: number) => renderNode(child, cIdx))}
          </div>
        );

      case 'heading': {
        const level = node.attrs?.level || 2;
        const textContent = renderInlineContent(node.content);
        if (level === 1) {
          return (
            <h1 key={key} className="text-2xl sm:text-3xl font-black text-white mt-8 mb-4 pb-2 border-b border-indigo-500/30 tracking-tight">
              {textContent}
            </h1>
          );
        }
        if (level === 2) {
          return (
            <h2 key={key} className="text-xl sm:text-2xl font-extrabold text-indigo-300 mt-6 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-indigo-500 inline-block shrink-0" />
              {textContent}
            </h2>
          );
        }
        if (level === 3) {
          return (
            <h3 key={key} className="text-base sm:text-lg font-bold text-purple-300 mt-5 mb-2">
              {textContent}
            </h3>
          );
        }
        return (
          <h4 key={key} className="text-xs sm:text-sm font-bold text-indigo-200 uppercase tracking-wider mt-4 mb-2">
            {textContent}
          </h4>
        );
      }

      case 'paragraph': {
        const pText = extractPlainText(node);
        return (
          <div key={key} className="group relative my-2">
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {renderInlineContent(node.content)}
            </p>
            {onAskAI && pText.trim().length > 10 && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-1">
                <button
                  onClick={() => onAskAI(`Explain this concept in simpler terms: "${pText}"`)}
                  className="text-[10px] text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Explain Block
                </button>
                <button
                  onClick={() => handleCopyText(pText, key)}
                  className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
                >
                  {copiedBlockId === key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedBlockId === key ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        );
      }

      case 'codeBlock': {
        const codeText = extractPlainText(node);
        const language = node.attrs?.language || 'python';
        return <CodeBlock key={key} code={codeText} language={language} />;
      }

      case 'formula': {
        const latex = node.attrs?.latex || extractPlainText(node);
        return <MathRenderer key={key} latex={latex} displayMode={true} />;
      }

      case 'callout': {
        const title = node.attrs?.title || 'Key Academic Insight';
        return (
          <div key={key} className="my-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 text-xs sm:text-sm space-y-2 shadow-xl page-break-avoid">
            <div className="flex items-center gap-2 font-bold text-indigo-300 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0" /> {title}
            </div>
            <div>{(node.content || []).map((child: any, cIdx: number) => renderNode(child, cIdx))}</div>
          </div>
        );
      }

      case 'examTip': {
        const title = node.attrs?.title || 'EXAM FOCUS';
        const text = node.attrs?.text || extractPlainText(node);
        return (
          <div key={key} className="my-4 p-4 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-purple-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-xl page-break-avoid">
            <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-300 font-extrabold block mb-0.5 uppercase tracking-wider">{title}</strong>
              <p className="leading-relaxed">{text}</p>
            </div>
          </div>
        );
      }

      case 'commonMistake': {
        const pitfall = node.attrs?.pitfall || extractPlainText(node);
        const correction = node.attrs?.correction || 'Double-check concept definitions.';
        return (
          <div key={key} className="my-4 p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs sm:text-sm space-y-2 shadow-xl page-break-avoid">
            <div className="flex items-center gap-2 text-rose-300 font-extrabold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" /> Common Mistake Pitfall
            </div>
            <p className="leading-relaxed font-semibold text-rose-100">❌ {pitfall}</p>
            <p className="leading-relaxed text-emerald-300 font-semibold">✅ {correction}</p>
          </div>
        );
      }

      case 'chart': {
        return (
          <RechartsBlock
            key={key}
            title={node.attrs?.title}
            chartType={node.attrs?.chartType}
            data={node.attrs?.data || []}
            dataKeys={node.attrs?.dataKeys || ['value']}
          />
        );
      }

      case 'comparison': {
        return (
          <ComparisonBlock
            key={key}
            title={node.attrs?.title}
            headers={node.attrs?.headers}
            rows={node.attrs?.rows}
          />
        );
      }

      case 'quiz': {
        return (
          <InteractiveQuizBlock
            key={key}
            question={node.attrs?.question || extractPlainText(node)}
            options={node.attrs?.options}
            correctAnswer={node.attrs?.correctAnswer}
            explanation={node.attrs?.explanation}
          />
        );
      }

      case 'diagram': {
        const mermaidCode = node.attrs?.mermaidCode || extractPlainText(node);
        return (
          <div key={key} className="my-5 p-4 rounded-3xl bg-black/60 border border-purple-500/30 shadow-2xl page-break-avoid">
            {node.attrs?.title && (
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-3">
                📊 {node.attrs.title}
              </div>
            )}
            <MermaidDiagram chart={mermaidCode} />
          </div>
        );
      }

      case 'bulletList':
        return (
          <ul key={key} className="my-2 ml-5 list-disc space-y-1 text-xs sm:text-sm text-gray-200">
            {(node.content || []).map((child: any, cIdx: number) => renderNode(child, cIdx))}
          </ul>
        );

      case 'orderedList':
        return (
          <ol key={key} className="my-2 ml-5 list-decimal space-y-1 text-xs sm:text-sm text-gray-200">
            {(node.content || []).map((child: any, cIdx: number) => renderNode(child, cIdx))}
          </ol>
        );

      case 'listItem':
        return (
          <li key={key} className="leading-relaxed">
            {(node.content || []).map((child: any, cIdx: number) => renderNode(child, cIdx))}
          </li>
        );

      case 'blockquote':
        return (
          <blockquote key={key} className="my-4 pl-4 py-2 border-l-4 border-indigo-500 bg-indigo-500/10 text-indigo-200 italic text-xs sm:text-sm rounded-r-2xl page-break-avoid">
            {(node.content || []).map((child: any, cIdx: number) => renderNode(child, cIdx))}
          </blockquote>
        );

      default:
        return (
          <div key={key} className="my-2 text-xs text-gray-300">
            {renderInlineContent(node.content)}
          </div>
        );
    }
  };

  const renderInlineContent = (inlineNodes: any[]): React.ReactNode => {
    if (!inlineNodes || inlineNodes.length === 0) return null;

    return inlineNodes.map((child: any, idx: number) => {
      if (child.type === 'text') {
        let el: React.ReactNode = renderTextWithMath(child.text);
        if (child.marks) {
          child.marks.forEach((mark: any) => {
            if (mark.type === 'bold') {
              el = <strong className="font-extrabold text-white">{el}</strong>;
            } else if (mark.type === 'italic') {
              el = <em className="italic text-gray-300">{el}</em>;
            } else if (mark.type === 'code') {
              el = (
                <code className="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-mono text-[11px] border border-indigo-500/30">
                  {child.text}
                </code>
              );
            } else if (mark.type === 'math') {
              el = <MathRenderer latex={child.text} displayMode={false} />;
            }
          });
        }
        return <React.Fragment key={idx}>{el}</React.Fragment>;
      }
      return null;
    });
  };

  const extractPlainText = (node: any): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (node.text) return node.text;
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractPlainText).join(' ');
    }
    return '';
  };

  if (tiptapJson && tiptapJson.type === 'doc') {
    return renderNode(tiptapJson, 0);
  }

  // Fallback if legacy Markdown string is passed
  return (
    <div className="space-y-2 select-text">
      {renderTextWithMath(content || '')}
    </div>
  );
}
