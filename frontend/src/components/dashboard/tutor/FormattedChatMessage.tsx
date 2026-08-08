'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Lightbulb, AlertCircle, Sparkles, HelpCircle, Award, ShieldAlert } from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';
import MathRenderer, { renderTextWithMath } from '@/components/MathRenderer';

interface FormattedChatMessageProps {
  content: string;
}

export default function FormattedChatMessage({ content }: FormattedChatMessageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'sans-serif'
    });

    if (containerRef.current) {
      const mermaidElements = containerRef.current.querySelectorAll('.mermaid-diagram');
      mermaidElements.forEach(async (elem, idx) => {
        const code = elem.getAttribute('data-code');
        if (code) {
          try {
            const id = `mermaid-svg-${Date.now()}-${idx}`;
            const { svg } = await mermaid.render(id, code);
            elem.innerHTML = svg;
          } catch (err) {
            console.error('Mermaid render error:', err);
            elem.innerHTML = `<pre class="text-rose-400 text-xs p-2 bg-rose-950/30 rounded border border-rose-500/30">${code}</pre>`;
          }
        }
      });
    }
  }, [content]);

  // Parse lines into rich elements (headings, mermaid code blocks, math, callouts, lists)
  const renderRichContent = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockType = '';
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      // Code Block Start/End
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Closing code block
          const codeString = codeBuffer.join('\n');
          if (codeBlockType === 'mermaid') {
            elements.push(
              <div key={`mermaid-${index}`} className="my-4 p-4 rounded-2xl bg-black/60 border border-purple-500/30 shadow-lg overflow-x-auto">
                <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Concept Diagram / Flowchart
                </div>
                <div className="mermaid-diagram flex justify-center" data-code={codeString} />
              </div>
            );
          } else {
            elements.push(
              <CodeBlock key={`code-${index}`} code={codeString} language={codeBlockType} />
            );
          }
          codeBuffer = [];
          inCodeBlock = false;
          codeBlockType = '';
        } else {
          // Opening code block
          inCodeBlock = true;
          codeBlockType = line.trim().replace('```', '').toLowerCase();
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
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

      // Standalone LaTeX equation line without $$ wrapper e.g. y = \beta_0 + \beta_1x + \epsilon
      if (/^\s*[a-zA-Z0-9_]+\s*=\s*\\[a-zA-Z0-9_\\\+\-\*\/\s\^\{\}\.]+\s*$/.test(trimmed) ||
          /^\s*\\(beta|alpha|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|omega|infty|frac|sqrt|sum|prod|int|partial)\b/.test(trimmed)) {
        elements.push(
          <MathRenderer key={`math-solitary-${index}`} latex={trimmed} displayMode={true} />
        );
        return;
      }

      // Educational Cards: CORE IDEA, EXAM FOCUS, MEMORY TRICK, COMMON MISTAKE, TEST YOURSELF
      if (trimmed.startsWith('CORE IDEA:') || trimmed.startsWith('💡 CORE IDEA:')) {
        const textVal = trimmed.replace(/^.*CORE IDEA:\s*/i, '');
        elements.push(
          <div key={`core-${index}`} className="my-3 p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 text-indigo-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-md">
            <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-indigo-300 font-bold block mb-0.5">CORE IDEA</strong>
              <span>{formatInlineMarkdown(textVal)}</span>
            </div>
          </div>
        );
        return;
      }

      if (trimmed.startsWith('EXAM FOCUS:') || trimmed.startsWith('🎯 EXAM FOCUS:')) {
        const textVal = trimmed.replace(/^.*EXAM FOCUS:\s*/i, '');
        elements.push(
          <div key={`exam-${index}`} className="my-3 p-3.5 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-purple-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-md">
            <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-300 font-bold block mb-0.5">EXAM FOCUS</strong>
              <span>{formatInlineMarkdown(textVal)}</span>
            </div>
          </div>
        );
        return;
      }

      if (trimmed.startsWith('COMMON MISTAKE:') || trimmed.startsWith('⚠️ COMMON MISTAKE:')) {
        const textVal = trimmed.replace(/^.*COMMON MISTAKE:\s*/i, '');
        elements.push(
          <div key={`mistake-${index}`} className="my-3 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-md">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300 font-bold block mb-0.5">COMMON MISTAKE</strong>
              <span>{formatInlineMarkdown(textVal)}</span>
            </div>
          </div>
        );
        return;
      }

      if (trimmed.startsWith('TEST YOURSELF:') || trimmed.startsWith('❓ TEST YOURSELF:')) {
        const textVal = trimmed.replace(/^.*TEST YOURSELF:\s*/i, '');
        elements.push(
          <div key={`test-${index}`} className="my-3 p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-md">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">TEST YOURSELF</strong>
              <span>{formatInlineMarkdown(textVal)}</span>
            </div>
          </div>
        );
        return;
      }

      // Callout / Note Boxes
      if (trimmed.startsWith('> [!NOTE]') || trimmed.startsWith('> [!TIP]') || trimmed.startsWith('Note:') || trimmed.startsWith('Tip:')) {
        const noteText = trimmed.replace(/^>\s*(\[!NOTE\]|\[!TIP\])?\s*/i, '').replace(/^(Note|Tip):\s*/i, '');
        elements.push(
          <div key={`callout-${index}`} className="my-3 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-md">
            <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-indigo-300 font-bold block mb-0.5">Key Academic Insight</strong>
              <span>{formatInlineMarkdown(noteText)}</span>
            </div>
          </div>
        );
        return;
      }

      if (trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('Warning:')) {
        const warnText = trimmed.replace(/^>\s*\[!WARNING\]?\s*/i, '').replace(/^Warning:\s*/i, '');
        elements.push(
          <div key={`warn-${index}`} className="my-3 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300 font-bold block mb-0.5">Important Exam Pitfall</strong>
              <span>{formatInlineMarkdown(warnText)}</span>
            </div>
          </div>
        );
        return;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-base sm:text-lg font-black text-white mt-4 mb-2 flex items-center gap-2 border-b border-white/10 pb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            {formatInlineMarkdown(trimmed.replace('### ', ''))}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${index}`} className="text-sm sm:text-base font-bold text-indigo-300 mt-3 mb-1.5">
            {formatInlineMarkdown(trimmed.replace('#### ', ''))}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-lg sm:text-xl font-black text-white mt-5 mb-2 border-b border-indigo-500/30 pb-1.5">
            {formatInlineMarkdown(trimmed.replace(/^#+\s*/, ''))}
          </h2>
        );
        return;
      }

      // Bullet Lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.substring(2);
        elements.push(
          <div key={`li-${index}`} className="flex items-start gap-2 text-xs sm:text-sm text-gray-200 my-1 pl-2">
            <span className="text-indigo-400 font-bold mt-0.5">•</span>
            <div className="leading-relaxed">{formatInlineMarkdown(bulletText)}</div>
          </div>
        );
        return;
      }

      // Numbered Lists
      if (/^\d+\.\s/.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          elements.push(
            <div key={`num-${index}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-200 my-1.5 pl-1">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px] shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <div className="leading-relaxed">{formatInlineMarkdown(numMatch[2])}</div>
            </div>
          );
          return;
        }
      }

      // Standard Paragraph
      elements.push(
        <p key={`p-${index}`} className="my-1.5 text-xs sm:text-sm text-gray-200 leading-relaxed">
          {formatInlineMarkdown(line)}
        </p>
      );
    });

    return elements;
  };

  // Inline Markdown Formatter (Bold, Italic, Code, Math LaTeX)
  const formatInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\$.*?\$|\\\[.*?\\\]|\\\([^\)]+\\\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-white">{formatInlineMarkdown(part.slice(2, -2))}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-gray-300">{formatInlineMarkdown(part.slice(1, -1))}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30 font-mono text-xs text-indigo-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      if ((part.startsWith('$') && part.endsWith('$') && part.length > 2) ||
          (part.startsWith('\\(') && part.endsWith('\\)')) ||
          (part.startsWith('\\[') && part.endsWith('\\]'))) {
        const rawFormula = part.startsWith('$') ? part.slice(1, -1) : part.slice(2, -2);
        return <MathRenderer key={i} latex={rawFormula} displayMode={false} />;
      }

      return renderTextWithMath(part);
    });
  };

  return <div ref={containerRef} className="space-y-1">{renderRichContent(content)}</div>;
}
