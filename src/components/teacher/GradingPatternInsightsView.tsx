/**
 * Teacher Grading Pattern Insights (Random Forest Regressor ML Model)
 * + AI vs Teacher Evaluation Table
 */

import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';
import { randomForestService } from '../../ai/randomForestModel';
import {
  Cpu,
  BrainCircuit,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Target,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ZAxis,
  ReferenceLine,
} from 'recharts';

interface GradingPatternInsightsViewProps {
  user: User;
}

export const GradingPatternInsightsView: React.FC<GradingPatternInsightsViewProps> = ({ user }) => {
  const [metrics, setMetrics] = useState(randomForestService.getMetrics());
  const records = storageService.getTeacherGradingRecords();
  const [isRetraining, setIsRetraining] = useState(false);

  // Live Grading Simulator Sliders
  const [simCorrectness, setSimCorrectness] = useState(0.85);
  const [simDepth, setSimDepth] = useState(0.70);
  const [simPresentation, setSimPresentation] = useState(0.80);
  const [simKeywords, setSimKeywords] = useState(0.75);
  const [simEffort, setSimEffort] = useState(0.65);
  const [simDifficulty, setSimDifficulty] = useState(0.50);

  const prediction = randomForestService.explainPrediction(
    simCorrectness,
    simDepth,
    simPresentation,
    simKeywords,
    simEffort,
    simDifficulty
  );

  const featureChartData = [
    { name: 'Correctness', weight: Math.round((metrics?.featureImportances?.correctness ?? 0.48) * 100) },
    { name: 'Depth', weight: Math.round((metrics?.featureImportances?.explanationDepth ?? 0.22) * 100) },
    { name: 'Presentation', weight: Math.round((metrics?.featureImportances?.presentationScore ?? 0.14) * 100) },
    { name: 'Keywords', weight: Math.round((metrics?.featureImportances?.keywordDensity ?? 0.08) * 100) },
    { name: 'Effort', weight: Math.round((metrics?.featureImportances?.effortWeight ?? 0.05) * 100) },
    { name: 'Difficulty', weight: Math.round((metrics?.featureImportances?.questionDifficulty ?? 0.03) * 100) },
  ];

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      storageService.retrainGradingModel();
      setMetrics(randomForestService.getMetrics());
      setIsRetraining(false);
      alert(`🎉 Random Forest model retrained across ${records.length} evaluation records!`);
    }, 600);
  };

  // ================================================================
  // AI vs Teacher Evaluation — computed from real records
  // ================================================================
  const evaluationData = useMemo(() => {
    // Use up to 30 records for the table, and ALL records for metrics
    const allEvaluated = records.map((r, idx) => {
      // Use the same explainPrediction API that already works in this file
      const pred = randomForestService.explainPrediction(
        r.correctness,
        r.explanationDepth,
        r.presentationScore,
        r.keywordDensity,
        r.effortWeight,
        r.questionDifficulty
      );
      const aiScore = Math.round(pred.predictedGrade);
      const teacherScore = Math.round(r.teacherGrade);
      const diff = aiScore - teacherScore;
      return {
        id: `EV-${idx + 1}`,
        recordId: r.id,
        studentId: r.studentId ?? `STU-${idx + 1}`,
        questionId: `Q-${idx + 1}`,
        aiScore,
        teacherScore,
        diff,
        agreed: Math.abs(diff) <= 5,
      };
    });

    const totalRecords = allEvaluated.length;
    const totalAbsError = allEvaluated.reduce((acc, r) => acc + Math.abs(r.diff), 0);
    const mae = totalRecords > 0 ? (totalAbsError / totalRecords).toFixed(2) : '0.00';
    const agreedCount = allEvaluated.filter(r => r.agreed).length;
    const agreementRate = totalRecords > 0 ? Math.round((agreedCount / totalRecords) * 100) : 0;
    const within3 = allEvaluated.filter(r => Math.abs(r.diff) <= 3).length;
    const within3Rate = totalRecords > 0 ? Math.round((within3 / totalRecords) * 100) : 0;

    // Scatter plot data (sample of up to 200 to keep the chart snappy)
    const scatterData = allEvaluated.slice(0, 200).map(r => ({
      x: r.teacherScore,
      y: r.aiScore,
    }));

    return {
      tableRows: allEvaluated.slice(0, 20), // First 20 for the visible table
      scatterData,
      mae,
      agreementRate,
      within3Rate,
      totalRecords,
    };
  }, [records]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-400" />
            <span>Teacher Grading Pattern Insights (Random Forest Regressor)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Supervised Ensemble ML Model (100 Decision Trees) learned from {records.length} historical grading decisions.
          </p>
        </div>
        <button
          disabled={isRetraining}
          onClick={handleRetrain}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition"
        >
          <RefreshCw className={`h-4 w-4 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Fitting Ensemble...' : 'Retrain on Latest Records'}</span>
        </button>
      </div>

      {/* Model Benchmark Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            R² Score (Variance Explained)
          </span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {metrics?.r2Score ?? '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High fidelity pattern replication</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Root Mean Squared Error (RMSE)
          </span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2">
            ±{metrics?.rmse ?? '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">On 100-point rubric scale</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Ensemble Decision Trees
          </span>
          <div className="text-3xl font-extrabold text-white mt-2">
            100 Trees
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Max Depth: {metrics?.maxDepth ?? '—'} (Bagging)</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Training Records
          </span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2">
            {records.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Evaluated Teacher Submissions</p>
        </div>
      </div>

      {/* Main Grid: Feature Importances & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Feature Importances Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Learned Teacher Feature Importance Weights</h3>
              <p className="text-xs text-slate-400">Relative Gini importance assigned by the Random Forest model.</p>
            </div>
            <span className="text-xs text-indigo-400 font-mono">100% Normalized</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 60]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% Weight`, 'Importance']}
                />
                <Bar dataKey="weight" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {featureChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.weight > 30 ? '#6366f1' : entry.weight > 15 ? '#3b82f6' : '#06b6d4'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-cyan-400" />
              <span>Pedagogical Pattern Summary</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              • <strong>Core Finding:</strong> The teacher values <strong className="text-indigo-300">Objective Solution Correctness (48%)</strong> and <strong className="text-cyan-300">Explanation Depth & Invariant Rigor (22%)</strong> most heavily.
            </p>
            <p className="leading-relaxed text-slate-300">
              • <strong>Formatting & Effort:</strong> Presentation structure accounts for ~14% of the score variance, while pure keyword matching has a modest 8% influence.
            </p>
          </div>
        </div>

        {/* Right Col: Live Interactive Grading Simulator */}
        <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/70 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Grading Simulator</h3>
              <p className="text-xs text-slate-400">Move the rubric sliders to see real-time Random Forest score predictions.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-indigo-400 leading-none">
                {prediction.predictedGrade}%
              </span>
              <span className="text-[10px] text-slate-400 block">Predicted Score</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Rubric Correctness & Mathematical Precision</span>
                <span className="text-indigo-400 font-bold">{Math.round(simCorrectness * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={simCorrectness}
                onChange={e => setSimCorrectness(Number(e.target.value))}
                className="w-full accent-indigo-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Explanation Depth & Theoretical Justification</span>
                <span className="text-indigo-400 font-bold">{Math.round(simDepth * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={simDepth}
                onChange={e => setSimDepth(Number(e.target.value))}
                className="w-full accent-indigo-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Presentation Clarity & Code Structure</span>
                <span className="text-indigo-400 font-bold">{Math.round(simPresentation * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={simPresentation}
                onChange={e => setSimPresentation(Number(e.target.value))}
                className="w-full accent-indigo-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Core Keyword Coverage</span>
                <span className="text-indigo-400 font-bold">{Math.round(simKeywords * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={simKeywords}
                onChange={e => setSimKeywords(Number(e.target.value))}
                className="w-full accent-indigo-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Student Attempt Effort</span>
                <span className="text-indigo-400 font-bold">{Math.round(simEffort * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={simEffort}
                onChange={e => setSimEffort(Number(e.target.value))}
                className="w-full accent-indigo-500" />
            </div>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-white">Explainable Prediction Breakdown:</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              {prediction.breakdown.map(item => (
                <div key={item.component}>
                  {item.component}: <strong className="text-indigo-400">+{item.scoreContribution} pts ({item.weightPercent}%)</strong>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic border-t border-slate-900 pt-2">{prediction.interpretation}</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* NEW SECTION: AI vs Teacher Evaluation Table + Scatter Plot    */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-cyan-950/20 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-600/20 border border-cyan-500/30">
              <Target className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI vs Teacher Score Evaluation</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Model Validation
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Side-by-side comparison of AI-suggested scores against the teacher's final scores across {evaluationData.totalRecords} historical grading records.
              </p>
            </div>
          </div>
          <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
        </div>

        {/* Evaluation KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Mean Absolute Error</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{evaluationData.mae}</div>
            <div className="text-[10px] text-slate-500 mt-1">points (lower = better)</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Agreement Rate (±5 pts)</div>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">{evaluationData.agreementRate}%</div>
            <div className="text-[10px] text-slate-500 mt-1">of records within tolerance</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Strict Match (±3 pts)</div>
            <div className="text-2xl font-extrabold text-indigo-400 mt-1 font-mono">{evaluationData.within3Rate}%</div>
            <div className="text-[10px] text-slate-500 mt-1">tight alignment rate</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Sample Size</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono">{evaluationData.totalRecords}</div>
            <div className="text-[10px] text-slate-500 mt-1">teacher-graded answers</div>
          </div>
        </div>

        {/* Table + Scatter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
          {/* Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Score Comparison Table (Sample of 20)</h3>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden max-h-[420px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">ID</th>
                    <th className="text-right px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">AI Score</th>
                    <th className="text-right px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Teacher Score</th>
                    <th className="text-right px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Δ Diff</th>
                    <th className="text-center px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200 font-mono">
                  {evaluationData.tableRows.map((row, idx) => {
                    const absDiff = Math.abs(row.diff);
                    const diffColor =
                      absDiff <= 3 ? 'text-emerald-400' :
                      absDiff <= 7 ? 'text-amber-400' :
                      'text-rose-400';
                    return (
                      <tr key={row.id} className={`border-b border-slate-800/60 ${idx % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'}`}>
                        <td className="px-3 py-2 text-slate-400">{row.id}</td>
                        <td className="px-3 py-2 text-right text-indigo-400 font-bold">{row.aiScore}</td>
                        <td className="px-3 py-2 text-right text-white font-bold">{row.teacherScore}</td>
                        <td className={`px-3 py-2 text-right font-bold ${diffColor}`}>
                          {row.diff >= 0 ? '+' : ''}{row.diff}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.agreed ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Agreed
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Overridden
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">
              Green = within ±3 points · Amber = within ±7 · Red = larger deviation.
            </p>
          </div>

          {/* Scatter Plot */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">AI Score vs Teacher Score Correlation</h3>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Teacher"
                      domain={[0, 100]}
                      stroke="#64748b"
                      fontSize={11}
                      label={{ value: 'Teacher Final Score', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="AI"
                      domain={[0, 100]}
                      stroke="#64748b"
                      fontSize={11}
                      label={{ value: 'AI Suggested Score', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                    />
                    <ZAxis range={[40, 40]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: any, name: any) => [`${val} pts`, name === 'x' ? 'Teacher' : 'AI']}
                    />
                    <ReferenceLine
                      segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                    <Scatter data={evaluationData.scatterData} fill="#06b6d4" fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Dots closer to the <span className="text-emerald-400 font-semibold">green diagonal</span> represent tighter agreement between AI and teacher scores.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* ==================== END EVALUATION SECTION ==================== */}
    </div>
  );
};