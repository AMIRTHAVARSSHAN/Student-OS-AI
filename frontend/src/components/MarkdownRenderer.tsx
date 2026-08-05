'use client';

import React from 'react';

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
        elements.push(
          <div key={`code-${index}`} className="my-4 rounded-xl bg-black/80 border border-white/10 p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
            {codeLang && <div className="text-[10px] uppercase text-gray-500 font-bold mb-2 tracking-wider">{codeLang}</div>}
            <pre className="whitespace-pre">{codeBlockBuffer.join('\n')}</pre>
          </div>
        );
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

    // Handle Block Math equations: $$ ... $$
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      const rawMath = trimmed.slice(2, -2);
      const cleaned = cleanMathExpression(rawMath);
      elements.push(
        <div key={`math-${index}`} className="my-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-200 shadow-lg shadow-purple-900/10 flex items-center justify-center font-mono text-sm tracking-wide">
          <span className="text-purple-400 font-bold mr-2 text-xs select-none">EQUATION:</span>
          <span className="font-semibold text-white">{cleaned}</span>
        </div>
      );
      return;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-2xl font-black text-white mt-6 mb-3 pb-2 border-b border-indigo-500/30 tracking-tight">
          {formatInline(trimmed.slice(2))}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-xl font-bold text-indigo-300 mt-5 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" />
          {formatInline(trimmed.slice(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-base font-bold text-purple-300 mt-4 mb-2">
          {formatInline(trimmed.slice(4))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${index}`} className="text-sm font-bold text-indigo-200 mt-3 mb-1.5 tracking-wide uppercase">
          {formatInline(trimmed.slice(5))}
        </h4>
      );
      return;
    }

    // Blockquotes & Callouts
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${index}`} className="my-3 pl-4 py-2 border-l-4 border-indigo-500 bg-indigo-500/10 text-indigo-200 text-xs italic rounded-r-xl">
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Bullet Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={`li-${index}`} className="ml-5 list-disc text-xs text-gray-200 leading-relaxed my-1">
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
        <div key={`num-${index}`} className="ml-4 flex items-start gap-2 text-xs text-gray-200 my-1">
          <span className="font-bold text-indigo-400 font-mono shrink-0">{prefix}</span>
          <div className="leading-relaxed">{formatInline(trimmed.slice(prefix.length))}</div>
        </div>
      );
      return;
    }

    // Paragraph
    elements.push(
      <p key={`p-${index}`} className="text-xs text-gray-300 leading-relaxed my-2">
        {formatInline(line)}
      </p>
    );
  });

  return <div className="space-y-1 text-xs select-text">{elements}</div>;
}

// Inline formatting parser for bold, italic, code, and math ($...$)
function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Inline code `code`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Bold **text** or __text__
    const boldMatch = remaining.match(/(\*\*|__)(.*?)\1/);
    // Italic *text* or _text_
    const italicMatch = remaining.match(/(\*|_)(.*?)\1/);
    // Inline Math $math$
    const mathMatch = remaining.match(/\$([^$]+)\$/);

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
      parts.push(remaining);
      break;
    }

    if (firstIdx > 0) {
      parts.push(remaining.slice(0, firstIdx));
    }

    if (matchType === 'code') {
      parts.push(
        <code key={`code-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-black/60 text-emerald-300 font-mono text-[11px] border border-emerald-500/20">
          {selectedMatch[1]}
        </code>
      );
      remaining = remaining.slice(firstIdx + selectedMatch[0].length);
    } else if (matchType === 'bold') {
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-bold text-white">
          {selectedMatch[2]}
        </strong>
      );
      remaining = remaining.slice(firstIdx + selectedMatch[0].length);
    } else if (matchType === 'math') {
      const cleaned = cleanMathExpression(selectedMatch[1]);
      parts.push(
        <span key={`math-${keyIdx++}`} className="px-1 py-0.5 mx-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-semibold text-[11px] border border-purple-500/20">
          {cleaned}
        </span>
      );
      remaining = remaining.slice(firstIdx + selectedMatch[0].length);
    } else if (matchType === 'italic') {
      parts.push(
        <em key={`italic-${keyIdx++}`} className="italic text-indigo-200">
          {selectedMatch[2]}
        </em>
      );
      remaining = remaining.slice(firstIdx + selectedMatch[0].length);
    }
  }

  return <>{parts}</>;
}

// Math expression cleaner & formatter
function cleanMathExpression(raw: string): string {
  let s = raw.trim();
  // Remove \text{...} -> ...
  s = s.replace(/\\text\{([^}]+)\}/g, '$1');
  // Spacing
  s = s.replace(/\\quad/g, '  ');
  s = s.replace(/\\qquad/g, '    ');
  s = s.replace(/\\;/g, ' ');
  s = s.replace(/\\,/g, ' ');
  // Superscripts
  s = s.replace(/\^2/g, '²');
  s = s.replace(/\^3/g, '³');
  s = s.replace(/\^n/g, 'ⁿ');
  s = s.replace(/\^([0-9a-zA-Z]+)/g, '^$1');
  // Greek letters & math symbols
  s = s.replace(/\\alpha/g, 'α');
  s = s.replace(/\\beta/g, 'β');
  s = s.replace(/\\gamma/g, 'γ');
  s = s.replace(/\\delta/g, 'δ');
  s = s.replace(/\\theta/g, 'θ');
  s = s.replace(/\\lambda/g, 'λ');
  s = s.replace(/\\mu/g, 'μ');
  s = s.replace(/\\pi/g, 'π');
  s = s.replace(/\\sigma/g, 'σ');
  s = s.replace(/\\omega/g, 'ω');
  s = s.replace(/\\infty/g, '∞');
  s = s.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
  s = s.replace(/\\times/g, '×');
  s = s.replace(/\\cdot/g, '·');
  s = s.replace(/\\leq/g, '≤');
  s = s.replace(/\\geq/g, '≥');
  s = s.replace(/\\neq/g, '≠');
  s = s.replace(/\\approx/g, '≈');
  s = s.replace(/\\pm/g, '±');
  s = s.replace(/\\sum/g, '∑');
  s = s.replace(/\\int/g, '∫');
  s = s.replace(/\\partial/g, '∂');
  s = s.replace(/\\/g, ''); // strip remaining backslashes
  return s;
}
