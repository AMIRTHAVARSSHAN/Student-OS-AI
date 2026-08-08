'use client';

import React, { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import { Copy, Check, Code2 } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'python' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || 'text').trim().toLowerCase().replace(/^language-/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getGrammar = (lang: string) => {
    const map: Record<string, any> = {
      python: Prism.languages.python,
      py: Prism.languages.python,
      javascript: Prism.languages.javascript,
      js: Prism.languages.javascript,
      typescript: Prism.languages.typescript,
      ts: Prism.languages.typescript,
      tsx: Prism.languages.tsx,
      jsx: Prism.languages.jsx,
      bash: Prism.languages.bash,
      sh: Prism.languages.bash,
      shell: Prism.languages.bash,
      json: Prism.languages.json,
      sql: Prism.languages.sql,
      cpp: Prism.languages.cpp,
      c: Prism.languages.c,
      java: Prism.languages.java,
      rust: Prism.languages.rust,
      css: Prism.languages.css,
      html: Prism.languages.markup,
      markup: Prism.languages.markup,
    };
    return map[lang] || Prism.languages.javascript || null;
  };

  const grammar = getGrammar(cleanLang);
  const highlightedHtml = grammar ? Prism.highlight(code, grammar, cleanLang) : null;

  return (
    <div className="my-4 rounded-2xl bg-[#0b0f19] border border-indigo-500/30 overflow-hidden shadow-2xl group">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121827] border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-300 font-mono">
            {cleanLang || 'code'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition active:scale-95"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed select-text">
        {highlightedHtml ? (
          <pre className="m-0 p-0 bg-transparent overflow-x-auto text-gray-200">
            <code
              className={`language-${cleanLang}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        ) : (
          <pre className="m-0 p-0 bg-transparent text-indigo-200 overflow-x-auto">{code}</pre>
        )}
      </div>
    </div>
  );
}
