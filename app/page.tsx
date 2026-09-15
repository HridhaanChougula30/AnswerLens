'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { UploadScreen } from '@/components/upload/upload-screen';
import { ProcessingScreen } from '@/components/processing/processing-screen';
import { AssessmentWorkspace } from '@/components/assessment/assessment-workspace';
import { Assessment } from '@/types';

type Screen = 'upload' | 'processing' | 'assessment';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleUpload = async (questionFile: File, answerFile: File) => {
    setScreen('processing');
    setProcessingError(null);

    try {
      const formData = new FormData();
      formData.append('questionPaper', questionFile);
      formData.append('answerSheet', answerFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setProcessingError(data.error || 'Failed to process files');
        setScreen('upload');
        return;
      }

      setAssessment(data.assessment);
      setScreen('assessment');
    } catch (error: any) {
      setProcessingError(error.message || 'An error occurred');
      setScreen('upload');
    }
  };

  const handleNewAssessment = () => {
    setAssessment(null);
    setScreen('upload');
    setProcessingError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header onNewAssessment={screen === 'assessment' ? handleNewAssessment : undefined} />

      <main className="flex-1">
        {screen === 'upload' && (
          <UploadScreen onUpload={handleUpload} error={processingError} />
        )}
        {screen === 'processing' && <ProcessingScreen />}
        {screen === 'assessment' && assessment && (
          <AssessmentWorkspace assessment={assessment} onNewAssessment={handleNewAssessment} />
        )}
      </main>
    </div>
  );
}
