/**
 * AI-Driven Intelligent Exam System - Core Domain Types
 */

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: string;
  teacherId?: string;
  classId?: string;
  createdAt: string;
}

export type BloomsLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';

export type QuestionType = 
  | 'mcq'
  | 'multiple_select'
  | 'true_false'
  | 'numerical'
  | 'short_answer'
  | 'code_question'
  | 'descriptive';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export type ErrorCategory = 
  | 'conceptual_misunderstanding'
  | 'wrong_formula'
  | 'careless_slip'
  | 'terminology_confusion'
  | 'prerequisite_gap'
  | 'incomplete_logic'
  | 'none';

export interface Question {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  conceptId: string;
  questionText: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string | string[]; // string or array of option ids or keywords
  explanation: string;
  marks: number;
  difficultyScore: number; // 0.0 to 1.0
  bloomsLevel: BloomsLevel;
  prerequisites: string[];
  misconceptionMapping?: {
    [distractor: string]: {
      errorType: ErrorCategory;
      explanation: string;
    };
  };
  sampleAnswer?: string;
  rubricKeywords?: string[];
  tags: string[];
  estimatedMinutes: number;
  source: 'system' | 'teacher' | 'ai_generated';
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

export type ExamStatus = 'draft' | 'pending_approval' | 'published' | 'closed';
export type ExamType = 'ai_personalized' | 'practice_test' | 'remediation_test' | 'teacher_formal' | 'adaptive_hybrid';

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  examType: ExamType;
  status: ExamStatus;
  durationMinutes: number;
  totalMarks: number;
  passPercentage: number;
  questionIds: string[];
  targetStudentId?: string; // If personalized for a specific student
  targetClassId?: string;
  difficultyRating: number; // 0.0 to 1.0
  bloomsDistribution: {
    Remember: number;
    Understand: number;
    Apply: number;
    Analyze: number;
    Evaluate: number;
    Create: number;
  };
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  scheduledAt?: string;
}

export interface StudentAnswer {
  questionId: string;
  givenAnswer: string | string[];
  isCorrect?: boolean;
  scoreAwarded?: number;
  maxScore: number;
  timeSpentSeconds: number;
  detectedErrorType?: ErrorCategory;
  aiExplanation?: string;
  teacherFeedback?: string;
  isFlaggedForReview?: boolean;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'graded';
  answers: StudentAnswer[];
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  accuracy: number;
  timeTakenMinutes: number;
  topicBreakdown: {
    [topic: string]: {
      correct: number;
      total: number;
      percentage: number;
      conceptId: string;
    };
  };
  strengths: string[];
  weakTopics: string[];
  aiDiagnostics: string;
  creditsEarned: number;
  isAiGraded: boolean;
  teacherApproved: boolean;
}

export type MasteryStatus = 'Mastered' | 'Strong' | 'Developing' | 'Weak' | 'Critical';

export interface ConceptMastery {
  studentId: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  pMastery: number; // 0.0 to 1.0 (from BKT)
  status: MasteryStatus;
  totalAttempts: number;
  correctAttempts: number;
  lastAttemptAt?: string;
  recentErrorTypes: ErrorCategory[];
  history: {
    timestamp: string;
    pMastery: number;
    wasCorrect: boolean;
  }[];
}

export interface LearningResource {
  id: string;
  conceptId: string;
  conceptName: string;
  title: string;
  resourceType: 'youtube' | 'textbook' | 'worked_example' | 'interactive' | 'notes';
  url: string;
  youtubeVideoId?: string;
  channelName?: string;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  prerequisites: string[];
}

export interface RemediationPlan {
  studentId: string;
  conceptId: string;
  conceptName: string;
  pMastery: number;
  status: MasteryStatus;
  needsRemediation: boolean;
  teacherAlert: boolean;
  primaryMisconception?: ErrorCategory;
  feedback: string;
  recommendedResources: LearningResource[];
  youtubeRecommendations: LearningResource[];
  microReviewQuestions: Question[];
  recommendedLearningOrder: string[];
}

export interface TeacherGradingRecord {
  id: string;
  studentId: string;
  correctness: number; // 0.0 - 1.0
  presentationScore: number; // 0.0 - 1.0
  effortWeight: number; // 0.0 - 1.0
  explanationDepth: number; // 0.0 - 1.0
  keywordDensity: number; // 0.0 - 1.0
  questionDifficulty: number; // 0.0 - 1.0
  teacherGrade: number; // 0 - 100
  questionType: string;
  timestamp: string;
}

export interface RFModelMetrics {
  isTrained: boolean;
  numSamples: number;
  numTrees: number;
  maxDepth: number;
  mae: number;
  rmse: number;
  r2Score: number;
  cvScore: number;
  trainedAt: string;
  featureImportances: {
    correctness: number;
    explanationDepth: number;
    presentationScore: number;
    keywordDensity: number;
    effortWeight: number;
    questionDifficulty: number;
  };
}

export interface RewardCoupon {
  id: string;
  code: string;
  partner: 'Amazon' | 'Flipkart' | 'Swiggy' | 'BookMyShow';
  title: string;
  valueINR: number;
  costCredits: number;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: string;
  expiryDate: string;
  imageUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tests' | 'mastery' | 'streak' | 'improvement';
  creditsReward: number;
  unlockedAt?: string;
  progress: number; // 0 to 100
  maxProgress: number;
  isUnlocked: boolean;
}

export interface StudentRewardProfile {
  studentId: string;
  totalCredits: number;
  availableCredits: number;
  lifetimeEarnedCredits: number;
  currentStreakDays: number;
  lastActiveDate: string;
  achievements: Achievement[];
  redeemedCoupons: RewardCoupon[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  action: string;
  details: string;
  entityId?: string;
}

export interface StudentRiskSummary {
  studentId: string;
  studentName: string;
  riskLevel: 'On Track' | 'Needs Attention' | 'Intervention Recommended';
  averageMastery: number;
  recentTestAverage: number;
  trend: 'improving' | 'steady' | 'declining';
  criticalConcepts: string[];
  frequentMisconceptions: ErrorCategory[];
  unattemptedExamsCount: number;
  reason: string;
}
