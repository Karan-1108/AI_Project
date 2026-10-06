/**
 * Classroom Analytics & Mastery Heatmap Matrix
 */

import React, { useState } from 'react';
import { User } from '../../types';
import { MasteryService } from '../../services/masteryService';
import { BKTEngine } from '../../ai/bktEngine';
import { ReportService } from '../../services/reportService';
import {
  Users,
  Download,
  Search,
  Filter,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface ClassAnalyticsViewProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const ClassAnalyticsView: React.FC<ClassAnalyticsViewProps> = ({ user, onNavigate }) => {
  const heatmap = MasteryService.getClassroomMasteryHeatmap();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = heatmap.students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm)
  );

  const handleExportCSV = () => {
    const csv = ReportService.generateClassPerformanceCSV();
    ReportService.downloadCSV('IntelliExam_Classroom_Mastery_Matrix.csv', csv);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            <span>Classroom Mastery Heatmap Matrix</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Cross-tabulated Bayesian Knowledge Tracing posterior probabilities across all enrolled students and topics.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
        >
          <Download className="h-4 w-4" />
          <span>Export Matrix CSV</span>
        </button>
      </div>

      {/* Heatmap Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Color Scale:</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40" /> ≥75% Mastered</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500/40" /> 60-74% Developing</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-rose-500/20 border border-rose-500/40" /> &lt;60% Deficit</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-3 font-bold text-slate-300 min-w-[160px] sticky left-0 bg-slate-900 z-10">
                  Student Name
                </th>
                <th className="p-3 font-bold text-slate-400 text-center min-w-[90px]">
                  Avg Mastery
                </th>
                <th className="p-3 font-bold text-slate-400 text-center min-w-[120px]">
                  Academic Risk
                </th>
                {heatmap.topics.map(t => (
                  <th key={t.id} className="p-3 font-bold text-slate-300 text-center min-w-[130px]">
                    <div className="leading-snug">{t.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                      Avg: {Math.round(t.classAvg * 100)}%
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-semibold text-white sticky left-0 bg-slate-900 z-10 border-r border-slate-800/80">
                    <div>{student.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">ID #{student.id}</div>
                  </td>
                  <td className="p-3 font-bold text-center text-indigo-400">
                    {Math.round(student.avgMastery * 100)}%
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        student.risk === 'On Track'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : student.risk === 'Needs Attention'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {student.risk}
                    </span>
                  </td>

                  {/* Grid cells */}
                  {heatmap.topics.map(t => {
                    const cell = heatmap.grid.find(
                      g => g.studentId === student.id && g.conceptId === t.id
                    );
                    const pVal = cell ? cell.pMastery : 0.50;
                    const pct = Math.round(pVal * 100);

                    let cellColor = 'bg-rose-950/20 text-rose-300 border-rose-500/30';
                    if (pVal >= 0.75) cellColor = 'bg-emerald-950/20 text-emerald-300 border-emerald-500/30';
                    else if (pVal >= 0.60) cellColor = 'bg-amber-950/20 text-amber-300 border-amber-500/30';

                    return (
                      <td key={t.id} className="p-2 text-center">
                        <div className={`p-1.5 rounded-lg border text-xs font-bold ${cellColor}`}>
                          {pct}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
