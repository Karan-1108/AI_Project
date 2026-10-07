/**
 * Teacher Main Dashboard
 */

import React from 'react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';
import { MasteryService } from '../../services/masteryService';
import { randomForestService } from '../../ai/randomForestModel';
import { ReportService } from '../../services/reportService';
import {
  Users,
  FileCheck2,
  BrainCircuit,
  Cpu,
  AlertTriangle,
  Sparkles,
  Download,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Database,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TeacherDashboardProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onNavigate }) => {
  const students = storageService.getUsers().filter(u => u.role === 'student');
  const exams = storageService.getExams();
  const attempts = storageService.getExamAttempts();
  const questions = storageService.getQuestions();
  const rfMetrics = randomForestService.getMetrics() ?? { r2Score: 0, featureImportances: {} };

  const heatmap = MasteryService.getClassroomMasteryHeatmap();
  const atRiskStudents = heatmap.students.filter(
    s => s.risk === 'Intervention Recommended' || s.risk === 'Needs Attention'
  );

  const weakestTopics = [...heatmap.topics].sort((a, b) => a.classAvg - b.classAvg);

  const avgClassMastery = heatmap.topics.length > 0
    ? Math.round((heatmap.topics.reduce((acc, t) => acc + t.classAvg, 0) / heatmap.topics.length) * 100)
    : 68;

  const chartData = heatmap.topics.map(t => ({
    name: t.name.length > 15 ? t.name.substring(0, 14) + '...' : t.name,
    classAvg: Math.round(t.classAvg * 100),
  }));

  const handleExportCSV = () => {
    const csv = ReportService.generateClassPerformanceCSV();
    ReportService.downloadCSV('IntelliExam_Classroom_Performance_Report.csv', csv);
  };

  const handleTestSupabase = async () => {
    const result = await storageService.testSupabaseConnection();
    alert(result);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Instructor Intelligence Portal
              </span>
              <span className="text-xs text-slate-400">Classroom Analytics & ML Pattern Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good morning, {user.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {students.length} active students tracked. Random Forest grading regressor (R² = {rfMetrics.r2Score}) synchronized with 550 evaluation records.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('ai_exam_generator')}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Exam Generator</span>
            </button>

            {/* Temporary Supabase Test Button */}
            <button
              onClick={handleTestSupabase}
              className="flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600/20 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-300 hover:bg-emerald-600/30 transition"
            >
              <Database className="h-4 w-4" />
              <span>Test Supabase</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Students</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{students.length}</span>
            <span className="text-xs font-medium text-emerald-400">Active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Computer Science & Math Cohort</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Class Mastery Avg</span>
            <BrainCircuit className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{avgClassMastery}%</span>
            <span className="text-xs font-medium text-indigo-400">BKT Aggregate</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${avgClassMastery}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Early Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{atRiskStudents.length}</span>
            <span className="text-xs font-medium text-slate-400">Students</span>
          </div>
          <button
            onClick={() => onNavigate('student_risk')}
            className="mt-1 text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
          >
            Review Interventions <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">ML Grading Model</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">R² {rfMetrics.r2Score}</span>
            <span className="text-xs font-medium text-slate-400">100 Trees</span>
          </div>
          <button
            onClick={() => onNavigate('grading_patterns')}
            className="mt-1 text-[11px] font-semibold text-indigo-400 hover:underline flex items-center gap-1"
          >
            View Feature Weights <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Classroom Topic Mastery Distribution</h3>
                <p className="text-xs text-slate-400">Mean estimated BKT posterior across all enrolled students.</p>
              </div>
              <button
                onClick={() => onNavigate('class_analytics')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View Full Heatmap
              </button>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}% Class Average`, 'Mastery']}
                  />
                  <Bar dataKey="classAvg" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.classAvg >= 75 ? '#10b981' : entry.classAvg >= 60 ? '#f59e0b' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Students Requiring Attention / Intervention</h3>
              </div>
              <button
                onClick={() => onNavigate('student_risk')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Detailed Risk Matrix
              </button>
            </div>

            <div className="space-y-3">
              {atRiskStudents.map(st => {
                const isCritical = st.risk === 'Intervention Recommended';

                return (
                  <div
                    key={st.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-950 p-4 border border-slate-800"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{st.name}</span>
                        <span className="text-[10px] text-slate-400">ID #{st.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCritical
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {st.risk}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Average Concept Mastery: <strong className="text-slate-200">{Math.round(st.avgMastery * 100)}%</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('ai_exam_generator')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
                    >
                      Assign Adaptive Test
                    </button>
                  </div>
                );
              })}

              {atRiskStudents.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                  All students are on track with average mastery above 60%.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Classroom Deficit Concepts</h3>
            <p className="text-xs text-slate-400">Topics where the cohort has the lowest combined accuracy.</p>

            <div className="space-y-3">
              {weakestTopics.slice(0, 4).map(topic => (
                <div key={topic.id} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-200">{topic.name}</span>
                    <span className="font-bold text-white">{Math.round(topic.classAvg * 100)}% Avg</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        topic.classAvg >= 0.7 ? 'bg-emerald-500' : topic.classAvg >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.round(topic.classAvg * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Quick Instructor Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('question_bank')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <span>Browse Question Bank ({questions.length} Items)</span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
              </button>
              <button
                onClick={() => onNavigate('create_exam')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <span>Create Standard Exam</span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
              </button>
              <button
                onClick={() => onNavigate('grading_patterns')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <span>Grading Model Simulator</span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};