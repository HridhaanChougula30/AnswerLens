'use client';

import React from 'react';
import { Search, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Mapping, Question } from '@/types';
import { Button } from '@/components/ui/button';

interface QuestionListProps {
  mappings: Mapping[];
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  filter: 'all' | 'answered' | 'unanswered' | 'needs_review';
  onFilterChange: (filter: 'all' | 'answered' | 'unanswered' | 'needs_review') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function QuestionList({
  mappings,
  questions,
  selectedQuestionId,
  onSelectQuestion,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: QuestionListProps) {
  const getStatusIcon = (mapping: Mapping) => {
    if (mapping.status === 'unanswered') {
      return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
    if (mapping.confidence < 0.85 && mapping.status === 'answered') {
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
    if (mapping.status === 'answered') {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusLabel = (mapping: Mapping) => {
    if (mapping.status === 'unanswered') return 'Not answered';
    if (mapping.status === 'answered' && mapping.confidence < 0.85) return 'Review';
    if (mapping.status === 'answered') return 'Answered';
    return 'Unmatched';
  };

  return (
    <div className="bg-white rounded-lg border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Questions</h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase">Filter</p>
          <div className="grid grid-cols-2 gap-2">
            {['all', 'answered', 'unanswered', 'needs_review'].map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => onFilterChange(f as any)}
                className="text-xs"
              >
                {f === 'all'
                  ? 'All'
                  : f === 'answered'
                  ? 'Answered'
                  : f === 'unanswered'
                  ? 'Not Answered'
                  : 'Review'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="overflow-y-auto flex-1">
        {mappings.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No questions match your filter
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {mappings.map((mapping) => {
              const question = questions.find((q) => q.id === mapping.questionId);
              if (!question) return null;

              return (
                <button
                  key={mapping.questionId}
                  onClick={() => onSelectQuestion(mapping.questionId)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedQuestionId === mapping.questionId
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      {getStatusIcon(mapping)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-900">Q{question.number}</div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {question.text}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">{getStatusLabel(mapping)}</span>
                        {mapping.confidence < 1 && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {Math.round(mapping.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
