export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnswerRegion {
  page: number;
  bbox: BoundingBox;
}

export interface Question {
  id: string;
  number: string;
  text: string;
  page: number;
  bbox?: BoundingBox;
  type?: string;
  marks?: number;
  parentQuestion?: string;
}

export interface Answer {
  id: string;
  text: string;
  questionNumber?: string;
  page?: number;
  bbox?: BoundingBox;
  confidence?: number;
  regions?: AnswerRegion[];
}

export interface Grading {
  score?: number;
  maxScore?: number;
  evaluation: 'correct' | 'partially_correct' | 'incorrect' | 'cannot_evaluate';
  feedback?: string;
  missingConcepts?: string[];
}

export interface Mapping {
  questionId: string;
  questionNumber: string;
  answerId?: string;
  status: 'answered' | 'unanswered' | 'unmatched' | 'uncertain';
  confidence: number;
  regions?: AnswerRegion[];
  grading?: Grading;
  manualCorrection?: boolean;
}

export interface Assessment {
  id: string;
  questions: Question[];
  answers: Answer[];
  mappings: Mapping[];
  unmatchedAnswers: Answer[];
  summary: {
    totalQuestions: number;
    answered: number;
    unanswered: number;
    needsReview: number;
    totalScore?: number;
    maxScore?: number;
  };
  createdAt: string;
}

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  progress?: number;
}

export interface ExtractionResult {
  questions: Question[];
  answers: Answer[];
}

export interface ValidationError {
  field: string;
  message: string;
}
