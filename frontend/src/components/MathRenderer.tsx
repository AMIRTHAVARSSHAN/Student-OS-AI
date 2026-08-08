'use client';

import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  latex: string;
  displayMode?: boolean;
}

export default function MathRenderer({ latex, displayMode = false }: MathRendererProps) {
  if (!latex) return null;

  let html = '';
  try {
    html = katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
    });
  } catch (err) {
    html = `<span class="font-mono text-purple-300">${latex}</span>`;
  }

  if (displayMode) {
    return (
      <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border border-purple-500/30 text-purple-100 shadow-xl flex flex-col items-center justify-center overflow-x-auto select-text">
        <div
          className="katex-block text-base sm:text-lg overflow-x-auto py-1 max-w-full"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded-lg bg-purple-950/50 text-purple-100 border border-purple-500/30 shadow-sm text-xs sm:text-sm select-text"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Pre-processes raw text to find unescaped/unwrapped LaTeX equations and auto-renders them with KaTeX
 */
export function renderTextWithMath(text: string): React.ReactNode {
  if (!text) return null;

  // Split by inline $...$ or display $$...$$ or \[...\] or \(...\)
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\([^\)]+\\\))/g);

  return parts.map((part, index) => {
    if ((part.startsWith('$$') && part.endsWith('$$') && part.length > 4) ||
        (part.startsWith('\\[') && part.endsWith('\\]') && part.length > 4)) {
      const raw = part.startsWith('$$') ? part.slice(2, -2) : part.slice(2, -2);
      return <MathRenderer key={index} latex={raw} displayMode={true} />;
    }

    if ((part.startsWith('$') && part.endsWith('$') && part.length > 2) ||
        (part.startsWith('\\(') && part.endsWith('\\)') && part.length > 4)) {
      const raw = part.startsWith('$') ? part.slice(1, -1) : part.slice(2, -2);
      return <MathRenderer key={index} latex={raw} displayMode={false} />;
    }

    // Check if part contains unwrapped LaTeX commands like \beta_0, \alpha, \frac, \sqrt, \epsilon, \int, \sum, y = \beta_0...
    if (/\\(beta|alpha|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|omega|infty|frac|sqrt|sum|prod|int|partial|vec|hat|bar|mathcal|mathbf|mathbb)\b/i.test(part)) {
      // Split sub-words or render whole segment if it looks like an equation (e.g. y = \beta_0 + \beta_1x + \epsilon)
      const subParts = part.split(/(\b[a-zA-Z0-9_]+\s*=\s*\\[a-zA-Z0-9_\\\+\-\*\/\s\^\{\}\.]+|\\[a-zA-Z0-9_]+(?:_\{?[a-zA-Z0-9]+\}?)?)/g);
      return (
        <React.Fragment key={index}>
          {subParts.map((sub, sIdx) => {
            if (/\\(beta|alpha|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|omega|infty|frac|sqrt|sum|prod|int|partial|vec|hat|bar)\b/i.test(sub)) {
              return <MathRenderer key={sIdx} latex={sub} displayMode={false} />;
            }
            return sub;
          })}
        </React.Fragment>
      );
    }

    return part;
  });
}
