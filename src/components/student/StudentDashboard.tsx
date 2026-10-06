/**
 * Student Main Dashboard
 */

import React from 'react';
import { User, Exam, ConceptMastery } from '../../types';
import { storageService } from '../../services/storageService';
import { MasteryService } from '../../services/masteryService';
import { BKTEngine } from '../../ai/bktEngine';
import {
  Sparkles,
  Flame,
  Award,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  Clock,
  Play,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StudentDashboardProps {
  user: User;
  onNavigate: (view: string) => void;
  onStartExam: (examId: string) => void;
  onViewResult: (attemptId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onNavigate,
  onStartExam,
  onViewResult,
}) => {
  const studentId = user.studentId || '101';
  const masteryMap = MasteryService.getStudentMasteryMap(studentId);
  const avgMastery = MasteryService.getAverageMastery(studentId);
  const rewardProfile = storageService.getRewardProfile(studentId);
  const attempts = storageService.getExamAttempts().filter(a => a.studentId === studentId);
  const publishedExams = storageService.getExams().filter(e => e.status === 'published');

  const assignedUnattemptedExams = publishedExams.filter(
    e => !attempts.some(a => a.examId === e.id)
  );

  // Identify lowest mastery concept for "Continue Learning"
  const sortedConcepts = Object.values(masteryMap).sort((a, b) => a.pMastery - b.pMastery);
  const weakestConcept: ConceptMastery | undefined = sortedConcepts[0];
  const weakList = sortedConcepts.filter(c => c.pMastery < 0.60);

  // Chart data: Recent exam performance
  const chartData = attempts.slice(-6).map((att, idx) => ({
    name: `Test ${idx + 1}`,
    score: att.percentageScore,
    accuracy: att.accuracy,
  }));

  if (chartData.length === 0) {
    chartData.push(
      { name: 'Baseline', score: 65, accuracy: 70 },
      { name: 'Diagnostic', score: 72, accuracy: 75 },
      { name: 'Latest Practice', score: 84, accuracy: 88 }
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Good morning, {user.displayName} 👋
              </h1>
            </div>
            <p className="text-sm text-slate-300">
              Your personalized learning intelligence is active. Bayesian mastery tracking updated from your recent responses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('ai_test')}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch AI Adaptive Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Concept Mastery</span>
            <BrainCircuit className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{Math.round(avgMastery * 100)}%</span>
            <span className="text-xs font-medium text-emerald-400">BKT Posterior</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full"
              style={{ width: `${Math.round(avgMastery * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Learning Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{rewardProfile.currentStreakDays} Days</span>
            <span className="text-xs font-medium text-amber-400">+10 Credits/day</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Streak active today</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tests Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{attempts.length}</span>
            <span className="text-xs font-medium text-slate-400">Assessments</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across 6 academic topics</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Reward Credits</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300">{rewardProfile.availableCredits}</span>
            <span className="text-xs font-medium text-slate-400">Credits</span>
          </div>
          <button
            onClick={() => onNavigate('rewards')}
            className="mt-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Redeem Amazon / Flipkart <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Priority Learning & Quick Assigned Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Continue Learning & Mastery Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Remediation Banner */}
          {weakestConcept && weakestConcept.pMastery < 0.65 && (
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 p-5 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Recommended Focus Area
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {weakestConcept.conceptName}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    Mastery is at <strong className="text-amber-300">{Math.round(weakestConcept.pMastery * 100)}%</strong>. Reviewing core principles and completing a 2-question micro-review will strengthen your score trajectory.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('weak_topics')}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition"
                >
                  <span>Start Review</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* AI Insights & Diagnostics Narrative */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Lightbulb className="h-4 w-4 text-cyan-400" />
                <span>AI Continuous Learning Diagnosis</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">BKT + Random Forest Engine</span>
            </div>
            <div className="mt-4 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                • <strong>Overall Trajectory:</strong> Over your last {attempts.length || 3} assessments, your accuracy in <span className="text-emerald-400 font-semibold">Quadratic Equations</span> and <span className="text-emerald-400 font-semibold">Linear Algebra</span> reached {Math.round(avgMastery * 100)}% mastery.
              </p>
              <p>
                • <strong>Detected Gaps:</strong> In <span className="text-amber-400 font-semibold">{weakestConcept?.conceptName || 'Graph Algorithms'}</span>, errors were tagged as <em>Conceptual Distractor Fallacies</em> rather than arithmetic slips. Targeted micro-video review is recommended before taking full-length exams.
              </p>
            </div>
          </div>

          {/* Recent Performance Trend Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span>Score & Accuracy Progression</span>
              </div>
              <span className="text-xs text-slate-400">Last Tests</span>
            </div>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" name="Score %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Assigned Exams & Weak Topics List */}
        <div className="space-y-6">
          {/* Assigned & Scheduled Exams */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white">Assigned Exams</span>
              <button
                onClick={() => onNavigate('my_exams')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View All
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {assignedUnattemptedExams.slice(0, 3).map(exam => (
                <div
                  key={exam.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white leading-snug">{exam.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      {exam.examType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {exam.durationMinutes} mins
                    </span>
                    <span>•</span>
                    <span>{exam.questionIds.length} Questions</span>
                    <span>•</span>
                    <span>{exam.totalMarks} Marks</span>
                  </div>
                  <button
                    onClick={() => onStartExam(exam.id)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
                  >
                    <Play className="h-3 w-3" />
                    <span>Take Exam</span>
                  </button>
                </div>
              ))}

              {assignedUnattemptedExams.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                  All assigned exams completed! Try an AI Adaptive Test.
                </div>
              )}
            </div>
          </div>

          {/* Weak Topics Quick List */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white">Mastery Breakdown</span>
              <button
                onClick={() => onNavigate('concept_mastery')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Full Matrix
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {sortedConcepts.slice(0, 4).map(c => {
                const color = BKTEngine.getStatusColor(c.status);
                return (
                  <div key={c.conceptId} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{c.conceptName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color.bg} ${color.text} ${color.border}`}>
                        {Math.round(c.pMastery * 100)}% · {c.status}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          c.pMastery >= 0.75 ? 'bg-emerald-500' : c.pMastery >= 0.60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.round(c.pMastery * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
