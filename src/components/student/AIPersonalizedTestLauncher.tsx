/**
 * AI Personalized & Adaptive Test Launcher
 */

import React, { useState } from 'react';
import { User, ConceptMastery } from '../../types';
import { storageService } from '../../services/storageService';
import { MasteryService } from '../../services/masteryService';
import { AdaptiveExamGenerator } from '../../ai/adaptiveExamGenerator';
import { BKTEngine } from '../../ai/bktEngine';
import {
  Sparkles,
  BrainCircuit,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  Play,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AIPersonalizedTestLauncherProps {
  user: User;
  onStartExam: (examId: string) => void;
  onNavigate: (view: string) => void;
}

export const AIPersonalizedTestLauncher: React.FC<AIPersonalizedTestLauncherProps> = ({
  user,
  onStartExam,
  onNavigate,
}) => {
  const studentId = user.studentId || '101';
  const masteryMap = MasteryService.getStudentMasteryMap(studentId);
  const concepts = Object.values(masteryMap);
  const questions = storageService.getQuestions();

  const weakConcepts = concepts.filter(c => c.pMastery < 0.65).sort((a, b) => a.pMastery - b.pMastery);
  const targetConcepts = weakConcepts.length > 0 ? weakConcepts : concepts.slice(0, 3);

  const [questionCount, setQuestionCount] = useState<number>(6);
  const [focusPriority, setFocusPriority] = useState<'remediation' | 'balanced' | 'challenge'>('remediation');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);

  const handleLaunchAdaptiveTest = () => {
    setIsGenerating(true);
    setGenerationLogs(['Reading student BKT Bayesian posterior vector...']);

    setTimeout(() => {
      setGenerationLogs(prev => [
        ...prev,
        `Identified ${weakConcepts.length} mastery deficit concepts (P(M) < 0.65)`,
        `Applying Zone of Proximal Development (ZPD) heuristic...`,
      ]);
    }, 250);

    setTimeout(() => {
      setGenerationLogs(prev => [
        ...prev,
        `Executing Multi-Objective Constraint Solver (Bloom Taxonomies + Difficulty)...`,
      ]);
    }, 550);

    setTimeout(() => {
      const targetIds = targetConcepts.map(c => c.conceptName);
      const generated = AdaptiveExamGenerator.generateExam(questions, {
        totalQuestions: questionCount,
        selectedTopics: targetIds,
        targetStudentId: studentId,
        targetStudentName: user.displayName,
        studentMasteryMap: masteryMap,
        targetDifficulty: focusPriority === 'challenge' ? 'Hard' : focusPriority === 'remediation' ? 'Remediation' : 'Adaptive',
        durationMinutes: questionCount * 3,
      });

      if (generated.exam.id) {
        storageService.addExam(generated.exam as any);
        setIsGenerating(false);
        onStartExam(generated.exam.id);
      }
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-cyan-400" />
          <span>AI Adaptive Exam Synthesis Engine</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Dynamically constructs an assessment mathematically optimized to remediate your specific Bayesian Knowledge Tracing gaps.
        </p>
      </div>

      {/* Real-time Diagnostics Matrix */}
      <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/70 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Targeted Knowledge Deficit Analysis</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">BKT Engine Active</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            The adaptive generator has analyzed your past responses and prioritized the following concepts:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {targetConcepts.slice(0, 3).map(c => {
              const color = BKTEngine.getStatusColor(c.status);
              return (
                <div key={c.conceptId} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{c.conceptName}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color.bg} ${color.text} ${color.border}`}>
                      {Math.round(c.pMastery * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        c.pMastery >= 0.6 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.round(c.pMastery * 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Status: <strong className="text-slate-300">{c.status}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customization Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Exam Length
            </label>
            <div className="flex gap-2">
              {[4, 6, 10].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setQuestionCount(cnt)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                    questionCount === cnt
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {cnt} Questions (~{cnt * 3}m)
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pedagogical Objective
            </label>
            <div className="flex gap-2">
              {[
                { id: 'remediation', label: 'Remediation' },
                { id: 'balanced', label: 'Balanced' },
                { id: 'challenge', label: 'Challenge' },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setFocusPriority(mode.id as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                    focusPriority === mode.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Generation Console */}
        {isGenerating && (
          <div className="rounded-xl bg-slate-950 p-4 border border-indigo-500/30 space-y-2 font-mono text-xs text-indigo-300">
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <Cpu className="h-4 w-4 animate-spin" />
              <span>Synthesizing Personalized Exam...</span>
            </div>
            {generationLogs.map((log, idx) => (
              <div key={idx} className="text-[11px] text-slate-300">
                › {log}
              </div>
            ))}
          </div>
        )}

        <button
          disabled={isGenerating}
          onClick={handleLaunchAdaptiveTest}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition"
        >
          <Play className="h-4 w-4" />
          <span>{isGenerating ? 'Generating Adaptive Assessment...' : 'Generate & Launch Personalized Test'}</span>
        </button>
      </div>
    </div>
  );
};
