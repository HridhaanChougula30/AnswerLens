'use client';

import React from 'react';
import { Question, Mapping, Answer } from '@/types';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface QuestionDetailProps {
  question: Question;
  mapping: Mapping;
  answer: Answer | null;
}

export function QuestionDetail({ question, mapping, answer }: QuestionDetailProps) {
  const getStatusDisplay = (mapping: Mapping) => {
    if (mapping.status === 'unanswered') {
      return { icon: HelpCircle, label: 'Not Answered', color: 'text-slate-600 bg-slate-50' };
    }
    if (mapping.status === 'answered' && mapping.confidence < 0.85) {
      return { icon: AlertCircle, label: 'Needs Review', color: 'text-amber-600 bg-amber-50' };
    }
    if (mapping.status === 'answered') {
      return { icon: CheckCircle2, label: 'Answered', color: 'text-green-600 bg-green-50' };
    }
    return { icon: AlertCircle, label: 'Unmatched', color: 'text-red-600 bg-red-50' };
  };

  const status = getStatusDisplay(mapping);
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-lg border h-full flex flex-col overflow-auto">
      {/* Question */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl font-bold text-slate-900">Q{question.number}</div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </div>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed">{question.text}</p>

        {question.marks && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-slate-600">
              <span className="font-medium">Marks:</span> {question.marks}
            </p>
          </div>
        )}
      </div>

      {/* Answer */}
      {answer ? (
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Student Answer</h3>
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
            {answer.text}
          </p>
        </div>
      ) : (
        <div className="p-4 border-b">
          <p className="text-sm text-slate-500 italic">No answer provided</p>
        </div>
      )}

      {/* Confidence */}
      {mapping.confidence < 1 && (
        <div className="p-4 border-b bg-amber-50">
          <p className="text-xs font-medium text-amber-900 mb-1">Mapping Confidence</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-amber-200 rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all"
                style={{ width: `${mapping.confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-amber-900 min-w-fit">
              {Math.round(mapping.confidence * 100)}%
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-2">
            {mapping.confidence >= 0.85
              ? 'High confidence mapping'
              : mapping.confidence >= 0.6
              ? 'Medium confidence - review recommended'
              : 'Low confidence - manual verification suggested'}
          </p>
        </div>
      )}

      {/* Grading */}
      {mapping.grading && (
        <div className="p-4 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">AI Evaluation</h3>

          <div className="space-y-3">
            {/* Score */}
            {mapping.grading.score !== undefined && mapping.grading.maxScore && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(mapping.grading.score / mapping.grading.maxScore) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {mapping.grading.score}/{mapping.grading.maxScore}
                  </span>
                </div>
              </div>
            )}

            {/* Evaluation */}
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Evaluation</p>
              <p className="text-sm font-medium text-slate-900">
                {mapping.grading.evaluation === 'correct'
                  ? '✓ Correct'
                  : mapping.grading.evaluation === 'partially_correct'
                  ? '~ Partially Correct'
                  : mapping.grading.evaluation === 'incorrect'
                  ? '✗ Incorrect'
                  : 'Cannot Evaluate'}
              </p>
            </div>

            {/* Feedback */}
            {mapping.grading.feedback && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Feedback</p>
                <p className="text-sm text-slate-700">{mapping.grading.feedback}</p>
              </div>
            )}

            {/* Missing Concepts */}
            {mapping.grading.missingConcepts && mapping.grading.missingConcepts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Missing Concepts</p>
                <div className="space-y-1">
                  {mapping.grading.missingConcepts.map((concept, idx) => (
                    <p key={idx} className="text-sm text-slate-700">
                      • {concept}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
