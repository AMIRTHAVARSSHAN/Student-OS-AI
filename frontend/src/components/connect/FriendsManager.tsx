'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  UserPlus, 
  Users, 
  Check, 
  Clock, 
  Search, 
  ShieldCheck, 
  Sparkles,
  MessageSquare,
  Loader2,
  X
} from 'lucide-react';

interface FriendsManagerProps {
  onStartDirectMessage?: (peerId: string, peerName: string) => void;
}

export default function FriendsManager({ onStartDirectMessage }: FriendsManagerProps) {
  const queryClient = useQueryClient();
  const [targetInput, setTargetInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const { data: friends, isLoading } = useQuery({
    queryKey: ['connect_friends'],
    queryFn: async () => {
      const res = await apiClient.get('/connect/friends');
      return res.data || [];
    },
  });

  const { data: recommendations } = useQuery({
    queryKey: ['partner_recommendations'],
    queryFn: async () => {
      const res = await apiClient.get('/connect/recommendations');
      return res.data || [];
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (input: string) => {
      const res = await apiClient.post(`/connect/friends/request?target_email_or_id=${encodeURIComponent(input)}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connect_friends'] });
      setTargetInput('');
      setStatusMsg('Friend request sent! 🚀');
      setTimeout(() => setStatusMsg(''), 3000);
    },
    onError: (err: any) => {
      setStatusMsg(err.response?.data?.detail || 'Failed to send request.');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/connect/friends/${id}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connect_friends'] });
    },
  });

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Connections & Peer Network
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">Connect with classmates to share notes and study in group rooms.</p>
        </div>
      </div>

      {/* Add Friend Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (targetInput.trim()) sendRequestMutation.mutate(targetInput.trim());
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={targetInput}
          onChange={(e) => setTargetInput(e.target.value)}
          placeholder="Enter classmate's email address..."
          className="flex-1 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={sendRequestMutation.isPending || !targetInput.trim()}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50"
        >
          {sendRequestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Send Request
        </button>
      </form>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
          {statusMsg}
        </div>
      )}

      {/* Connection Lists */}
      {isLoading ? (
        <div className="text-center text-xs text-gray-500 py-6">Loading connection network...</div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Active Connections ({friends?.filter((f: any) => f.status === 'accepted').length || 0}):
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {friends && friends.length > 0 ? (
              friends.map((f: any) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
                      {f.addressee_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{f.addressee_name}</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        ● Online in ScholarOS
                      </span>
                    </div>
                  </div>

                  {f.status === 'pending' ? (
                    <button
                      onClick={() => acceptMutation.mutate(f.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onStartDirectMessage && onStartDirectMessage(f.addressee_id || f.requester_id, f.addressee_name || f.requester_name)}
                        className="px-2.5 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <MessageSquare className="w-3 h-3 text-purple-400" /> Fast DM
                      </button>
                      <span className="text-[10px] uppercase font-bold text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                        Connected
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 col-span-2 py-2">No connections added yet. Check recommended peers below or type a classmate&apos;s email above.</p>
            )}
          </div>
        </div>
      )}

      {/* Recommended Registered Peers Directory & Fast DM */}
      <div className="pt-4 border-t border-[var(--border-default)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Recommended Registered Peers ({recommendations?.length || 0})
          </h3>
          <span className="text-[10px] text-gray-400">Direct Fast DM Available</span>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((rec: any) => (
              <div
                key={rec.user_id}
                className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-purple-500/20 hover:border-purple-500/40 transition flex flex-col justify-between space-y-2 text-xs shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shrink-0 text-xs">
                      {rec.full_name?.charAt(0) || 'P'}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-white truncate">{rec.full_name}</h4>
                      <p className="text-[10px] text-gray-400 truncate">{rec.institution_name || 'ScholarOS Peer'}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {Math.round(rec.matching_score * 100)}% Match
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onStartDirectMessage && onStartDirectMessage(rec.user_id, rec.full_name)}
                    className="flex-1 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Fast DM
                  </button>
                  <button
                    onClick={() => sendRequestMutation.mutate(rec.user_id)}
                    disabled={sendRequestMutation.isPending}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm disabled:opacity-50"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-2">No other registered peers found in network yet.</p>
        )}
      </div>
    </div>
  );
}
