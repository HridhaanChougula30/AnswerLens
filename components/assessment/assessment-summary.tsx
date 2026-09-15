'use client';

import React from 'react';
import { Assessment } from '@/types';
import { CheckCircle2, AlertCircle, HelpCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssessmentSummaryProps {
  assessment: Assessment;
}

export function AssessmentSummary({ assessment }: AssessmentSummaryProps) {
  const percentageAnswered = Math.round(
    (assessment.summary.answered / assessment.summary.totalQuestions) * 100
  );
  const percentageScore = assessment.summary.maxScore
    ? Math.round((assessment.summary.totalScore! / assessment.summary.maxScore) * 100)
    : null;

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Assessment Summary</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Questions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium mb-2">Total Questions</p>
          <p className="text-2xl font-bold text-blue-900">{assessment.summary.totalQuestions}</p>
        </div>

        {/* Answered */}
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Answered
          </p>
          <p className="text-2xl font-bold text-green-900">{assessment.summary.answered}</p>
          <p className="text-xs text-green-700 mt-1">{percentageAnswered}%</p>
        </div>

        {/* Unanswered */}
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-700 font-medium mb-2 flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            Not Answered
          </p>
          <p className="text-2xl font-bold text-slate-900">{assessment.summary.unanswered}</p>
        </div>

        {/* Needs Review */}
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-sm text-amber-700 font-medium mb-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Needs Review
          </p>
          <p className="text-2xl font-bold text-amber-900">{assessment.summary.needsReview}</p>
        </div>

        {/* Score */}
        {assessment.summary.totalScore !== undefined && (
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-700 font-medium mb-2">Score</p>
            <p className="text-2xl font-bold text-purple-900">
              {assessment.summary.totalScore}/{assessment.summary.maxScore}
            </p>
            {percentageScore !== null && (
              <p className="text-xs text-purple-700 mt-1">{percentageScore}%</p>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm font-medium text-slate-900 mb-3">Response Status</p>
        <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
          <div
            className="bg-green-500 transition-all"
            style={{
              width: `${(assessment.summary.answered / assessment.summary.totalQuestions) * 100}%`,
            }}
            title={`Answered: ${assessment.summary.answered}`}
          />
          <div
            className="bg-amber-500 transition-all"
            style={{
              width: `${(assessment.summary.needsReview / assessment.summary.totalQuestions) * 100}%`,
            }}
            title={`Needs Review: ${assessment.summary.needsReview}`}
          />
          <div
            className="bg-slate-300 transition-all"
            style={{
              width: `${(assessment.summary.unanswered / assessment.summary.totalQuestions) * 100}%`,
            }}
            title={`Not Answered: ${assessment.summary.unanswered}`}
          />
        </div>
        <div className="flex gap-4 text-xs text-slate-600 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span>Review</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-300 rounded-full" />
            <span>Not Answered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
