import { Assessment, Mapping, ProcessingStep, Grading } from '@/types';
import { extractQuestions, extractAnswers, mapAnswersToQuestions, gradeAnswer } from '@/lib/ai/gemini';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export class AssessmentService {
  private assessment: Assessment | null = null;
  private steps: Map<string, ProcessingStep> = new Map();

  constructor() {
    this.initializeSteps();
  }

  private initializeSteps(): void {
    this.steps.set('upload', {
      id: 'upload',
      name: 'Uploading documents',
      status: 'pending',
    });
    this.steps.set('read-question', {
      id: 'read-question',
      name: 'Reading question paper',
      status: 'pending',
    });
    this.steps.set('read-answer', {
      id: 'read-answer',
      name: 'Reading handwritten answers',
      status: 'pending',
    });
    this.steps.set('mapping', {
      id: 'mapping',
      name: 'Mapping answers to questions',
      status: 'pending',
    });
    this.steps.set('grading', {
      id: 'grading',
      name: 'Preparing assessment',
      status: 'pending',
    });
  }

  setStepStatus(stepId: string, status: 'pending' | 'processing' | 'completed' | 'failed', error?: string): void {
    const step = this.steps.get(stepId);
    if (step) {
      step.status = status;
      if (error) step.error = error;
      this.steps.set(stepId, step);
    }
  }

  getSteps(): ProcessingStep[] {
    return Array.from(this.steps.values());
  }

  async createAssessment(
    questionImages: string[],
    answerImages: string[]
  ): Promise<Assessment> {
    const assessmentId = generateId();

    try {
      // Extract questions
      this.setStepStatus('read-question', 'processing');
      const questions = await extractQuestions(questionImages);
      this.setStepStatus('read-question', 'completed');

      // Extract answers
      this.setStepStatus('read-answer', 'processing');
      const answers = await extractAnswers(answerImages);
      this.setStepStatus('read-answer', 'completed');

      // Map answers to questions
      this.setStepStatus('mapping', 'processing');
      const mappingResult = await mapAnswersToQuestions(questions, answers);
      this.setStepStatus('mapping', 'completed');

      // Grade answers
      this.setStepStatus('grading', 'processing');
      const mappings: Mapping[] = [];
      
      for (const mapping of mappingResult.mappings) {
        const question = questions.find(q => q.id === mapping.questionId);
        const answer = answers.find(a => a.id === mapping.answerId);

        let grading: Grading | undefined;
        if (question && answer && mapping.answerId) {
          try {
            grading = await gradeAnswer(question, answer, question.marks);
          } catch (error) {
            console.error('Error grading answer:', error);
            grading = {
              evaluation: 'cannot_evaluate',
              feedback: 'Could not evaluate this answer',
            };
          }
        }

        mappings.push({
          ...mapping,
          grading,
        });
      }

      this.setStepStatus('grading', 'completed');

      // Calculate summary
      const answered = mappings.filter(m => m.status === 'answered').length;
      const unanswered = mappings.filter(m => m.status === 'unanswered').length;
      const needsReview = mappings.filter(m => m.confidence < 0.85 && m.status === 'answered').length;

      let totalScore = 0;
      let maxScore = 0;
      for (const mapping of mappings) {
        if (mapping.grading?.score !== undefined) {
          totalScore += mapping.grading.score;
        }
        if (mapping.grading?.maxScore !== undefined) {
          maxScore += mapping.grading.maxScore;
        }
      }

      this.assessment = {
        id: assessmentId,
        questions,
        answers,
        mappings,
        unmatchedAnswers: mappingResult.unmatchedAnswers.map((ua, idx) => ({
          id: `unmatched-${idx}`,
          text: `Unable to identify question for answer ${ua.questionNumber || 'unknown'}`,
          confidence: ua.confidence,
        })),
        summary: {
          totalQuestions: questions.length,
          answered,
          unanswered,
          needsReview,
          totalScore: maxScore > 0 ? totalScore : undefined,
          maxScore: maxScore > 0 ? maxScore : undefined,
        },
        createdAt: new Date().toISOString(),
      };

      return this.assessment;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }

  getAssessment(): Assessment | null {
    return this.assessment;
  }

  updateMapping(mappingId: number, questionId: string): void {
    if (!this.assessment) return;

    const question = this.assessment.questions.find(q => q.id === questionId);
    if (!question) return;

    const oldMapping = this.assessment.mappings[mappingId];
    this.assessment.mappings[mappingId] = {
      ...oldMapping,
      questionId,
      questionNumber: question.number,
      status: 'answered',
      manualCorrection: true,
      confidence: 1.0,
    };
  }

  getFilteredMappings(filter: 'all' | 'answered' | 'unanswered' | 'needs_review' | 'unmatched'): Mapping[] {
    if (!this.assessment) return [];

    switch (filter) {
      case 'answered':
        return this.assessment.mappings.filter(m => m.status === 'answered');
      case 'unanswered':
        return this.assessment.mappings.filter(m => m.status === 'unanswered');
      case 'needs_review':
        return this.assessment.mappings.filter(m => m.confidence < 0.85 && m.status !== 'unanswered');
      case 'unmatched':
        return this.assessment.mappings.filter(m => m.status === 'unmatched');
      case 'all':
      default:
        return this.assessment.mappings;
    }
  }
}

let assessmentService: AssessmentService | null = null;

export function getAssessmentService(): AssessmentService {
  if (!assessmentService) {
    assessmentService = new AssessmentService();
  }
  return assessmentService;
}

export function resetAssessmentService(): void {
  assessmentService = null;
}
