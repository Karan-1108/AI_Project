/**
 * Teacher Grading Assistant (AI Rubric Scoring & Submission Review)
 */

import React, { useState } from 'react';
import { User, Question } from '../../types';
import { storageService } from '../../services/storageService';
import { TeacherGradingAssistant } from '../../ai/teacherGradingAssistant';
import {
  CheckCircle2,
  Sparkles,
  Award,
  Edit3,
  Check,
  RotateCcw,
  BookOpen,
  MessageSquare,
  Search,
} from 'lucide-react';

interface TeacherGradingAssistantViewProps {
  user: User;
}

export const TeacherGradingAssistantView: React.FC<TeacherGradingAssistantViewProps> = ({ user }) => {
  const questions = storageService.getQuestions();
  const descriptiveQuestions = questions.filter(
    q => q.questionType === 'descriptive' || q.questionType === 'short_answer' || q.questionType === 'code_question'
  );

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    descriptiveQuestions[0]?.id || questions[0]?.id || ''
  );

  const [studentSubmissionText, setStudentSubmissionText] = useState(
    'A Binary Search Tree requires every left node to be smaller and every right node to be larger. When we delete a node with two children, we find its in-order successor (the smallest node in its right subtree), replace the deleted node value with the successor value, and recursively remove that successor leaf node to maintain the BST invariant.'
  );

  const [assignedScore, setAssignedScore] = useState<number>(8);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('Clear and concise explanation of BST deletion invariance.');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [lastSavedStatus, setLastSavedStatus] = useState<string | null>(null);

  const activeQuestion = questions.find(q => q.id === selectedQuestionId) || questions[0];

  // AI Evaluation result
  const [evalResult, setEvalResult] = useState(() =>
    TeacherGradingAssistant.evaluateSubmission(activeQuestion, studentSubmissionText)
  );

  const handleRunAiEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const res = TeacherGradingAssistant.evaluateSubmission(activeQuestion, studentSubmissionText);
      setEvalResult(res);
      setAssignedScore(res.suggestedScore);
      setFeedbackNotes(res.detailedRationale);
      setIsEvaluating(false);
    }, 300);
  };

  const handleAcceptAiGrade = () => {
    setAssignedScore(evalResult.suggestedScore);
    setFeedbackNotes(evalResult.detailedRationale);
    setLastSavedStatus('Accepted AI Grade and updated score!');
    setTimeout(() => setLastSavedStatus(null), 3000);
  };

  const handleSaveToGradingHistory = () => {
    storageService.addGradingRecords([
      {
        id: `gr_${Date.now()}`,
        studentId: '101',
        correctness: assignedScore / (activeQuestion.marks || 10),
        presentationScore: 0.80,
        effortWeight: 0.80,
        explanationDepth: 0.85,
        keywordDensity: 0.75,
        questionDifficulty: activeQuestion.difficultyScore,
        teacherGrade: Math.round((assignedScore / (activeQuestion.marks || 10)) * 100),
        questionType: activeQuestion.questionType,
        timestamp: new Date().toISOString(),
      },
    ]);

    setLastSavedStatus(`Saved to training dataset (${storageService.getTeacherGradingRecords().length} total records).`);
    setTimeout(() => setLastSavedStatus(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-indigo-400" />
          <span>Teacher Grading Assistant (AI Rubric Scoring)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Evaluates open-ended student answers using the learned Random Forest model, matching rubrics, keywords, and structural invariants.
        </p>
      </div>

      {lastSavedStatus && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3.5 text-xs text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{lastSavedStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Question & Student Submission */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Item
              </span>
              <select
                value={selectedQuestionId}
                onChange={e => {
                  setSelectedQuestionId(e.target.value);
                  const q = questions.find(item => item.id === e.target.value);
                  if (q) {
                    const res = TeacherGradingAssistant.evaluateSubmission(q, studentSubmissionText);
                    setEvalResult(res);
                    setAssignedScore(res.suggestedScore);
                  }
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
              >
                {questions.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.topic} - Bloom: {q.bloomsLevel} ({q.marks} Marks)
                  </option>
                ))}
              </select>
            </div>

            {/* Question Details */}
            <div className="space-y-1 text-xs">
              <h3 className="text-sm font-bold text-white leading-snug">
                {activeQuestion.questionText}
              </h3>
              <div className="text-slate-400 pt-1">
                Standard Solution / Reference: <span className="text-slate-300">{activeQuestion.explanation}</span>
              </div>
            </div>

            {/* Student Answer Textarea */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Student Submitted Response:</span>
                <button
                  onClick={handleRunAiEvaluation}
                  disabled={isEvaluating}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isEvaluating ? 'Evaluating...' : 'Re-Evaluate with AI'}</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={studentSubmissionText}
                onChange={e => setStudentSubmissionText(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs sm:text-sm text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Col: AI Recommended Rubric Score & Actions */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/70 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">AI Rubric Evaluation</h3>
              </div>
              <span className="text-xs text-emerald-400 font-bold">
                {evalResult.percentage}% Score
              </span>
            </div>

            {/* Score Recommendation */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Suggested Score:</span>
                <span className="text-2xl font-extrabold text-indigo-400">
                  {evalResult.suggestedScore} <span className="text-sm font-normal text-slate-400">/ {activeQuestion.marks}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {evalResult.detailedRationale}
              </p>
            </div>

            {/* Teacher Override / Final Score */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="font-bold text-slate-300 block">
                Assigned Final Score (Override):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={activeQuestion.marks}
                  step={0.5}
                  value={assignedScore}
                  onChange={e => setAssignedScore(Number(e.target.value))}
                  className="w-24 rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm text-white font-bold text-center"
                />
                <span className="text-slate-400">out of {activeQuestion.marks} total marks</span>
              </div>
            </div>

            {/* Feedback Notes */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-300 block">
                Teacher Feedback & Guidance:
              </label>
              <textarea
                rows={2}
                value={feedbackNotes}
                onChange={e => setFeedbackNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200"
              />
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleAcceptAiGrade}
                className="w-full py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 hover:bg-indigo-500/30 transition flex items-center justify-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Accept AI Recommendation</span>
              </button>

              <button
                onClick={handleSaveToGradingHistory}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5"
              >
                <Award className="h-3.5 w-3.5" />
                <span>Confirm Grade & Append to ML Training Set</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
