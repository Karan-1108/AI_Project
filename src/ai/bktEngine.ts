/**
 * Bayesian Knowledge Tracing (BKT) Engine
 * 
 * Implements the standard Corbett & Anderson (1994) Hidden Markov Model formulation
 * with parameter tuning for slips, guesses, transitions, and priors.
 */

import { ConceptMastery, MasteryStatus, ErrorCategory } from '../types';

export interface BKTParameters {
  pL0: number; // Prior knowledge P(L0)
  pT: number;  // Transition probability P(T) - learning rate
  pG: number;  // Guess probability P(G)
  pS: number;  // Slip probability P(S)
}

export const DEFAULT_BKT_PARAMS: Record<string, BKTParameters> = {
  default: { pL0: 0.35, pT: 0.18, pG: 0.15, pS: 0.10 },
  'C1_Quadratic_Equations': { pL0: 0.40, pT: 0.20, pG: 0.15, pS: 0.08 },
  'C2_Linear_Algebra': { pL0: 0.30, pT: 0.15, pG: 0.12, pS: 0.10 },
  'C3_Calculus_Basics': { pL0: 0.25, pT: 0.14, pG: 0.10, pS: 0.12 },
  'C4_Binary_Search_Trees': { pL0: 0.35, pT: 0.22, pG: 0.15, pS: 0.09 },
  'C5_Graph_Algorithms': { pL0: 0.28, pT: 0.16, pG: 0.12, pS: 0.11 },
  'C6_Dynamic_Programming': { pL0: 0.20, pT: 0.12, pG: 0.08, pS: 0.14 },
  'C7_Sorting_Searching': { pL0: 0.45, pT: 0.25, pG: 0.18, pS: 0.08 },
  'C8_SQL_Relational_Queries': { pL0: 0.40, pT: 0.22, pG: 0.15, pS: 0.08 },
};

export class BKTEngine {
  static getStatus(pMastery: number): MasteryStatus {
    if (pMastery >= 0.90) return 'Mastered';
    if (pMastery >= 0.75) return 'Strong';
    if (pMastery >= 0.60) return 'Developing';
    if (pMastery >= 0.40) return 'Weak';
    return 'Critical';
  }

  static getStatusColor(status: MasteryStatus): { bg: string; text: string; border: string } {
    switch (status) {
      case 'Mastered':
        return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'Strong':
        return { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' };
      case 'Developing':
        return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'Weak':
        return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' };
      case 'Critical':
        return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' };
    }
  }

  /**
   * Update belief state after an observation (isCorrect)
   * @param currentPL Prior belief P(L_t)
   * @param isCorrect Whether the answer was correct (1) or incorrect (0)
   * @param conceptId Concept identifier to look up custom parameters
   * @returns Updated posterior P(L_{t+1})
   */
  static updateMastery(
    currentPL: number,
    isCorrect: boolean,
    conceptId: string = 'default'
  ): {
    pPosteriorObs: number;
    nextPMastery: number;
    improvement: number;
  } {
    const params = DEFAULT_BKT_PARAMS[conceptId] || DEFAULT_BKT_PARAMS.default;
    const { pT, pG, pS } = params;

    const pL = Math.max(0.01, Math.min(0.99, currentPL));

    let pPosteriorObs: number;

    if (isCorrect) {
      // P(L_t | Correct) = (P(L) * (1 - pS)) / (P(L) * (1 - pS) + (1 - P(L)) * pG)
      const numerator = pL * (1 - pS);
      const denominator = pL * (1 - pS) + (1 - pL) * pG;
      pPosteriorObs = numerator / (denominator || 1);
    } else {
      // P(L_t | Incorrect) = (P(L) * pS) / (P(L) * pS + (1 - P(L)) * (1 - pG))
      const numerator = pL * pS;
      const denominator = pL * pS + (1 - pL) * (1 - pG);
      pPosteriorObs = numerator / (denominator || 1);
    }

    // Transit step: P(L_{t+1}) = P(L_t | obs) + (1 - P(L_t | obs)) * P(T)
    let nextPMastery = pPosteriorObs + (1 - pPosteriorObs) * pT;
    nextPMastery = Math.max(0.05, Math.min(0.99, nextPMastery));
    nextPMastery = Math.round(nextPMastery * 100) / 100;

    return {
      pPosteriorObs: Math.round(pPosteriorObs * 100) / 100,
      nextPMastery,
      improvement: Math.round((nextPMastery - currentPL) * 100) / 100,
    };
  }

  /**
   * Initializes or updates a ConceptMastery object with a new response
   */
  static processResponse(
    existingMastery: ConceptMastery | undefined,
    studentId: string,
    conceptId: string,
    conceptName: string,
    subject: string,
    isCorrect: boolean,
    errorType: ErrorCategory = 'none'
  ): ConceptMastery {
    const params = DEFAULT_BKT_PARAMS[conceptId] || DEFAULT_BKT_PARAMS.default;
    const initialPL = existingMastery ? existingMastery.pMastery : params.pL0;

    const { nextPMastery } = this.updateMastery(initialPL, isCorrect, conceptId);
    const status = this.getStatus(nextPMastery);

    const history = existingMastery?.history ? [...existingMastery.history] : [];
    history.push({
      timestamp: new Date().toISOString(),
      pMastery: nextPMastery,
      wasCorrect: isCorrect,
    });

    const recentErrors = existingMastery?.recentErrorTypes ? [...existingMastery.recentErrorTypes] : [];
    if (!isCorrect && errorType !== 'none') {
      recentErrors.push(errorType);
      if (recentErrors.length > 5) recentErrors.shift();
    }

    return {
      studentId,
      conceptId,
      conceptName,
      subject,
      pMastery: nextPMastery,
      status,
      totalAttempts: (existingMastery?.totalAttempts || 0) + 1,
      correctAttempts: (existingMastery?.correctAttempts || 0) + (isCorrect ? 1 : 0),
      lastAttemptAt: new Date().toISOString(),
      recentErrorTypes: recentErrors,
      history,
    };
  }
}
