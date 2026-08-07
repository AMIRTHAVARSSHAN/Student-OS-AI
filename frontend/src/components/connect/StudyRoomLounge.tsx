'use client';

import { useState } from 'react';
import { Volume2, Mic, MicOff, Users, Monitor, PhoneOff, Sparkles } from 'lucide-react';

export default function StudyRoomLounge() {
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400 animate-pulse" /> Virtual Study Lounge & Audio Room
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">Join voice lounges for group study and silent co-working sessions.</p>
        </div>

        <button
          onClick={() => setInCall(!inCall)}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
            inCall
              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {inCall ? <PhoneOff className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {inCall ? 'Leave Voice Lounge' : 'Join Voice Lounge'}
        </button>
      </div>

      {inCall ? (
        <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-4 text-center">
          <div className="flex justify-center items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-xl">
              You
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm shadow-xl">
              Priya
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition ${
                isMuted ? 'bg-rose-600 text-white border-rose-500' : 'bg-white/10 text-white border-white/15'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? 'Muted' : 'Mic On'}
            </button>
            <button className="p-3 rounded-2xl bg-white/10 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-white/20 transition">
              <Monitor className="w-4 h-4 text-indigo-400" /> Share Screen
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-[var(--surface-2)] border border-dashed border-white/10 space-y-2">
          <Users className="w-8 h-8 text-indigo-400 mx-auto" />
          <p className="text-xs text-gray-400">Click &quot;Join Voice Lounge&quot; to study together live.</p>
        </div>
      )}
    </div>
  );
}
