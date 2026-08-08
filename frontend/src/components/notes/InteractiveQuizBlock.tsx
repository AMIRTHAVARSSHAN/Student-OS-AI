'use client';

import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface InteractiveQuizBlockProps {
  question: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

export default function InteractiveQuizBlock({
  question,
  options = ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer = 0,
  explanation = 'Review the key concepts above for details.'
}: InteractiveQuizBlockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedIndex(idx);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setSubmitted(true);
  };

  const isCorrect = selectedIndex === correctAnswer;

  return (
    <div className="my-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-indigo-950/30 to-amber-950/40 border border-amber-500/30 shadow-2xl space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Concept Self-Check Quiz</span>
      </div>

      <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">{question}</p>

      <div className="space-y-2">
        {options.map((opt, idx) => {
          let stateStyle = 'bg-[#121827] border-white/10 text-gray-300 hover:border-indigo-500/50';
          if (selectedIndex === idx) {
            stateStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-bold';
          }
          if (submitted) {
            if (idx === correctAnswer) {
              stateStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
            } else if (selectedIndex === idx) {
              stateStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full p-3 rounded-2xl border text-xs text-left transition flex items-center justify-between gap-3 ${stateStyle}`}
            >
              <span>{opt}</span>
              {submitted && idx === correctAnswer && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {submitted && selectedIndex === idx && idx !== correctAnswer && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedIndex === null}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition disabled:opacity-50 shadow-lg"
        >
          Check Answer
        </button>
      ) : (
        <div className={`p-3.5 rounded-2xl text-xs space-y-1.5 border ${isCorrect ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'}`}>
          <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            {isCorrect ? 'Correct! Excellent Recall' : 'Incorrect — Review Explanation'}
          </div>
          <p className="leading-relaxed opacity-90">{explanation}</p>
        </div>
      )}
    </div>
  );
}
