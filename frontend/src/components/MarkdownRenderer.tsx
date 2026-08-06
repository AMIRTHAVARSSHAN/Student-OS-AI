import React from 'react';
import dynamic from 'next/dynamic';
import { Info, AlertTriangle, Lightbulb, HelpCircle, CheckCircle2, Copy, Check } from 'lucide-react';

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), { ssr: false });

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return <div className="text-gray-500 text-xs italic">No content available.</div>;

  // Pre-process raw LaTeX commands if not wrapped in math delimiters ($...$ or $$...$$)
  const processedContent = autoWrapLatexCommands(content);

  const lines = processedContent.split('\n');
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
            <div key={`code-${index}`} className="my-4 rounded-2xl bg-[#090d16] border border-emerald-500/30 p-4 font-mono text-xs text-emerald-300 overflow-x-auto shadow-2xl relative group">
              {codeLang && (
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-3">
                  <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">{codeLang}</span>
                  <span className="text-[10px] text-gray-500">Source Code</span>
                </div>
              )}
              <pre className="whitespace-pre overflow-x-auto leading-relaxed">{codeText}</pre>
            </div>
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
      const cleaned = cleanMathExpression(rawMath);
      elements.push(
        <div key={`math-${index}`} className="my-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border border-purple-500/30 text-purple-200 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 select-none">
              EQUATION
            </span>
          </div>
          <div className="font-mono text-sm tracking-wide text-white font-semibold flex-1 overflow-x-auto py-1">
            {cleaned}
          </div>
        </div>
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

// Auto-wrap unescaped raw LaTeX commands inside $...$ so they render as clean inline math
function autoWrapLatexCommands(text: string): string {
  if (!text) return text;
  // If line contains LaTeX commands like \mathcal, \mathbf, \mathbb, \frac, \sqrt, \sum, \in, \dots but no $, wrap math segment in $
  return text.replace(/(\\mathcal\{[^}]+\}|\\mathbf\{[^}]+\}|\\mathbb\{[^}]+\}|\\dots|\\in|\\hat\{[^}]+\})/g, (match) => {
    return `$${match}$`;
  });
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
    // Inline Math $math$ or \(math\)
    const mathMatch = remaining.match(/\$([^$]+)\$|\\\((.*?)\\\)/);
    // Italic *text* or _text_
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
      parts.push(remaining);
      break;
    }

    if (firstIdx > 0) {
      parts.push(remaining.slice(0, firstIdx));
    }

    if (matchType === 'code') {
      parts.push(
        <code key={`code-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-black/70 text-emerald-300 font-mono text-[11px] border border-emerald-500/20 break-words">
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
      const rawFormula = selectedMatch[1] || selectedMatch[2] || '';
      const cleaned = cleanMathExpression(rawFormula);
      parts.push(
        <span
          key={`math-${keyIdx++}`}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-purple-950/40 text-purple-200 font-mono font-semibold text-[11px] sm:text-xs border border-purple-500/30 shadow-sm"
        >
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

// Math expression cleaner & elegant LaTeX to readable math renderer
function cleanMathExpression(raw: string): string {
  if (!raw) return '';
  let s = raw.trim();

  // Escape brace sequences \{ and \}
  s = s.replace(/\\\{/g, '{').replace(/\\\}/g, '}');

  // \mathcal{D} -> 𝒟, \mathcal{X} -> 𝒳, \mathcal{Y} -> 𝒴, etc.
  s = s.replace(/\\mathcal\{([A-Z])\}/g, (_, char) => {
    const mathcalMap: Record<string, string> = {
      A: '𝒜', B: 'ℬ', C: '𝒞', D: '𝒟', E: 'ℰ', F: 'ℱ', G: '𝒢', H: 'ℋ', I: 'ℐ',
      J: '𝒥', K: '𝒦', L: 'ℒ', M: 'ℳ', N: '𝒩', O: '𝒪', P: '𝒫', Q: '𝒬', R: 'ℛ',
      S: '𝒮', T: '𝒯', U: '𝒰', V: '𝒱', W: '𝒲', X: '𝒳', Y: '𝒴', Z: '𝒵',
    };
    return mathcalMap[char] || char;
  });

  // \mathbf{x} -> x (bold styled), \mathbf{w} -> w, etc.
  s = s.replace(/\\mathbf\{([^}]+)\}/g, '$1');

  // \mathbb{R} -> ℝ, \mathbb{N} -> ℕ, \mathbb{Z} -> ℤ
  s = s.replace(/\\mathbb\{R\}/g, 'ℝ');
  s = s.replace(/\\mathbb\{N\}/g, 'ℕ');
  s = s.replace(/\\mathbb\{Z\}/g, 'ℤ');
  s = s.replace(/\\mathbb\{Q\}/g, 'ℚ');
  s = s.replace(/\\mathbb\{C\}/g, 'ℂ');
  s = s.replace(/\\mathbb\{([^}]+)\}/g, '$1');

  // \text{...} -> ...
  s = s.replace(/\\text\{([^}]+)\}/g, '$1');

  // Subscripts conversion (_1 -> ₁, _2 -> ₂, _N -> ₙ, _i -> ᵢ, _k -> ₖ)
  s = s.replace(/_1\b/g, '₁');
  s = s.replace(/_2\b/g, '₂');
  s = s.replace(/_3\b/g, '₃');
  s = s.replace(/_4\b/g, '₄');
  s = s.replace(/_5\b/g, '₅');
  s = s.replace(/_N\b/g, 'ₙ');
  s = s.replace(/_n\b/g, 'ₙ');
  s = s.replace(/_i\b/g, 'ᵢ');
  s = s.replace(/_j\b/g, 'ⱼ');
  s = s.replace(/_k\b/g, 'ₖ');

  // Spacing & dots
  s = s.replace(/\\dots/g, '…');
  s = s.replace(/\\cdots/g, '⋯');
  s = s.replace(/\\vdots/g, '⋮');
  s = s.replace(/\\in/g, ' ∈ ');
  s = s.replace(/\\quad/g, '  ');
  s = s.replace(/\\qquad/g, '    ');
  s = s.replace(/\\;/g, ' ');
  s = s.replace(/\\,/g, ' ');

  // Superscripts
  s = s.replace(/\^2/g, '²');
  s = s.replace(/\^3/g, '³');
  s = s.replace(/\^n/g, 'ⁿ');
  s = s.replace(/\^T\b/g, 'ᵀ');
  s = s.replace(/\^d\b/g, 'ᵈ');
  s = s.replace(/\^([0-9a-zA-Z]+)/g, '^$1');

  // Accents & hats
  s = s.replace(/\\hat\{([^}]+)\}/g, '$1̂');
  s = s.replace(/\\bar\{([^}]+)\}/g, '$1̄');
  s = s.replace(/\\vec\{([^}]+)\}/g, '$1⃗');

  // Greek letters & math symbols
  s = s.replace(/\\alpha/g, 'α');
  s = s.replace(/\\beta/g, 'β');
  s = s.replace(/\\gamma/g, 'γ');
  s = s.replace(/\\delta/g, 'δ');
  s = s.replace(/\\epsilon/g, 'ε');
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
  s = s.replace(/\\prod/g, '∏');
  s = s.replace(/\\int/g, '∫');
  s = s.replace(/\\partial/g, '∂');

  // Strip remaining backslashes
  s = s.replace(/\\/g, '');

  return s;
}
