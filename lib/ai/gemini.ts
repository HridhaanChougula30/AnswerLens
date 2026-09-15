import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question, Answer, Mapping } from '@/types';
import {
  QUESTION_EXTRACTION_PROMPT,
  ANSWER_EXTRACTION_PROMPT,
  MAPPING_PROMPT,
  GRADING_PROMPT,
} from '@/lib/prompts';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.');
}

const client = new GoogleGenerativeAI(API_KEY || '');

interface MappingResult {
  mappings: Mapping[];
  unmatchedAnswers: Array<{ answerId: string; questionNumber?: string; confidence: number; reason: string }>;
}

interface GradingResult {
  score?: number;
  maxScore?: number;
  evaluation: 'correct' | 'partially_correct' | 'incorrect' | 'cannot_evaluate';
  feedback?: string;
  keyConceptsMissing?: string[];
  strengths?: string[];
  areasForImprovement?: string[];
}

export async function extractQuestions(imageData: string[]): Promise<Question[]> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in .env.local');
  }

  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const content: any[] = [
    {
      type: 'text',
      text: QUESTION_EXTRACTION_PROMPT,
    },
  ];

  // Add images
  for (const image of imageData) {
    content.push({
      type: 'image',
      inlineData: {
        mimeType: 'image/png',
        data: image.split(',')[1], // Remove data:image/png;base64, prefix
      },
    });
  }

  try {
    const response = await model.generateContent(content);
    const text = response.response.text();

    // Try to parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      throw new Error('Failed to parse questions from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.questions || [];
  } catch (error) {
    console.error('Error extracting questions:', error);
    throw error;
  }
}

export async function extractAnswers(imageData: string[]): Promise<Answer[]> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in .env.local');
  }

  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const content: any[] = [
    {
      type: 'text',
      text: ANSWER_EXTRACTION_PROMPT,
    },
  ];

  for (const image of imageData) {
    content.push({
      type: 'image',
      inlineData: {
        mimeType: 'image/png',
        data: image.split(',')[1],
      },
    });
  }

  try {
    const response = await model.generateContent(content);
    const text = response.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      throw new Error('Failed to parse answers from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.answers || [];
  } catch (error) {
    console.error('Error extracting answers:', error);
    throw error;
  }
}

export async function mapAnswersToQuestions(
  questions: Question[],
  answers: Answer[]
): Promise<MappingResult> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in .env.local');
  }

  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `${MAPPING_PROMPT}

QUESTIONS TO MAP:
${JSON.stringify(questions, null, 2)}

ANSWERS TO MAP:
${JSON.stringify(answers, null, 2)}

Please match the answers to questions and return the result.`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse mapping from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      mappings: parsed.mappings || [],
      unmatchedAnswers: parsed.unmatchedAnswers || [],
    };
  } catch (error) {
    console.error('Error mapping answers:', error);
    throw error;
  }
}

export async function gradeAnswer(
  question: Question,
  answer: Answer,
  maxMarks?: number
): Promise<GradingResult> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in .env.local');
  }

  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `${GRADING_PROMPT}

QUESTION: "${question.text}"
STUDENT ANSWER: "${answer.text}"
${maxMarks ? `MAXIMUM MARKS: ${maxMarks}` : ''}

Please evaluate the answer and return the result.`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse grading from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Error grading answer:', error);
    throw error;
  }
}

export function isConfigured(): boolean {
  return !!API_KEY;
}
