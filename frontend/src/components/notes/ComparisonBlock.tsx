'use client';

import React from 'react';
import { Columns3, Sparkles } from 'lucide-react';

interface ComparisonBlockProps {
  title?: string;
  headers?: string[];
  rows?: string[][];
}

export default function ComparisonBlock({
  title = 'Concept Comparison Matrix',
  headers = ['Feature / Entity A', 'Feature / Entity B'],
  rows = []
}: ComparisonBlockProps) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="my-6 p-4 sm:p-5 rounded-3xl bg-[#0b0f19] border border-indigo-500/30 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
        <Columns3 className="w-4 h-4 text-purple-400 shrink-0" />
        <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">{title}</h4>
      </div>

      {/* Desktop 2-Column Matrix View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-indigo-500/30 bg-indigo-950/40 text-left">
              {headers.map((hdr, hIdx) => (
                <th key={hIdx} className="p-3 text-indigo-300 font-extrabold uppercase tracking-wider">
                  {hdr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/5 transition">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-3 text-gray-200 leading-relaxed">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Vertical Cards View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] uppercase">
              <Sparkles className="w-3 h-3" /> Comparison Point #{rIdx + 1}
            </div>
            {row.map((cell, cIdx) => (
              <div key={cIdx} className="p-2.5 rounded-xl bg-[#121827] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-purple-300 uppercase block">
                  {headers[cIdx] || `Category ${cIdx + 1}`}
                </span>
                <p className="text-gray-200 leading-relaxed">{cell}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
