'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Award, Flame, Sparkles, BookOpen, Clock } from 'lucide-react';

export default function AcademicFeed() {
  const { data: feedItems, isLoading } = useQuery({
    queryKey: ['academic_feed'],
    queryFn: async () => {
      const res = await apiClient.get('/connect/feed');
      return res.data || [];
    },
  });

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Academic Progress Feed
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">Peer study milestones, note contributions, and reputation points earned.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-xs text-gray-500 py-6">Loading academic feed...</div>
      ) : feedItems && feedItems.length > 0 ? (
        <div className="space-y-3">
          {feedItems.map((item: any) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[var(--surface-2)] border border-white/5 flex items-center justify-between gap-3 text-xs shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center font-black text-white shrink-0 shadow-md">
                  {item.user_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{item.user_name}</h4>
                  <p className="text-xs text-gray-300">{item.description}</p>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shrink-0">
                <Sparkles className="w-3.5 h-3.5" /> +{item.points} pts
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-4">No feed items logged yet.</p>
      )}
    </div>
  );
}
