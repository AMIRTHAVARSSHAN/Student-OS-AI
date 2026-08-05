'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Trash2, 
  Loader2,
  Sparkles,
  History,
  Check,
  X
} from 'lucide-react';

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 1. Fetch live attendance summary for real enrolled subjects
  const { data: summaries, isLoading: summaryLoading } = useQuery({
    queryKey: ['attendance_summary'],
    queryFn: async () => {
      const res = await apiClient.get('/attendance');
      return res.data || [];
    },
  });

  // 2. Fetch logged attendance history records
  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ['attendance_records'],
    queryFn: async () => {
      const res = await apiClient.get('/attendance/records');
      return res.data || [];
    },
  });

  // Mutation to mark attendance for a specific subject & date
  const markMutation = useMutation({
    mutationFn: async (payload: { subject_id: string; status: string; date: string; period?: number }) => {
      const res = await apiClient.post('/attendance', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_summary'] });
      queryClient.invalidateQueries({ queryKey: ['attendance_records'] });
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || 'Failed to update attendance record.');
    },
    onSettled: () => {
      setMarkingId(null);
    },
  });

  // Mutation to delete an attendance record
  const deleteMutation = useMutation({
    mutationFn: async (recordId: string) => {
      await apiClient.delete(`/attendance/${recordId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_summary'] });
      queryClient.invalidateQueries({ queryKey: ['attendance_records'] });
    },
  });

  const handleMark = (subjectId: string, status: 'present' | 'absent') => {
    setMarkingId(`${subjectId}-${status}`);
    markMutation.mutate({
      subject_id: subjectId,
      status: status,
      date: selectedDate,
      period: 1,
    });
  };

  const getPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Attendance Cockpit & Memory</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Log daily attendance for your real enrolled subjects. Automatic safety margin predictor guarantees 75%+ compliance.
          </p>
        </div>

        {/* Date Selector & Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 bg-[var(--surface-1)] border border-[var(--border-default)] p-2 rounded-2xl">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/10 text-xs">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs font-mono"
            />
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setSelectedDate(getPresetDate(0))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedDate === getPresetDate(0)
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(getPresetDate(1))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedDate === getPresetDate(1)
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Yesterday
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Subject Attendance Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Logging for Date:{' '}
            <span className="font-mono text-indigo-300 underline">{selectedDate}</span>
          </h2>
        </div>

        {summaryLoading ? (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)]">Loading subjects attendance summary...</div>
        ) : summaries && summaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map((item: any) => {
              const isMarkingPresent = markingId === `${item.subject_id}-present`;
              const isMarkingAbsent = markingId === `${item.subject_id}-absent`;

              return (
                <div
                  key={item.subject_id}
                  className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-6 space-y-5 hover:border-indigo-500/40 transition shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white truncate max-w-[180px]" title={item.subject_name}>
                      {item.subject_name}
                    </h3>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        item.status_indicator === 'safe'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : item.status_indicator === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-2.5 bg-black/40 border border-white/5 rounded-xl p-3">
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block">Total</span>
                      <span className="font-black text-base text-white">{item.total_classes}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block">Present</span>
                      <span className="font-black text-base text-emerald-400">{item.present_count}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block">Absent</span>
                      <span className="font-black text-base text-rose-400">{item.absent_count}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-300 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl leading-relaxed">
                    💡 Predictor: You can miss <strong className="text-indigo-300 font-bold">{item.can_miss_classes}</strong> more classes and remain above 75%.
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => handleMark(item.subject_id, 'present')}
                      disabled={Boolean(markingId)}
                      className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
                    >
                      {isMarkingPresent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Present
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleMark(item.subject_id, 'absent')}
                      disabled={Boolean(markingId)}
                      className="flex-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
                    >
                      {isMarkingAbsent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Absent
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-default)] text-center text-xs text-amber-400">
            No subjects found. Complete profile onboarding to load real enrolled subjects.
          </div>
        )}
      </div>

      {/* Attendance Log Memory History Table */}
      <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-default)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" /> Logged Attendance Memory History ({records?.length || 0})
          </h2>
          <span className="text-xs text-[var(--text-secondary)] font-mono">Stored in Supabase Backend</span>
        </div>

        {recordsLoading ? (
          <div className="p-4 text-center text-xs text-gray-500">Loading attendance history...</div>
        ) : records && records.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {records.map((rec: any) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-indigo-300 font-bold">{rec.date}</span>
                  <span className="font-medium text-white">{rec.subject_name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      rec.status === 'present'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {rec.status === 'present' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {rec.status}
                  </span>

                  <button
                    onClick={() => deleteMutation.mutate(rec.id)}
                    title="Delete record"
                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">
            No attendance records logged yet. Click <strong>Present</strong> or <strong>Absent</strong> on any subject above to log your first record.
          </p>
        )}
      </div>
    </div>
  );
}
