/**
 * Persistent Storage & Database Layer
 * 
 * Manages normalized entities, localStorage persistence, dataset import/export,
 * and initializes seed records with Random Forest model training.
 */

import {
  User,
  Question,
  LearningResource,
  TeacherGradingRecord,
  RewardCoupon,
  Achievement,
  Exam,
  ExamAttempt,
  ConceptMastery,
  AuditLog,
  StudentRewardProfile,
} from '../types';

import {
  SEED_USERS,
  SEED_QUESTIONS,
  SEED_RESOURCES,
  SEED_COUPONS,
  SEED_ACHIEVEMENTS,
  SEED_EXAMS,
  generateSeedTeacherGradingRecords,
} from '../data/seedData';

import { randomForestService } from '../ai/randomForestModel';
import { BKTEngine } from '../ai/bktEngine';

export interface AppState {
  users: User[];
  questions: Question[];
  resources: LearningResource[];
  teacherGradingRecords: TeacherGradingRecord[];
  coupons: RewardCoupon[];
  achievements: Achievement[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  masteryRecords: Record<string, Record<string, ConceptMastery>>; // [studentId][conceptId] => ConceptMastery
  rewardProfiles: Record<string, StudentRewardProfile>; // [studentId] => StudentRewardProfile
  auditLogs: AuditLog[];
  lastModelTrainingTime?: string;
}

const STORAGE_KEY = 'ai_intelligent_exam_system_v2_state';

class StorageService {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
    this.ensureInitialized();
  }

  private loadState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }

    return this.getInitialState();
  }

  private getInitialState(): AppState {
    const records = generateSeedTeacherGradingRecords();
    return {
      users: [...SEED_USERS],
      questions: [...SEED_QUESTIONS],
      resources: [...SEED_RESOURCES],
      teacherGradingRecords: records,
      coupons: [...SEED_COUPONS],
      achievements: [...SEED_ACHIEVEMENTS],
      exams: [...SEED_EXAMS],
      examAttempts: [],
      masteryRecords: {},
      rewardProfiles: {},
      auditLogs: [
        {
          id: 'log_init',
          timestamp: new Date().toISOString(),
          userId: 'system',
          userRole: 'admin',
          action: 'SYSTEM_INITIALIZED',
          details: 'Seeded initial question bank, teacher grading dataset, and demo users.',
        },
      ],
    };
  }

  private ensureInitialized(): void {
    // 1. Ensure user roster synchronization (Ms Annapurna as teacher)
    if (this.state.users) {
      this.state.users = this.state.users.map(u => {
        if (u.role === 'teacher' || u.id === 'usr_teacher_1') {
          return {
            ...u,
            displayName: 'Ms Annapurna',
            username: 'teacher',
            email: 'annapurna@university.edu',
            teacherId: 'TCH_ANNAPURNA',
          };
        }
        return u;
      });
      // Ensure seed users exist if empty
      if (this.state.users.length === 0) {
        this.state.users = [...SEED_USERS];
      }
    }

    // 2. Train Random Forest model on seed grading records
    if (this.state.teacherGradingRecords.length >= 5) {
      randomForestService.train(this.state.teacherGradingRecords);
      this.state.lastModelTrainingTime = new Date().toISOString();
    }

    // 2. Initialize student mastery maps with realistic baseline data if empty
    if (Object.keys(this.state.masteryRecords).length === 0) {
      const studentProfiles = [
        { id: '24BDS0162', credits: 480, streak: 5, qBase: 0.85, bstBase: 0.72, graphBase: 0.78, dpBase: 0.65, laBase: 0.88, calcBase: 0.80 },
        { id: '24BCE2930', credits: 340, streak: 3, qBase: 0.60, bstBase: 0.45, graphBase: 0.38, dpBase: 0.70, laBase: 0.65, calcBase: 0.55 },
        { id: '24BCI0287', credits: 290, streak: 4, qBase: 0.75, bstBase: 0.80, graphBase: 0.62, dpBase: 0.40, laBase: 0.58, calcBase: 0.72 },
        // Fallback backward compatibility IDs
        { id: '101', credits: 480, streak: 5, qBase: 0.85, bstBase: 0.72, graphBase: 0.78, dpBase: 0.65, laBase: 0.88, calcBase: 0.80 },
        { id: '102', credits: 290, streak: 4, qBase: 0.75, bstBase: 0.80, graphBase: 0.62, dpBase: 0.40, laBase: 0.58, calcBase: 0.72 },
        { id: '103', credits: 340, streak: 3, qBase: 0.60, bstBase: 0.45, graphBase: 0.38, dpBase: 0.70, laBase: 0.65, calcBase: 0.55 },
      ];

      studentProfiles.forEach(sp => {
        const sid = sp.id;
        this.state.masteryRecords[sid] = {};
        this.state.rewardProfiles[sid] = {
          studentId: sid,
          totalCredits: sp.credits,
          availableCredits: sp.credits,
          lifetimeEarnedCredits: sp.credits + 150,
          currentStreakDays: sp.streak,
          lastActiveDate: new Date().toISOString(),
          achievements: [...SEED_ACHIEVEMENTS],
          redeemedCoupons: [],
        };

        // Seed diverse initial mastery probabilities
        const concepts = [
          { id: 'C1_Quadratic_Equations', name: 'Quadratic Equations', subject: 'Mathematics', base: sp.qBase },
          { id: 'C4_Binary_Search_Trees', name: 'Binary Search Trees', subject: 'Computer Science', base: sp.bstBase },
          { id: 'C5_Graph_Algorithms', name: 'Graph Algorithms', subject: 'Computer Science', base: sp.graphBase },
          { id: 'C6_Dynamic_Programming', name: 'Dynamic Programming', subject: 'Computer Science', base: sp.dpBase },
          { id: 'C2_Linear_Algebra', name: 'Linear Algebra', subject: 'Mathematics', base: sp.laBase },
          { id: 'C3_Calculus_Basics', name: 'Calculus Basics', subject: 'Mathematics', base: sp.calcBase },
        ];

        concepts.forEach(c => {
          this.state.masteryRecords[sid][c.id] = {
            studentId: sid,
            conceptId: c.id,
            conceptName: c.name,
            subject: c.subject,
            pMastery: c.base,
            status: BKTEngine.getStatus(c.base),
            totalAttempts: 5,
            correctAttempts: Math.round(c.base * 5),
            lastAttemptAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
            recentErrorTypes: c.base < 0.6 ? ['conceptual_misunderstanding', 'wrong_formula'] : [],
            history: [
              { timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), pMastery: Math.max(0.2, c.base - 0.15), wasCorrect: false },
              { timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), pMastery: Math.max(0.25, c.base - 0.08), wasCorrect: true },
              { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), pMastery: c.base, wasCorrect: c.base >= 0.5 },
            ],
          };
        });
      });
    }

    this.saveState();
  }

  saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  // Getters
  getState(): AppState {
    return this.state;
  }

  getUsers(): User[] {
    return this.state.users;
  }

  getQuestions(): Question[] {
    return this.state.questions;
  }

  getResources(): LearningResource[] {
    return this.state.resources;
  }

  getTeacherGradingRecords(): TeacherGradingRecord[] {
    return this.state.teacherGradingRecords;
  }

  getExams(): Exam[] {
    return this.state.exams;
  }

  getExamAttempts(): ExamAttempt[] {
    return this.state.examAttempts;
  }

  getMasteryRecords(studentId: string): Record<string, ConceptMastery> {
    return this.state.masteryRecords[studentId] || {};
  }

  getAllMasteryRecords(): Record<string, Record<string, ConceptMastery>> {
    return this.state.masteryRecords;
  }

  getRewardProfile(studentId: string): StudentRewardProfile {
    if (!this.state.rewardProfiles[studentId]) {
      this.state.rewardProfiles[studentId] = {
        studentId,
        totalCredits: 100,
        availableCredits: 100,
        lifetimeEarnedCredits: 100,
        currentStreakDays: 1,
        lastActiveDate: new Date().toISOString(),
        achievements: [...SEED_ACHIEVEMENTS],
        redeemedCoupons: [],
      };
      this.saveState();
    }
    return this.state.rewardProfiles[studentId];
  }

  getCoupons(): RewardCoupon[] {
    return this.state.coupons;
  }

  getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  // Mutations
  addAuditLog(userId: string, userRole: User['role'], action: string, details: string, entityId?: string): void {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action,
      details,
      entityId,
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs.pop();
    }
    this.saveState();
  }

  addQuestion(question: Question): void {
    this.state.questions.unshift(question);
    this.saveState();
  }

  updateQuestion(question: Question): void {
    const idx = this.state.questions.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      this.state.questions[idx] = question;
      this.saveState();
    }
  }

  deleteQuestion(questionId: string): void {
    this.state.questions = this.state.questions.filter(q => q.id !== questionId);
    this.saveState();
  }

  addExam(exam: Exam): void {
    this.state.exams.unshift(exam);
    this.saveState();
  }

  updateExam(exam: Exam): void {
    const idx = this.state.exams.findIndex(e => e.id === exam.id);
    if (idx >= 0) {
      this.state.exams[idx] = exam;
      this.saveState();
    }
  }

  addExamAttempt(attempt: ExamAttempt): void {
    this.state.examAttempts.unshift(attempt);
    this.saveState();
  }

  updateStudentMastery(mastery: ConceptMastery): void {
    if (!this.state.masteryRecords[mastery.studentId]) {
      this.state.masteryRecords[mastery.studentId] = {};
    }
    this.state.masteryRecords[mastery.studentId][mastery.conceptId] = mastery;
    this.saveState();
  }

  updateRewardProfile(profile: StudentRewardProfile): void {
    this.state.rewardProfiles[profile.studentId] = profile;
    this.saveState();
  }

  addGradingRecords(records: TeacherGradingRecord[]): void {
    this.state.teacherGradingRecords.push(...records);
    randomForestService.train(this.state.teacherGradingRecords);
    this.state.lastModelTrainingTime = new Date().toISOString();
    this.saveState();
  }

  retrainGradingModel(): void {
    randomForestService.train(this.state.teacherGradingRecords);
    this.state.lastModelTrainingTime = new Date().toISOString();
    this.saveState();
  }

  resetToDefaultData(): void {
    this.state = this.getInitialState();
    this.ensureInitialized();
    this.saveState();
  }
}

export const storageService = new StorageService();
