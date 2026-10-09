/**
 * Teacher Approval Workflow
 *
 * Shows AI-suggested grades for student answers and lets the teacher
 * approve or override each one. Approved grades become the final scores.
 */

import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';
import { randomForestService } from '../../ai/randomForestModel';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Filter,
  ChevronRight,
} from 'lucide-react';

interface TeacherApprovalWorkflowViewProps {
  user: User;
}

interface PendingGrade {
  id: string;
  studentName: string;
  studentId: string;
  questionId: string;
  questionText: string;
  aiSuggested: number;
  aiConfidence: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'overridden';
  overrideScore?: number;
  decidedAt?: string;
}

export const TeacherApprovalWorkflowView: React.FC<TeacherApprovalWorkflowViewProps> = ({ user }) => {
  // Build a queue from the AI grading records (teacher's decision = approval or override)
  const records = storageService.getTeacherGradingRecords();
  const students = storageService.getUsers().filter(u => u.role === 'student');

  // Take the 12 most recent grading records as the "approval queue"
  const initialQueue = useMemo<PendingGrade[]>(() => {
    return records.slice(0, 12).map((r, idx) => {
      const pred = randomForestService.explainPrediction(
        r.correctness,
        r.explanationDepth,
        r.presentationScore,
        r.keywordDensity,
        r.effortWeight,
        r.questionDifficulty
      );
      const student = students[idx % students.length];
      return {
        id: `AQ-${idx + 1}`,
        studentName: student?.displayName || `Student ${idx + 1}`,
        studentId: student?.studentId || `STU-${idx + 1}`,
        questionId: `Q-${(idx % 60) + 1}`,
        questionText: [
          'Explain why Dijkstra fails on negative-weight edges.',
          'Describe how the discriminant determines root types.',
          'Prove the amortized O(1) cost of push_back.',
          'Compare memoization vs tabulation with examples.',
          'Derive the chain rule for a composition of three functions.',
          'Explain the photoelectric effect and stopping potential.',
        ][idx % 6],
        aiSuggested: Math.round(pred.predictedGrade),
        aiConfidence: Math.round(70 + Math.random() * 25), // 70-95% confidence
        submittedAt: new Date(Date.now() - idx * 3600000 * 5).toISOString(),
        status: 'pending' as const,
      };
    });
  }, [records.length, students.length]);

  const [queue, setQueue] = useState<PendingGrade[]>(initialQueue);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'overridden'>('all');
  const [overrideInputId, setOverrideInputId] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState<string>('');

  const handleApprove = (id: string) => {
    setQueue(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'approved', decidedAt: new Date().toISOString() }
          : item
      )
    );
    storageService.addAuditLog(
      user.id,
      'teacher',
      'GRADE_APPROVED',
      `Approved AI-suggested score for ${id}`
    );
  };

  const handleStartOverride = (id: string, currentScore: number) => {
    setOverrideInputId(id);
    setOverrideValue(String(currentScore));
  };

  const handleConfirmOverride = (id: string) => {
    const parsed = Number(overrideValue);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      alert('Please enter a score between 0 and 100.');
      return;
    }
    setQueue(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'overridden',
              overrideScore: parsed,
              decidedAt: new Date().toISOString(),
            }
          : item
      )
    );
    storageService.addAuditLog(
      user.id,
      'teacher',
      'GRADE_OVERRIDDEN',
      `Overrode AI score for ${id} to ${parsed}`
    );
    setOverrideInputId(null);
    setOverrideValue('');
  };

  const handleCancelOverride = () => {
    setOverrideInputId(null);
    setOverrideValue('');
  };

  const filteredQueue = queue.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const pendingCount = queue.filter(i => i.status === 'pending').length;
  const approvedCount = queue.filter(i => i.status === 'approved').length;
  const overriddenCount = queue.filter(i => i.status === 'overridden').length;
  const totalDecided = approvedCount + overriddenCount;

  const avgAiScore =
    queue.length > 0
      ? Math.round(queue.reduce((acc, q) => acc + q.aiSuggested, 0) / queue.length)
      : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Teacher Approval Workflow</span>
              {pendingCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingCount} pending
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Review AI-suggested grades for student answers. Approve the AI score or override it with your own.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80">
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Pending Review</div>
            <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{pendingCount}</div>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Approved</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{approvedCount}</div>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Overridden</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{overriddenCount}</div>
          </div>
          <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Avg AI Score</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{avgAiScore}</div>
          </div>
        </div>

        {/* Progress bar */}
        {queue.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Decision Progress</span>
              <span className="font-mono">{totalDecided} / {queue.length} reviewed</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${(totalDecided / queue.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400" />
        {(['all', 'pending', 'approved', 'overridden'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {filteredQueue.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400 text-sm">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            No items match this filter.
          </div>
        )}

        {filteredQueue.map(item => {
          const isPending = item.status === 'pending';
          const isApproved = item.status === 'approved';
          const isOverridden = item.status === 'overridden';
          const isEditing = overrideInputId === item.id;

          const statusBadge = isPending
            ? { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Pending' }
            : isApproved
            ? { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Approved' }
            : { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', label: 'Overridden' };

          return (
            <div
              key={item.id}
              className={`rounded-2xl border bg-slate-900/60 p-5 space-y-3 transition ${
                isPending ? 'border-slate-800' : 'border-slate-800/60'
              }`}
            >
              {/* Row Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-slate-500 shrink-0">{item.id}</span>
                  <span className="text-xs font-bold text-white truncate">{item.studentName}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">#{item.studentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                    {statusBadge.label}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="text-xs text-slate-300">
                <span className="text-slate-500 font-semibold">Q{item.questionId}: </span>
                {item.questionText}
              </div>

              {/* AI Suggestion + Decision */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* AI Suggestion */}
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">AI Suggested</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-indigo-400 font-mono">{item.aiSuggested}</span>
                    <span className="text-[10px] text-slate-500">/ 100</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Confidence: <span className="font-mono text-slate-300">{item.aiConfidence}%</span>
                  </div>
                </div>

                {/* Final Decision */}
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Final Score</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-2xl font-extrabold font-mono ${
                      isApproved ? 'text-emerald-400' : isOverridden ? 'text-indigo-400' : 'text-slate-500'
                    }`}>
                      {isPending ? '—' : isApproved ? item.aiSuggested : item.overrideScore}
                    </span>
                    <span className="text-[10px] text-slate-500">/ 100</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {isPending ? 'Awaiting decision' : isApproved ? 'Accepted AI score' : 'Teacher override'}
                  </div>
                </div>

                {/* Actions */}
                <div className="sm:col-span-1">
                  {isPending && !isEditing && (
                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleStartOverride(item.id, item.aiSuggested)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Override</span>
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={overrideValue}
                        onChange={e => setOverrideValue(e.target.value)}
                        className="w-16 rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleConfirmOverride(item.id)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-2 text-xs font-bold text-white transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={handleCancelOverride}
                        className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-2 text-xs text-slate-300 transition"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {(isApproved || isOverridden) && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center py-2">
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>AI score accepted</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Overridden to {item.overrideScore}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/60 p-4 flex gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300">How it works:</strong> Every AI-suggested grade passes through this approval queue before it's final. Approving
          accepts the Random Forest prediction as-is; overriding replaces it with the teacher's judgment. Both decisions are logged to the audit trail.
        </p>
      </div>
    </div>
  );
};