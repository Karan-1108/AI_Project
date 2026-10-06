/**
 * AI Misconception Detection & Diagnostic Classifier
 * 
 * Analyzes incorrect student responses, identifies specific cognitive fallacies,
 * incorrect formula applications, careless slips, or prerequisite gaps,
 * and formats actionable pedagogical feedback.
 */

import { Question, ErrorCategory } from '../types';

export interface MisconceptionDiagnosis {
  errorType: ErrorCategory;
  severity: 'High' | 'Medium' | 'Low';
  conceptName: string;
  problemSummary: string;
  detailedAnalysis: string;
  targetedRemedy: string;
  recommendedResourceAction: string;
}

export class MisconceptionClassifier {
  /**
   * Diagnoses an incorrect answer for a given question
   */
  static diagnose(
    question: Question,
    givenAnswer: string | string[]
  ): MisconceptionDiagnosis {
    const givenStr = Array.isArray(givenAnswer)
      ? givenAnswer.join(', ').trim().toLowerCase()
      : String(givenAnswer).trim().toLowerCase();

    // 1. Check direct distractor mapping if question defines misconceptionMapping
    if (question.misconceptionMapping && question.misconceptionMapping[givenStr]) {
      const mapped = question.misconceptionMapping[givenStr];
      return {
        errorType: mapped.errorType,
        severity: mapped.errorType === 'conceptual_misunderstanding' ? 'High' : 'Medium',
        conceptName: question.topic,
        problemSummary: `Selected distractor pattern: ${mapped.errorType.replace('_', ' ')}`,
        detailedAnalysis: mapped.explanation,
        targetedRemedy: `Review core concept "${question.topic}" and inspect why "${givenStr}" fails edge constraints.`,
        recommendedResourceAction: `Study remedial notes & video on ${question.topic}`,
      };
    }

    // 2. Keyword & Heuristic Error Pattern Analysis
    const textLower = question.questionText.toLowerCase();

    // Python / Programming heuristics
    if (textLower.includes('tuple') && (givenStr.includes('append') || givenStr.includes('mutate') || givenStr.includes('change'))) {
      return {
        errorType: 'conceptual_misunderstanding',
        severity: 'High',
        conceptName: question.topic || 'Python Data Structures',
        problemSummary: 'Misunderstanding immutability of Tuples vs Lists',
        detailedAnalysis: 'Tuples are immutable sequence types in Python and do not have an append() or in-place modification method.',
        targetedRemedy: 'Revise Python object mutability vs immutability and sequence data structures.',
        recommendedResourceAction: 'Watch lesson on Immutable Python Sequences',
      };
    }

    // Binary Search Trees heuristics
    if (textLower.includes('bst') || textLower.includes('binary search tree')) {
      if (givenStr.includes('o(n)') && textLower.includes('balanced')) {
        return {
          errorType: 'wrong_formula',
          severity: 'Medium',
          conceptName: 'Binary Search Trees',
          problemSummary: 'Confusing worst-case skewed tree with balanced tree time complexity',
          detailedAnalysis: 'In a balanced BST (like AVL or Red-Black Tree), search is O(log n), not O(n). O(n) only occurs in completely degenerate/linear linked-list like BSTs.',
          targetedRemedy: 'Review Tree height proofs and balanced vs unbalanced complexity analysis.',
          recommendedResourceAction: 'Inspect BST height visualization',
        };
      }
    }

    // Quadratic Equations heuristics
    if (textLower.includes('discriminant') || textLower.includes('quadratic')) {
      if (givenStr.includes('b^2+4ac') || givenStr.includes('b^2+4*a*c')) {
        return {
          errorType: 'wrong_formula',
          severity: 'High',
          conceptName: 'Quadratic Equations',
          problemSummary: 'Sign error in discriminant formula (b² - 4ac)',
          detailedAnalysis: 'The discriminant formula is Δ = b² - 4ac. Adding 4ac instead of subtracting causes incorrect root type determinations.',
          targetedRemedy: 'Re-derive the quadratic formula by completing the square.',
          recommendedResourceAction: 'Review algebraic derivation of discriminant',
        };
      }
      if (givenStr.includes('real') && textLower.includes('negative discriminant')) {
        return {
          errorType: 'conceptual_misunderstanding',
          severity: 'High',
          conceptName: 'Quadratic Equations',
          problemSummary: 'Misinterpreting negative square roots in the real number plane',
          detailedAnalysis: 'When Δ < 0, √Δ requires imaginary unit i (√-1). Roots are complex conjugates, not real.',
          targetedRemedy: 'Revise geometric meaning of parabolas that do not intersect the x-axis.',
          recommendedResourceAction: 'Parabola vertex & discriminant visualizer',
        };
      }
    }

    // Graph Algorithms heuristics
    if (textLower.includes('bfs') || textLower.includes('dfs') || textLower.includes('dijkstra')) {
      if (givenStr.includes('dfs') && textLower.includes('shortest path in unweighted graph')) {
        return {
          errorType: 'conceptual_misunderstanding',
          severity: 'High',
          conceptName: 'Graph Algorithms',
          problemSummary: 'Confusing BFS layer-by-layer optimality with DFS depth traversal',
          detailedAnalysis: 'BFS visits nodes in order of edge distance from source, guaranteeing shortest path in unweighted graphs. DFS explores deeply first and may find a much longer path.',
          targetedRemedy: 'Compare traversal queues (FIFO for BFS) vs recursion/stacks (LIFO for DFS).',
          recommendedResourceAction: 'Watch side-by-side BFS vs DFS traversal animation',
        };
      }
      if (givenStr.includes('dijkstra') && textLower.includes('negative edge')) {
        return {
          errorType: 'conceptual_misunderstanding',
          severity: 'High',
          conceptName: 'Graph Algorithms',
          problemSummary: 'Applying Dijkstra to graphs with negative edge weights',
          detailedAnalysis: 'Dijkstra assumes that adding an edge to a path cannot decrease its total cost (greedy property). For negative weights, Bellman-Ford or SPFA must be used.',
          targetedRemedy: 'Review the greedy choice property and counterexamples with negative cycles.',
          recommendedResourceAction: 'Study shortest path algorithm selection criteria',
        };
      }
    }

    // Default heuristic based on answer length & differences
    if (givenStr.length === 0) {
      return {
        errorType: 'incomplete_logic',
        severity: 'Medium',
        conceptName: question.topic,
        problemSummary: 'Question was left unattempted or answer was blank',
        detailedAnalysis: 'No candidate reasoning was supplied. This often signals low student confidence or time expiration.',
        targetedRemedy: 'Break problem into smaller sub-questions and attempt foundational step 1 first.',
        recommendedResourceAction: 'Review beginner walkthrough on this topic',
      };
    }

    return {
      errorType: 'careless_slip',
      severity: 'Medium',
      conceptName: question.topic,
      problemSummary: 'Calculation or syntax mismatch against standard answer key',
      detailedAnalysis: `The provided response ("${givenStr.slice(0, 40)}${givenStr.length > 40 ? '...' : ''}") differed from the expected model solution. Check for sign reversals, operator priority, or index bounds.`,
      targetedRemedy: 'Verify intermediate computation steps and check dimensional/type consistency.',
      recommendedResourceAction: 'Check worked example solution for this problem',
    };
  }

  static getErrorTypeLabel(errorType: ErrorCategory): string {
    switch (errorType) {
      case 'conceptual_misunderstanding':
        return 'Conceptual Misunderstanding';
      case 'wrong_formula':
        return 'Wrong Formula / Rule';
      case 'incomplete_logic':
        return 'Incomplete Logical Steps';
      case 'careless_slip':
        return 'Careless / Arithmetic Slip';
      case 'terminology_confusion':
        return 'Terminology Confusion';
      case 'prerequisite_gap':
        return 'Prerequisite Gap';
      case 'none':
        return 'Correct / Valid Solution';
    }
  }
}
