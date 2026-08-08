'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Globe, 
  Users, 
  MessageSquare, 
  Layers, 
  FileText, 
  Volume2, 
  Sparkles, 
  Award, 
  Plus,
  Loader2,
  X
} from 'lucide-react';
import FriendsManager from './FriendsManager';
import ChatCanvas from './ChatCanvas';
import SharedWhiteboard from './SharedWhiteboard';
import CollabEditor from './CollabEditor';
import StudyRoomLounge from './StudyRoomLounge';
import PartnerRecommender from './PartnerRecommender';
import AcademicFeed from './AcademicFeed';

export default function ConnectShell() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'network' | 'chat' | 'whiteboard' | 'editor' | 'lounge' | 'recommender' | 'feed'>('network');
  const [selectedChannel, setSelectedChannel] = useState<string>('general_study_lounge');

  // Create Group Modal
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupSubject, setGroupSubject] = useState('');

  const { data: groups } = useQuery({
    queryKey: ['connect_groups'],
    queryFn: async () => {
      const res = await apiClient.get('/connect/groups');
      return res.data || [];
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/connect/groups', {
        name: groupName,
        description: groupDesc,
        subject_name: groupSubject
      });
      return res.data;
    },
    onSuccess: (newG) => {
      queryClient.invalidateQueries({ queryKey: ['connect_groups'] });
      setShowCreateGroup(false);
      setGroupName('');
      setGroupDesc('');
      if (newG?.id) {
        setSelectedChannel(newG.id);
        setActiveTab('chat');
      }
    },
  });

  const { data: recommendations } = useQuery({
    queryKey: ['partner_recommendations'],
    queryFn: async () => {
      const res = await apiClient.get('/connect/recommendations');
      return res.data || [];
    },
  });

  const handleStartDirectMessage = (peerId: string, peerName: string) => {
    const channelId = `dm_${peerId}`;
    setSelectedChannel(channelId);
    setActiveTab('chat');
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto pb-24 md:pb-16 overflow-x-hidden">
      {/* Header Banner (Fluid typography & non-overflowing bounds) */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-black border border-indigo-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div className="space-y-1.5 w-full md:w-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
            <Globe className="w-3.5 h-3.5 text-indigo-400" /> ScholarConnect Network
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
            AI Academic Collaboration Engine
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
            Collaborate in real-time with verified peers. Share AI notes, flashcard decks, mindmaps, assignments, and study in live voice lounges.
          </p>
        </div>

        <button
          onClick={() => setShowCreateGroup(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Create Study Group
        </button>
      </div>

      {/* Main Mode Navigation Bar (Scrollable without scrollbar) */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border-default)] text-xs font-bold w-full">
        {[
          { id: 'network', label: '👥 Connections', icon: Users },
          { id: 'chat', label: '💬 Encrypted Chat', icon: MessageSquare },
          { id: 'whiteboard', label: '📊 Whiteboard', icon: Layers },
          { id: 'editor', label: '📝 Collab Notes', icon: FileText },
          { id: 'lounge', label: '🎙️ Voice Lounge', icon: Volume2 },
          { id: 'recommender', label: '🤖 AI Buddy Match', icon: Sparkles },
          { id: 'feed', label: '🏆 Peer Progress Feed', icon: Award }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-2xl font-bold flex items-center gap-1.5 transition shrink-0 border ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-[var(--surface-1)] text-gray-400 border-[var(--border-default)] hover:text-white'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT RENDERER */}
      <div className="min-h-[450px] w-full">
        {activeTab === 'network' && <FriendsManager onStartDirectMessage={handleStartDirectMessage} />}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[550px] sm:h-[600px] w-full">
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-3 space-y-3 overflow-y-auto max-h-[220px] lg:max-h-full">
              <div className="space-y-1">
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-gray-400 px-2">Group Channels</h3>
                <button
                  onClick={() => setSelectedChannel('general_study_lounge')}
                  className={`w-full p-2.5 rounded-2xl text-xs font-bold text-left transition border ${
                    selectedChannel === 'general_study_lounge'
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-white/5 text-gray-300 border-transparent hover:border-white/10'
                  }`}
                >
                  # general_study_lounge
                </button>

                {(groups || []).map((g: any) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedChannel(g.id)}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold text-left transition border ${
                      selectedChannel === g.id
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-white/5 text-gray-300 border-transparent hover:border-white/10'
                    }`}
                  >
                    # {g.name}
                  </button>
                ))}
              </div>

              {/* Direct Messages List */}
              <div className="space-y-1 pt-2 border-t border-[var(--border-default)]">
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-purple-300 px-2 flex items-center justify-between">
                  <span>Fast Peer DMs</span>
                  <Sparkles className="w-3 h-3 text-purple-400" />
                </h3>
                {(recommendations || []).map((rec: any) => {
                  const dmId = `dm_${rec.user_id}`;
                  return (
                    <button
                      key={rec.user_id}
                      onClick={() => setSelectedChannel(dmId)}
                      className={`w-full p-2 rounded-2xl text-xs font-semibold text-left transition border flex items-center justify-between gap-2 ${
                        selectedChannel === dmId
                          ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 font-bold'
                          : 'bg-white/5 text-gray-300 border-transparent hover:border-white/10'
                      }`}
                    >
                      <span className="truncate">💬 {rec.full_name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-3 h-full w-full">
              <ChatCanvas channelId={selectedChannel} />
            </div>
          </div>
        )}

        {activeTab === 'whiteboard' && <SharedWhiteboard />}
        {activeTab === 'editor' && <CollabEditor />}
        {activeTab === 'lounge' && <StudyRoomLounge />}
        {activeTab === 'recommender' && <PartnerRecommender onStartDirectMessage={handleStartDirectMessage} />}
        {activeTab === 'feed' && <AcademicFeed />}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Create Academic Study Group
              </h3>
              <button onClick={() => setShowCreateGroup(false)} className="text-gray-400 hover:text-white font-bold text-xs">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createGroupMutation.mutate();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Data Structures Study Circle"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">Subject</label>
                <input
                  type="text"
                  value={groupSubject}
                  onChange={(e) => setGroupSubject(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Goals and study schedule for this group..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] text-gray-300 font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGroupMutation.isPending || !groupName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  {createGroupMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Create Group 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
