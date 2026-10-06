/**
 * Targeted Weak Topics Remediation & Micro-Review Hub
 */

import React, { useState } from 'react';
import { User, Question, ErrorCategory } from '../../types';
import { storageService } from '../../services/storageService';
import { RecommendationService } from '../../services/recommendationService';
import { BKTEngine } from '../../ai/bktEngine';
import { MisconceptionClassifier } from '../../ai/misconceptionClassifier';
import { RewardService } from '../../services/rewardService';
import {
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface WeakTopicsRemediationProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const WeakTopicsRemediation: React.FC<WeakTopicsRemediationProps> = ({
  user,
  onNavigate,
}) => {
  const studentId = user.studentId || '101';
  const plans = RecommendationService.getStudentRemediationNeeds(studentId);

  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    plans[0]?.conceptId || 'C6_Dynamic_Programming'
  );

  const activePlan = RecommendationService.getRemediationPlan(studentId, selectedConceptId);

  // Micro-review interactive state
  const [microAnswers, setMicroAnswers] = useState<Record<string, string>>({});
  const [evaluatedResults, setEvaluatedResults] = useState<Record<string, { isCorrect: boolean; feedback: string }> | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleSelectAnswer = (qId: string, optId: string) => {
    if (isCompleted) return;
    setMicroAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const handleSubmitMicroReview = () => {
    const results: Record<string, { isCorrect: boolean; feedback: string }> = {};
    let correctCount = 0;

    activePlan.microReviewQuestions.forEach(q => {
      const given = microAnswers[q.id];
      const isCorrect = String(given).toLowerCase() === String(q.correctAnswer).toLowerCase();
      if (isCorrect) correctCount += 1;

      // Update student BKT mastery
      const current = storageService.getMasteryRecords(studentId)[q.conceptId];
      const updated = BKTEngine.processResponse(
        current,
        studentId,
        q.conceptId,
        q.topic,
        q.subject,
        isCorrect,
        isCorrect ? 'none' : 'conceptual_misunderstanding'
      );
      storageService.updateStudentMastery(updated);

      results[q.id] = {
        isCorrect,
        feedback: isCorrect ? 'Correct! ' + q.explanation : MisconceptionClassifier.diagnose(q, given).problemSummary + '. ' + q.explanation,
      };
    });

    setEvaluatedResults(results);
    setIsCompleted(true);

    // Award remediation credits
    RewardService.awardCredits(studentId, 25, `Remediation Micro-Review in ${activePlan.conceptName}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
          <span>Targeted Remediation & Concept Recovery Hub</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Personalized remediation plans, error misconception diagnoses, and 2-question micro-reviews to boost your Bayesian mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Weak Concepts List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Identified Knowledge Deficits ({plans.length})
          </h3>

          <div className="space-y-2">
            {plans.map(plan => {
              const isSel = plan.conceptId === selectedConceptId;
              const color = BKTEngine.getStatusColor(plan.status);

              return (
                <button
                  key={plan.conceptId}
                  onClick={() => {
                    setSelectedConceptId(plan.conceptId);
                    setMicroAnswers({});
                    setEvaluatedResults(null);
                    setIsCompleted(false);
                  }}
                  className={`w-full text-left rounded-2xl p-4 border transition space-y-2 ${
                    isSel
                      ? 'border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white leading-snug truncate">
                      {plan.conceptName}
                    </h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color.bg} ${color.text} ${color.border}`}>
                      {Math.round(plan.pMastery * 100)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        plan.pMastery >= 0.6 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.round(plan.pMastery * 100)}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 truncate">
                    Deficit: {MisconceptionClassifier.getErrorTypeLabel(plan.primaryMisconception)}
                  </div>
                </button>
              );
            })}

            {plans.length === 0 && (
              <div className="p-6 text-center text-slate-400 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                No critical knowledge gaps detected! All concepts above 65%.
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Active Plan Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Concept Overview & Diagnostic Feedback */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Concept Diagnosis
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{activePlan.conceptName}</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-400 leading-none">
                  {Math.round(activePlan.pMastery * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 block">Posterior BKT</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {activePlan.feedback}
            </p>

            {/* Recommended Learning Order */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-300">Recommended 5-Step Remediation Sequence:</h4>
              <div className="space-y-1 text-xs text-slate-400">
                {activePlan.recommendedLearningOrder.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Curated YouTube Video Lesson */}
          {activePlan.youtubeRecommendations.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Play className="h-4 w-4 text-rose-500 fill-rose-500" />
                  <span>Curated High-Yield Video Lesson</span>
                </div>
                <button
                  onClick={() => onNavigate('recommendations')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View Video Library
                </button>
              </div>

              {activePlan.youtubeRecommendations.slice(0, 1).map(yt => (
                <div
                  key={yt.id}
                  className="flex flex-col sm:flex-row items-start gap-4 rounded-xl bg-slate-950 p-4 border border-slate-800"
                >
                  <div className="w-full sm:w-40 h-24 rounded-lg bg-slate-900 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center relative">
                    {yt.youtubeVideoId ? (
                      <img
                        src={`https://img.youtube.com/vi/${yt.youtubeVideoId}/hqdefault.jpg`}
                        alt={yt.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-slate-500">
                        <Play className="h-6 w-6 text-rose-500 mb-1" />
                        <span className="text-[9px] font-bold">Academic Tutorial</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-mono text-white">
                      {yt.durationMinutes}m
                    </span>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">
                        {yt.channelName}
                      </span>
                      <span className="text-[10px] text-slate-400">{yt.durationMinutes} mins</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{yt.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{yt.description}</p>
                    <a
                      href={yt.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 pt-1"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2-Question Low-Stakes Micro-Review */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Low-Stakes Micro-Review Practice</h3>
                <p className="text-xs text-slate-400">Answer 2 targeted questions to immediately recalculate mastery probability.</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                +25 Credits
              </span>
            </div>

            <div className="space-y-4">
              {activePlan.microReviewQuestions.map((q, idx) => {
                const evalInfo = evaluatedResults ? evaluatedResults[q.id] : null;

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-400">Practice Item {idx + 1}</span>
                      <span className="text-[10px] text-slate-400">Bloom: {q.bloomsLevel}</span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Options */}
                    <div className="space-y-2">
                      {q.options?.map(opt => {
                        const isSel = microAnswers[q.id] === opt.id;
                        const isCorrectKey = String(opt.id).toLowerCase() === String(q.correctAnswer).toLowerCase();

                        let optClass = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80';
                        if (isSel) optClass = 'bg-indigo-600/30 border-indigo-500 text-white font-semibold';
                        if (evalInfo) {
                          if (isCorrectKey) optClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                          else if (isSel && !evalInfo.isCorrect) optClass = 'bg-rose-500/20 border-rose-500 text-rose-300';
                        }

                        return (
                          <button
                            key={opt.id}
                            disabled={isCompleted}
                            onClick={() => handleSelectAnswer(q.id, opt.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition ${optClass}`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 text-[11px] font-bold">
                              {opt.id.toUpperCase()}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback box on submission */}
                    {evalInfo && (
                      <div
                        className={`rounded-lg p-3 text-xs border ${
                          evalInfo.isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <strong>{evalInfo.isCorrect ? '✓ Well Done: ' : '✗ Diagnostic Tip: '}</strong>
                        <span>{evalInfo.feedback}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!isCompleted ? (
              <button
                onClick={handleSubmitMicroReview}
                disabled={Object.keys(microAnswers).length < activePlan.microReviewQuestions.length}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Answers & Update Mastery</span>
              </button>
            ) : (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>Micro-Review Complete! +25 Credits Added to Balance</span>
                </div>
                <p className="text-slate-300">
                  Bayesian Knowledge Tracing has recalculated your posterior probability for {activePlan.conceptName}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
