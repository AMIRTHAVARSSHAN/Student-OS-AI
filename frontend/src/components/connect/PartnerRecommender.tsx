'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Sparkles, UserPlus, Brain, BookOpen, Check, Award, MessageSquare } from 'lucide-react';

interface PartnerRecommenderProps {
  onStartDirectMessage?: (peerId: string, peerName: string) => void;
}

export default function PartnerRecommender({ onStartDirectMessage }: PartnerRecommenderProps) {
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['partner_recommendations'],
    queryFn: async () => {
      const res = await apiClient.get('/connect/recommendations');
      return res.data || [];
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.post(`/connect/friends/request?target_email_or_id=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connect_friends'] });
    },
  });

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> AI-Powered Study Buddy Matching
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">Matched by course specialization, complementary weak/strong topics, and study habits.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-xs text-gray-500 py-6">Running AI matching algorithm...</div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec: any) => (
            <div
              key={rec.user_id}
              className="p-4 rounded-2xl bg-[var(--surface-2)] border border-purple-500/20 flex flex-col justify-between space-y-3 shadow-lg hover:border-purple-500/50 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {Math.round(rec.matching_score * 100)}% Match
                  </span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-white shrink-0 shadow-md">
                    {rec.full_name?.charAt(0) || 'P'}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-sm text-white truncate">{rec.full_name}</h3>
                    <p className="text-[10px] text-gray-400 truncate">{rec.institution_name || 'University'}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-[11px]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Common Subjects:</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.common_subjects?.map((s: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStartDirectMessage && onStartDirectMessage(rec.user_id, rec.full_name)}
                  className="flex-1 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Fast DM
                </button>
                <button
                  onClick={() => sendInviteMutation.mutate(rec.user_id)}
                  disabled={sendInviteMutation.isPending}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-4">No peer recommendations found right now.</p>
      )}
    </div>
  );
}
