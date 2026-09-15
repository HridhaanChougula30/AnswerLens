'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentService, resetAssessmentService } from '@/lib/services/assessment';
import { isConfigured } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: 'AI processing not configured. Please set GEMINI_API_KEY in environment variables.',
          steps: [],
        },
        { status: 400 }
      );
    }

    // Reset service for new assessment
    resetAssessmentService();
    const service = getAssessmentService();

    const formData = await req.formData();
    const questionFile = formData.get('questionPaper') as File;
    const answerFile = formData.get('answerSheet') as File;

    if (!questionFile || !answerFile) {
      return NextResponse.json(
        { error: 'Both question paper and answer sheet are required.' },
        { status: 400 }
      );
    }

    // Convert files to base64
    const questionBuffer = await questionFile.arrayBuffer();
    const answerBuffer = await answerFile.arrayBuffer();

    // For now, we'll handle image files directly
    // PDF handling will be done on the client side before sending
    const questionBase64 = Buffer.from(questionBuffer).toString('base64');
    const answerBase64 = Buffer.from(answerBuffer).toString('base64');

    // Determine MIME type
    const questionMimeType = questionFile.type || 'image/png';
    const answerMimeType = answerFile.type || 'image/png';

    const questionImage = `data:${questionMimeType};base64,${questionBase64}`;
    const answerImage = `data:${answerMimeType};base64,${answerBase64}`;

    // Create assessment
    service.setStepStatus('upload', 'processing');
    service.setStepStatus('upload', 'completed');

    const assessment = await service.createAssessment([questionImage], [answerImage]);

    return NextResponse.json({
      success: true,
      assessment,
      steps: service.getSteps(),
    });
  } catch (error: any) {
    console.error('Error analyzing assessment:', error);
    const service = getAssessmentService();

    return NextResponse.json(
      {
        error: error.message || 'Failed to analyze assessment',
        steps: service.getSteps(),
      },
      { status: 500 }
    );
  }
}
