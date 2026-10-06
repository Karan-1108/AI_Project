/**
 * Teacher AI Grading Assistant
 * 
 * Provides automated rubric evaluation, concept coverage detection,
 * missing step analysis, and human-in-the-loop review recommendations
 * for open-ended / descriptive student submissions.
 */

import { Question, StudentAnswer } from '../types';
import { randomForestService } from './randomForestModel';

export interface RubricCriteriaEvaluation {
  criteriaName: string;
  maxScore: number;
  awardedScore: number;
  status: 'met' | 'partially_met' | 'missing';
  feedback: string;
}

export interface AIGradingSuggestion {
  questionId: string;
  suggestedScore: number;
  maxScore: number;
  percentage: number;
  confidence: number;
  detectedConcepts: string[];
  missingConcepts: string[];
  rubricBreakdown: RubricCriteriaEvaluation[];
  detailedRationale: string;
  predictedTeacherAlignmentScore: number;
  isAiGraded: boolean;
  status: 'pending_teacher_review' | 'approved' | 'modified';
}

export class TeacherGradingAssistant {
  /**
   * Generates a comprehensive rubric-based grading suggestion for an answer
   */
  static evaluateSubmission(
    question: Question,
    studentAnswerText: string
  ): AIGradingSuggestion {
    const text = (studentAnswerText || '').trim();
    const textLower = text.toLowerCase();

    // 1. Keyword and concept matching
    const rubricKeywords = question.rubricKeywords || [
      'definition', 'proof', 'complexity', 'example', 'analysis', 'steps', 'edge case'
    ];

    const detectedKeywords = rubricKeywords.filter(kw => textLower.includes(kw.toLowerCase()));
    const missingKeywords = rubricKeywords.filter(kw => !textLower.includes(kw.toLowerCase()));

    const keywordRatio = rubricKeywords.length > 0
      ? detectedKeywords.length / rubricKeywords.length
      : 0.8;

    // 2. Length & presentation metrics
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const hasStructure = text.includes('\n') || text.includes('1.') || text.includes('- ') || text.includes(':');
    const presentationScore = Math.min(1.0, Math.max(0.3, (wordCount > 30 ? 0.6 : 0.4) + (hasStructure ? 0.35 : 0.1)));
    const effortScore = Math.min(1.0, Math.max(0.2, wordCount / 50));

    // 3. Solution Correctness estimation
    let correctnessEstimate = 0.5;
    if (question.questionType === 'mcq' || question.questionType === 'true_false' || question.questionType === 'numerical') {
      const correctStr = String(question.correctAnswer).trim().toLowerCase();
      correctnessEstimate = textLower === correctStr ? 1.0 : 0.0;
    } else {
      // Descriptive / short answer evaluation
      correctnessEstimate = Math.min(1.0, keywordRatio * 0.7 + (wordCount > 25 ? 0.3 : 0.15));
    }

    const explanationDepth = Math.min(1.0, Math.max(0.2, keywordRatio * 0.6 + (wordCount > 40 ? 0.4 : 0.2)));

    // 4. Pass through Random Forest Grading Model
    const rfExplanation = randomForestService.explainPrediction(
      correctnessEstimate,
      explanationDepth,
      presentationScore,
      keywordRatio,
      effortScore,
      question.difficultyScore
    );

    const rawPredictedPercent = rfExplanation.predictedGrade;
    const finalScaledScore = parseFloat(((rawPredictedPercent / 100) * question.marks).toFixed(1));

    // 5. Construct Rubric Breakdown
    const rubricBreakdown: RubricCriteriaEvaluation[] = [
      {
        criteriaName: 'Conceptual Correctness & Core Principles',
        maxScore: parseFloat((question.marks * 0.5).toFixed(1)),
        awardedScore: parseFloat((question.marks * 0.5 * correctnessEstimate).toFixed(1)),
        status: correctnessEstimate >= 0.8 ? 'met' : correctnessEstimate >= 0.4 ? 'partially_met' : 'missing',
        feedback: correctnessEstimate >= 0.8 
          ? 'Accurately captures fundamental theorem/logic.'
          : 'Partially addresses core idea but lacks precision.',
      },
      {
        criteriaName: 'Technical Depth & Keyword Coverage',
        maxScore: parseFloat((question.marks * 0.3).toFixed(1)),
        awardedScore: parseFloat((question.marks * 0.3 * keywordRatio).toFixed(1)),
        status: keywordRatio >= 0.75 ? 'met' : keywordRatio >= 0.4 ? 'partially_met' : 'missing',
        feedback: `Included ${detectedKeywords.length} of ${rubricKeywords.length} key domain terms.`,
      },
      {
        criteriaName: 'Structure, Clarity & Presentation',
        maxScore: parseFloat((question.marks * 0.2).toFixed(1)),
        awardedScore: parseFloat((question.marks * 0.2 * presentationScore).toFixed(1)),
        status: presentationScore >= 0.7 ? 'met' : 'partially_met',
        feedback: hasStructure ? 'Well-organized stepwise response.' : 'Readable but could benefit from bullet points or numbered steps.',
      },
    ];

    return {
      questionId: question.id,
      suggestedScore: Math.min(question.marks, finalScaledScore),
      maxScore: question.marks,
      percentage: Math.round((finalScaledScore / question.marks) * 100),
      confidence: rfExplanation.confidence,
      detectedConcepts: detectedKeywords.length > 0 ? detectedKeywords : [question.topic],
      missingConcepts: missingKeywords,
      rubricBreakdown,
      detailedRationale: `AI Grading Pattern Model calculated ${rawPredictedPercent}% match. ${rfExplanation.interpretation}`,
      predictedTeacherAlignmentScore: rawPredictedPercent,
      isAiGraded: true,
      status: 'pending_teacher_review',
    };
  }
}
