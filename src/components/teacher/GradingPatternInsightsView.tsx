/**
 * Teacher Grading Pattern Insights (Random Forest Regressor ML Model)
 */

import React, { useState } from 'react';
import { User, TeacherGradingRecord } from '../../types';
import { storageService } from '../../services/storageService';
import { randomForestService } from '../../ai/randomForestModel';
import {
  Cpu,
  BrainCircuit,
  TrendingUp,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
  HelpCircle,
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

  // Predict live score with explainable breakdown
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
            {metrics.r2Score}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High fidelity pattern replication</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Root Mean Squared Error (RMSE)
          </span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2">
            ±{metrics.rmse}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">On 100-point rubric scale</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Ensemble Decision Trees
          </span>
          <div className="text-3xl font-extrabold text-white mt-2">
            {metrics.treeCount} Trees
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Max Depth: {metrics.maxDepth} (Bagging)</p>
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
        {/* Left Col: Feature Importances Chart & Insights */}
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

          {/* Qualitative Insights */}
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

          {/* Simulator Sliders */}
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Rubric Correctness & Mathematical Precision</span>
                <span className="text-indigo-400 font-bold">{Math.round(simCorrectness * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simCorrectness}
                onChange={e => setSimCorrectness(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Explanation Depth & Theoretical Justification</span>
                <span className="text-indigo-400 font-bold">{Math.round(simDepth * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simDepth}
                onChange={e => setSimDepth(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Presentation Clarity & Code Structure</span>
                <span className="text-indigo-400 font-bold">{Math.round(simPresentation * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simPresentation}
                onChange={e => setSimPresentation(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Core Keyword Coverage</span>
                <span className="text-indigo-400 font-bold">{Math.round(simKeywords * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simKeywords}
                onChange={e => setSimKeywords(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Student Attempt Effort</span>
                <span className="text-indigo-400 font-bold">{Math.round(simEffort * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simEffort}
                onChange={e => setSimEffort(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Explainable Factor Breakdown */}
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
    </div>
  );
};
