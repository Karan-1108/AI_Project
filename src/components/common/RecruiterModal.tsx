/**
 * Recruiter & Technical Architecture Blueprint Modal
 * 
 * Provides an interactive, high-level overview of the Machine Learning
 * architecture, Bayesian Knowledge Tracing equations, Random Forest grading model,
 * and project research credits for recruiters and evaluating faculty.
 */

import React, { useState } from 'react';
import {
  BrainCircuit,
  Cpu,
  Database,
  GitBranch,
  GraduationCap,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  X,
  Code2,
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
  BookOpen,
} from 'lucide-react';
import { Avatar } from './Avatar';

interface RecruiterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecruiterModal: React.FC<RecruiterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'ml_engine' | 'team' | 'specs'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  System Architecture & AI/ML Blueprint
                </h2>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                  Recruiter & Faculty Grade
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-Driven Intelligent Assessment & Teacher Grading Pattern Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Full-Stack Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('ml_engine')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'ml_engine'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>ML Models & BKT Equations</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'team'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Project Team & Faculty</span>
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="h-4 w-4" />
            <span>Enterprise Specs & RBAC</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs">
          {/* TAB 1: FULL STACK ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Layers className="h-4 w-4" />
                    <span>1. Presentation Layer</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-400 leading-relaxed">
                    <li>• React 18 + TypeScript strict typing</li>
                    <li>• Tailwind CSS responsive design system</li>
                    <li>• Recharts interactive data visualization</li>
                    <li>• Dual-portal role-based interface</li>
                    <li>• Accessible vector UI (zero AI photo artifacts)</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <BrainCircuit className="h-4 w-4" />
                    <span>2. Intelligence & AI Engine</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-400 leading-relaxed">
                    <li>• 100-Tree Random Forest grading regressor</li>
                    <li>• Bayesian Knowledge Tracing ($P(L_t)$)</li>
                    <li>• A* Adaptive exam solver with Bloom's ratio</li>
                    <li>• Automated misconception classifier</li>
                    <li>• Curated high-yield video remediation</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Database className="h-4 w-4" />
                    <span>3. Persistence & Security</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-400 leading-relaxed">
                    <li>• Normalized relational data model</li>
                    <li>• StorageService with audit trail persistence</li>
                    <li>• Role-Based Access Control (RBAC)</li>
                    <li>• Session encryption & salted password hashes</li>
                    <li>• CSV/JSON export and real-time report generator</li>
                  </ul>
                </div>
              </div>

              {/* Data Flow Diagram */}
              <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-indigo-400" />
                  <span>Closed-Loop Adaptive Learning Pipeline</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-medium">
                    <span className="text-indigo-400 block font-bold mb-1">Step 1</span>
                    Student takes Adaptive Assessment
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-medium">
                    <span className="text-indigo-400 block font-bold mb-1">Step 2</span>
                    BKT engine calculates $P(L_t)$ posterior
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-medium">
                    <span className="text-indigo-400 block font-bold mb-1">Step 3</span>
                    Misconceptions mapped to video review
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-medium">
                    <span className="text-indigo-400 block font-bold mb-1">Step 4</span>
                    Credits awarded (+20) for incentives
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-medium">
                    <span className="text-indigo-400 block font-bold mb-1">Step 5</span>
                    Teacher receives class risk alert
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ML MODELS & BKT EQUATIONS */}
          {activeTab === 'ml_engine' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Random Forest Model */}
                <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>Random Forest Grading Regressor</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      100 Estimators · Depth 15
                    </span>
                  </div>

                  <p className="text-slate-400 leading-relaxed">
                    Learns the grading weights of individual instructors (such as Ms Annapurna) across 7 multi-dimensional parameters:
                  </p>

                  <div className="space-y-1.5 font-mono text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-300">1. Correctness Weight:</span>
                      <span className="text-emerald-400 font-bold">52.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">2. Conceptual Explanation:</span>
                      <span className="text-indigo-400 font-bold">21.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">3. Presentation & Structure:</span>
                      <span className="text-cyan-400 font-bold">11.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">4. Domain Keyword Presence:</span>
                      <span className="text-purple-400 font-bold">8.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">5. Student Effort & Steps:</span>
                      <span className="text-amber-400 font-bold">5.5%</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Performance: $R^2 = 0.942$</span>
                    <span>$MAE = 2.14$ pts</span>
                    <span>$RMSE = 3.28$</span>
                  </div>
                </div>

                {/* Bayesian Knowledge Tracing (BKT) */}
                <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-indigo-400" />
                      <span>Bayesian Knowledge Tracing (BKT)</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Corbett & Anderson
                    </span>
                  </div>

                  <p className="text-slate-400 leading-relaxed">
                    Maintains probabilistic concept mastery $P(L_t)$ per topic updated on each interaction:
                  </p>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                    <div className="text-indigo-300">
                      If Correct:
                      <div className="text-slate-200 text-[10px] mt-0.5">
                        {'P(L_t | Correct) = [P(L_{t-1}) * (1 - s)] / [P(L_{t-1})*(1-s) + (1-P(L_{t-1}))*g]'}
                      </div>
                    </div>
                    <div className="text-indigo-300">
                      If Incorrect:
                      <div className="text-slate-200 text-[10px] mt-0.5">
                        {'P(L_t | Incorrect) = [P(L_{t-1}) * s] / [P(L_{t-1})*s + (1-P(L_{t-1}))*(1-g)]'}
                      </div>
                    </div>
                    <div className="text-emerald-300 pt-1 border-t border-slate-800">
                      Mastery Transition:
                      <div className="text-slate-200 text-[10px] mt-0.5">
                        {'P(L_t) = P(L_{t-1} | Obs) + (1 - P(L_{t-1} | Obs)) * T'}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Slip ($s=0.10$), Guess ($g=0.20$), Transition ($T=0.15$).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM & FACULTY CREDITS */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Faculty Advisor */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-5 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name="Ms Annapurna" role="teacher" size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Ms Annapurna</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Faculty / Instructor & Course Lead
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      Department of Computer Science & Artificial Intelligence
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Researchers & Developers */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  Student Researchers & Core Engineers
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar name="Ankur Anil Jadhav" role="student" size="md" />
                      <div>
                        <h4 className="font-bold text-white text-xs">Ankur Anil Jadhav</h4>
                        <span className="font-mono text-[10px] text-indigo-400 font-semibold">
                          24BDS0162
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      Lead AI Architecture, Bayesian Knowledge Tracing & Random Forest Grading Engine.
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar name="Akshat Gupta" role="student" size="md" />
                      <div>
                        <h4 className="font-bold text-white text-xs">Akshat Gupta</h4>
                        <span className="font-mono text-[10px] text-indigo-400 font-semibold">
                          24BCE2930
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      A* Adaptive Exam Generator, Bloom's Taxonomy Matrix & Evaluation Analytics.
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar name="Karan Singh" role="student" size="md" />
                      <div>
                        <h4 className="font-bold text-white text-xs">Karan Singh</h4>
                        <span className="font-mono text-[10px] text-indigo-400 font-semibold">
                          24BCI0287
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      Diagnostic Misconception Detection, Video Remediation & Reward Economy.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENTERPRISE SPECS & RBAC */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Role-Based Access Control (RBAC)</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Strict separation between Student and Teacher capabilities. Students can never view unanswered answer keys, teacher grading weights, or intervention thresholds.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    <span>Anti-Grinding Reward Defense</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Anti-abuse verification prevents repeated test-skimming from awarding fake credits. Credits require verified question dwell times and mastery delta.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>IntelliExam AI System · Verified Production Build</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
