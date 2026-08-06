'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
  themeVariables: {
    darkMode: true,
    background: '#0d0c15',
    primaryColor: '#6366f1',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#818cf8',
    lineColor: '#a5b4fc',
    secondaryColor: '#a855f7',
    tertiaryColor: '#06b6d4',
  },
});

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    if (!chart.trim()) return;

    mermaid
      .render(uniqueId, chart)
      .then((result) => {
        if (isMounted) {
          setSvg(result.svg);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Mermaid rendering fallback:', err);
          setError('Diagram rendering in progress...');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error || !svg) {
    return (
      <div className="my-4 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-xs font-mono overflow-x-auto shadow-xl">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">📊 Flow Diagram</div>
        <pre className="whitespace-pre text-gray-300">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="my-6 p-5 rounded-2xl bg-black/80 border border-indigo-500/30 text-white shadow-2xl overflow-x-auto flex flex-col items-center justify-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-3 self-start flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Visual Diagram
      </div>
      <div
        ref={containerRef}
        className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
