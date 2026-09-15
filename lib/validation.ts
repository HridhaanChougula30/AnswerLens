import { z } from 'zod';

// File validation
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const SUPPORTED_PDF_TYPES = ['application/pdf'];
export const SUPPORTED_FILE_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_PDF_TYPES];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MIN_FILE_SIZE = 1024; // 1KB

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG.',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 50MB limit.',
    };
  }

  if (file.size < MIN_FILE_SIZE) {
    return {
      valid: false,
      error: 'File is too small.',
    };
  }

  return { valid: true };
}

export async function validatePDF(buffer: ArrayBuffer): Promise<boolean> {
  // Check PDF signature (first 4 bytes: %PDF)
  const view = new Uint8Array(buffer);
  const signature = String.fromCharCode(view[0], view[1], view[2], view[3]);
  return signature === '%PDF';
}

// Schema validation
export const BoundingBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

export const QuestionSchema = z.object({
  id: z.string(),
  number: z.string(),
  text: z.string(),
  page: z.number().int().positive(),
  bbox: BoundingBoxSchema.optional(),
  type: z.string().optional(),
  marks: z.number().optional(),
  parentQuestion: z.string().optional(),
});

export const AnswerSchema = z.object({
  id: z.string(),
  text: z.string(),
  questionNumber: z.string().optional(),
  page: z.number().int().positive().optional(),
  bbox: BoundingBoxSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
  regions: z.array(z.object({
    page: z.number().int().positive(),
    bbox: BoundingBoxSchema,
  })).optional(),
});

export const MappingSchema = z.object({
  questionId: z.string(),
  questionNumber: z.string(),
  answerId: z.string().optional(),
  status: z.enum(['answered', 'unanswered', 'unmatched', 'uncertain']),
  confidence: z.number().min(0).max(1),
  regions: z.array(z.object({
    page: z.number().int().positive(),
    bbox: BoundingBoxSchema,
  })).optional(),
  grading: z.object({
    score: z.number().optional(),
    maxScore: z.number().optional(),
    evaluation: z.enum(['correct', 'partially_correct', 'incorrect', 'cannot_evaluate']),
    feedback: z.string().optional(),
    missingConcepts: z.array(z.string()).optional(),
  }).optional(),
  manualCorrection: z.boolean().optional(),
});

export const AssessmentSchema = z.object({
  id: z.string(),
  questions: z.array(QuestionSchema),
  answers: z.array(AnswerSchema),
  mappings: z.array(MappingSchema),
  unmatchedAnswers: z.array(AnswerSchema),
  summary: z.object({
    totalQuestions: z.number().int().nonnegative(),
    answered: z.number().int().nonnegative(),
    unanswered: z.number().int().nonnegative(),
    needsReview: z.number().int().nonnegative(),
    totalScore: z.number().optional(),
    maxScore: z.number().optional(),
  }),
  createdAt: z.string(),
});

export function validateJSON<T>(data: unknown, schema: z.Schema<T>): { valid: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')}`,
      };
    }
    return {
      valid: false,
      error: 'Unknown validation error',
    };
  }
}
