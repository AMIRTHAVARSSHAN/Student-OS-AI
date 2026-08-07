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
  Loader2,
  X
} from 'lucide-react';

export default function FriendsManager() {
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
                    <span className="text-[10px] uppercase font-bold text-indigo-300 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                      Connected
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 col-span-2 py-4">No connections added yet. Type a classmate&apos;s email above to send a request.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
