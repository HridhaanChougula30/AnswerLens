'use client';

import React, { useState } from 'react';
import { Assessment } from '@/types';
import { QuestionList } from './question-list';
import { AnswerViewer } from './answer-viewer';
import { QuestionDetail } from './question-detail';
import { AssessmentSummary } from './assessment-summary';

interface AssessmentWorkspaceProps {
  assessment: Assessment;
  onNewAssessment: () => void;
}

export function AssessmentWorkspace({ assessment }: AssessmentWorkspaceProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    assessment.questions[0]?.id || null
  );
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered' | 'needs_review'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedQuestion = assessment.questions.find((q) => q.id === selectedQuestionId);
  const selectedMapping = assessment.mappings.find((m) => m.questionId === selectedQuestionId);

  // Filter questions
  const filteredMappings = assessment.mappings.filter((m) => {
    // Apply filter
    if (filter === 'answered' && m.status !== 'answered') return false;
    if (filter === 'unanswered' && m.status !== 'unanswered') return false;
    if (filter === 'needs_review' && m.confidence >= 0.85) return false;

    // Apply search
    const question = assessment.questions.find((q) => q.id === m.questionId);
    if (question) {
      return (
        question.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Summary */}
      <div className="mb-6">
        <AssessmentSummary assessment={assessment} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question List */}
        <div className="lg:col-span-1">
          <QuestionList
            mappings={filteredMappings}
            questions={assessment.questions}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Middle: Question Detail */}
        <div className="lg:col-span-1">
          {selectedQuestion && selectedMapping ? (
            <QuestionDetail
              question={selectedQuestion}
              mapping={selectedMapping}
              answer={selectedMapping.answerId ? assessment.answers.find(a => a.id === selectedMapping.answerId) ?? null : null}
            />
          ) : (
            <div className="bg-white rounded-lg border p-6 text-center text-slate-500">
              <p>Select a question to view details</p>
            </div>
          )}
        </div>

        {/* Right: Answer Sheet Viewer */}
        <div className="lg:col-span-2">
          <AnswerViewer
            mapping={selectedMapping ?? null}
            assessment={assessment}
          />
        </div>
      </div>
    </div>
  );
}
