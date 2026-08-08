'use client';

import React from 'react';
import { Printer, Download, Sparkles } from 'lucide-react';

interface PDFExportEngineProps {
  title: string;
  topic?: string;
  subject?: string;
  onTriggerPrint?: () => void;
}

export default function PDFExportEngine({
  title,
  topic = 'Academic Topic',
  subject = 'General',
  onTriggerPrint
}: PDFExportEngineProps) {
  const handlePrint = () => {
    if (onTriggerPrint) {
      onTriggerPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition shadow-sm active:scale-95"
        title="Export publication-quality PDF / Print document"
      >
        <Printer className="w-3.5 h-3.5 text-purple-400" />
        <span>Export PDF / Print</span>
      </button>

      {/* Global CSS for Native Print & PDF Page Break controls */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          nav, header, aside, button, footer {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .page-break-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          h1, h2, h3 {
            color: #1e1b4b !important;
            break-after: avoid !important;
          }
          pre, code {
            background-color: #f8fafc !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
          }
          .katex {
            color: #0f172a !important;
          }
        }
      `}</style>
    </div>
  );
}
