'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Info, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import CodeBlock from './CodeBlock';
import MathRenderer, { renderTextWithMath } from './MathRenderer';

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), { ssr: false });

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return <div className="text-gray-500 text-xs italic">No content available.</div>;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];
  let codeLang = '';

  lines.forEach((line, index) => {
    // Handle code blocks ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const codeText = codeBlockBuffer.join('\n');
        if (codeLang.toLowerCase() === 'mermaid') {
          elements.push(
            <MermaidDiagram key={`mermaid-${index}`} chart={codeText} />
          );
        } else {
          elements.push(
            <CodeBlock key={`code-${index}`} code={codeText} language={codeLang} />
          );
        }
        codeBlockBuffer = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3);
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`empty-${index}`} className="h-2" />);
      return;
    }

    // Handle Block Math equations: $$ ... $$ or \[ ... \]
    if ((trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) ||
        (trimmed.startsWith('\\[') && trimmed.endsWith('\\]') && trimmed.length > 4)) {
      const rawMath = trimmed.startsWith('$$') ? trimmed.slice(2, -2) : trimmed.slice(2, -2);
      elements.push(
        <MathRenderer key={`math-${index}`} latex={rawMath} displayMode={true} />
      );
      return;
    }

    // Standalone LaTeX equation without $$ wrapper e.g. y = \beta_0 + \beta_1x + \epsilon
    if (/^\s*[a-zA-Z0-9_]+\s*=\s*\\[a-zA-Z0-9_\\\+\-\*\/\s\^\{\}\.]+\s*$/.test(trimmed) ||
        /^\s*\\(beta|alpha|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|omega|infty|frac|sqrt|sum|prod|int|partial)\b/.test(trimmed)) {
      elements.push(
        <MathRenderer key={`math-solitary-${index}`} latex={trimmed} displayMode={true} />
      );
      return;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-2xl sm:text-3xl font-black text-white mt-6 mb-3 pb-2 border-b border-indigo-500/30 tracking-tight leading-tight">
          {formatInline(trimmed.slice(2))}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-xl font-bold text-indigo-300 mt-5 mb-2.5 flex items-center gap-2 leading-snug">
          <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block shrink-0" />
          {formatInline(trimmed.slice(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-base font-bold text-purple-300 mt-4 mb-2 leading-snug">
          {formatInline(trimmed.slice(4))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${index}`} className="text-xs sm:text-sm font-bold text-indigo-200 mt-3 mb-1.5 tracking-wide uppercase">
          {formatInline(trimmed.slice(5))}
        </h4>
      );
      return;
    }

    // Blockquotes & Callouts (> **INFO: ...**)
    if (trimmed.startsWith('> ')) {
      const blockText = trimmed.slice(2);
      let isCallout = false;
      let calloutType = 'info';
      let title = 'Key Point';
      let bodyText = blockText;

      const calloutMatch = blockText.match(/^\*\*(INFO|WARNING|TIP|NOTE|DANGER|DEFINITION|IMPORTANT|DID_YOU_KNOW|EXAM_TIP|MEMORY_TRICK|COMMON_MISTAKE|FORMULA|HIGH_WEIGHTAGE):\s*(.*?)\*\*\s*(.*)/i);
      if (calloutMatch) {
        isCallout = true;
        calloutType = calloutMatch[1].toLowerCase();
        title = calloutMatch[2] || calloutMatch[1].toUpperCase().replace('_', ' ');
        bodyText = calloutMatch[3] || '';
      }

      if (isCallout) {
        let bgStyles = 'from-indigo-950/40 via-purple-950/30 to-indigo-950/40 border-indigo-500/40 text-indigo-200';
        let IconComponent = Info;
        let iconColor = 'text-indigo-400';

        if (calloutType.includes('warning') || calloutType.includes('danger') || calloutType.includes('mistake')) {
          bgStyles = 'from-rose-950/40 via-amber-950/30 to-rose-950/40 border-rose-500/40 text-rose-200';
          IconComponent = AlertTriangle;
          iconColor = 'text-rose-400';
        } else if (calloutType.includes('tip') || calloutType.includes('memory') || calloutType.includes('know')) {
          bgStyles = 'from-emerald-950/40 via-teal-950/30 to-emerald-950/40 border-emerald-500/40 text-emerald-200';
          IconComponent = Lightbulb;
          iconColor = 'text-emerald-400';
        } else if (calloutType.includes('formula') || calloutType.includes('important') || calloutType.includes('weightage')) {
          bgStyles = 'from-purple-950/40 via-indigo-950/30 to-purple-950/40 border-purple-500/40 text-purple-200';
          IconComponent = CheckCircle2;
          iconColor = 'text-purple-400';
        }

        elements.push(
          <div key={`callout-${index}`} className={`my-4 p-4 rounded-2xl bg-gradient-to-r ${bgStyles} border backdrop-blur-md shadow-xl flex flex-col gap-2`}>
            <div className="flex items-center gap-2">
              <IconComponent className={`w-4 h-4 ${iconColor} shrink-0`} />
              <span className="font-extrabold text-xs tracking-wide uppercase text-white">{title}</span>
            </div>
            {bodyText && <div className="text-xs leading-relaxed text-gray-200 pl-6">{formatInline(bodyText)}</div>}
          </div>
        );
      } else {
        elements.push(
          <blockquote key={`quote-${index}`} className="my-3 pl-4 py-2.5 border-l-4 border-indigo-500 bg-indigo-500/10 text-indigo-200 text-xs italic rounded-r-2xl backdrop-blur-sm">
            {formatInline(blockText)}
          </blockquote>
        );
      }
      return;
    }

    // Bullet Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={`li-${index}`} className="ml-4 sm:ml-5 list-disc text-xs sm:text-sm text-gray-200 leading-relaxed my-1">
          {formatInline(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Numbered Lists
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^\d+\.\s/);
      const prefix = match ? match[0] : '';
      elements.push(
        <div key={`num-${index}`} className="ml-3 sm:ml-4 flex items-start gap-2 text-xs sm:text-sm text-gray-200 my-1">
          <span className="font-bold text-indigo-400 font-mono shrink-0">{prefix}</span>
          <div className="leading-relaxed flex-1">{formatInline(trimmed.slice(prefix.length))}</div>
        </div>
      );
      return;
    }

    // Paragraph
    elements.push(
      <p key={`p-${index}`} className="text-xs sm:text-sm text-gray-300 leading-relaxed my-2">
        {formatInline(line)}
      </p>
    );
  });

  return <div className="space-y-1 select-text overflow-x-hidden">{elements}</div>;
}

// Inline formatting parser for bold, italic, code, and math ($...$)
function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/`([^`]+)`/);
    const boldMatch = remaining.match(/(\*\*|__)(.*?)\1/);
    const mathMatch = remaining.match(/\$([^$]+)\$|\\\((.*?)\\\)/);
    const italicMatch = remaining.match(/(\*|_)(.*?)\1/);

    let matchType = '';
    let firstIdx = remaining.length;
    let selectedMatch: RegExpMatchArray | null = null;

    if (codeMatch && codeMatch.index! < firstIdx) {
      firstIdx = codeMatch.index!;
      selectedMatch = codeMatch;
      matchType = 'code';
    }
    if (boldMatch && boldMatch.index! < firstIdx) {
      firstIdx = boldMatch.index!;
      selectedMatch = boldMatch;
      matchType = 'bold';
    }
    if (mathMatch && mathMatch.index! < firstIdx) {
      firstIdx = mathMatch.index!;
      selectedMatch = mathMatch;
      matchType = 'math';
    }
    if (italicMatch && italicMatch.index! < firstIdx && matchType !== 'bold' && matchType !== 'math') {
      firstIdx = italicMatch.index!;
      selectedMatch = italicMatch;
      matchType = 'italic';
    }

    if (!selectedMatch) {
      parts.push(renderTextWithMath(remaining));
      break;
    }

    if (firstIdx > 0) {
      parts.push(renderTextWithMath(remaining.slice(0, firstIdx)));
    }

    if (matchType === 'code') {
      parts.push(
        <code key={`code-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-mono text-[11px] border border-indigo-500/30 break-words">
          {selectedMatch[1]}
        </code>
      );
      remaining = remaining.slice(firstIdx + selectedMatch[0].length);
    } else if (matchType === 'bold') {
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-bold text-white">
          {formatInline(selectedMatch[2])}
        </strong>
      );
      remaining = remaining.slice(firstIdx + selectedMatch[0].length);
    } else if (matchType === 'math') {
      const rawFormula = selectedMatch[1] || selectedMatch[2] || '';
      parts.push(<MathRenderer key={`math-${keyIdx++}`} latex={rawFormula} displayMode={false} />);
      remaining = remaining.slice(firstIdx + selectedMatch[0].length);
    } else if (matchType === 'italic') {
      parts.push(
        <em key={`italic-${keyIdx++}`} className="italic text-indigo-200">
          {formatInline(selectedMatch[2])}
        </em>
      );
      remaining = remaining.slice(firstIdx + selectedMatch[0].length);
    }
  }

  return <>{parts}</>;
}
