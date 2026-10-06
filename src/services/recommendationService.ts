/**
 * Personalized Remediation & YouTube Recommendation Service
 */

import { RemediationPlan, LearningResource, Question } from '../types';
import { storageService } from './storageService';
import { BKTEngine } from '../ai/bktEngine';

export class RecommendationService {
  /**
   * Generates a targeted remediation plan for a specific student and concept
   */
  static getRemediationPlan(studentId: string, conceptId: string): RemediationPlan {
    const masteryMap = storageService.getMasteryRecords(studentId);
    const conceptMastery = masteryMap[conceptId];
    const pMastery = conceptMastery ? conceptMastery.pMastery : 0.50;
    const status = BKTEngine.getStatus(pMastery);

    const questions = storageService.getQuestions();
    const conceptQuestions = questions.filter(q => q.conceptId === conceptId);
    const conceptName = conceptQuestions[0]?.topic || conceptId.replace(/C\d+_/, '').replace(/_/g, ' ');

    const resources = storageService.getResources();
    const matchedResources = resources.filter(r => r.conceptId === conceptId || r.conceptName === conceptName);

    const youtubeResources = matchedResources.filter(r => r.resourceType === 'youtube');
    const readingResources = matchedResources.filter(r => r.resourceType !== 'youtube');

    // 2-item Micro Review questions (Remember/Understand + Apply)
    const microReviewQuestions: Question[] = [];
    const remQ = conceptQuestions.find(q => q.bloomsLevel === 'Remember' || q.bloomsLevel === 'Understand');
    const appQ = conceptQuestions.find(q => q.bloomsLevel === 'Apply' || q.bloomsLevel === 'Analyze');

    if (remQ) microReviewQuestions.push(remQ);
    if (appQ && appQ.id !== remQ?.id) microReviewQuestions.push(appQ);
    if (microReviewQuestions.length === 0 && conceptQuestions.length > 0) {
      microReviewQuestions.push(conceptQuestions[0]);
    }

    const primaryMisconception = conceptMastery?.recentErrorTypes?.[0] || 'conceptual_misunderstanding';

    // Tailored pedagogical feedback
    let feedback = `Your mastery in ${conceptName} is currently ${Math.round(pMastery * 100)}% (${status}). `;
    if (primaryMisconception === 'conceptual_misunderstanding') {
      feedback += 'Your past responses indicate a core conceptual misunderstanding rather than simple arithmetic. Revisit the visual intuition and definitions below before attempting more tests.';
    } else if (primaryMisconception === 'wrong_formula') {
      feedback += 'You have frequently applied an incorrect formula or sign convention. Review the mathematical derivation and boundary constraints.';
    } else if (primaryMisconception === 'careless_slip') {
      feedback += 'You grasp the main idea well, but minor calculation slips are lowering your test precision. Take extra care verifying step-by-step operations.';
    } else {
      feedback += 'Review the recommended curriculum below to advance your understanding from basic recall to analytical mastery.';
    }

    // Recommended learning sequence
    const recommendedLearningOrder = [
      `1. Conceptual Foundations & Terminology in ${conceptName}`,
      `2. Step-by-Step Worked Example Walkthrough`,
      `3. Visualizing Edge Cases and Invariants`,
      `4. Low-Stakes 2-Question Micro-Review`,
      `5. Adaptive Diagnostic Practice Test`,
    ];

    return {
      studentId,
      conceptId,
      conceptName,
      pMastery,
      status,
      needsRemediation: pMastery < 0.65,
      teacherAlert: pMastery < 0.40,
      primaryMisconception,
      feedback,
      recommendedResources: readingResources.length > 0 ? readingResources : matchedResources,
      youtubeRecommendations: youtubeResources.length > 0 ? youtubeResources : matchedResources,
      microReviewQuestions,
      recommendedLearningOrder,
    };
  }

  /**
   * Retrieves all concepts needing urgent remediation for a student
   */
  static getStudentRemediationNeeds(studentId: string): RemediationPlan[] {
    const questions = storageService.getQuestions();
    const uniqueConcepts = Array.from(new Set(questions.map(q => q.conceptId)));

    const plans = uniqueConcepts.map(cId => this.getRemediationPlan(studentId, cId));
    return plans.filter(p => p.needsRemediation).sort((a, b) => a.pMastery - b.pMastery);
  }
}
