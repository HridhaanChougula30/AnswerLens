'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProcessingStep } from '@/types';

export function ProcessingScreen() {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'upload', name: 'Uploading documents', status: 'processing' },
    { id: 'read-question', name: 'Reading question paper', status: 'pending' },
    { id: 'read-answer', name: 'Reading handwritten answers', status: 'pending' },
    { id: 'mapping', name: 'Mapping answers to questions', status: 'pending' },
    { id: 'grading', name: 'Preparing assessment', status: 'pending' },
  ]);

  // Simulate progress for demo
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    steps.forEach((_, index) => {
      intervals.push(
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === index && s.status === 'pending'
                ? { ...s, status: 'processing' }
                : i < index && s.status === 'processing'
                ? { ...s, status: 'completed' }
                : s
            )
          );
        }, index * 2000)
      );
    });

    return () => intervals.forEach(clearTimeout);
  }, [steps]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Processing Assessment</h2>
          <p className="text-slate-600">
            Analyzing your documents with AI. This may take a minute...
          </p>
        </div>

        {/* Processing Timeline */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0 transition-all ${
                    step.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : step.status === 'processing'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.status === 'completed' && <CheckCircle2 className="w-5 h-5" />}
                  {step.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin" />}
                  {step.status === 'pending' && <div className="w-2 h-2 bg-current rounded-full" />}
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-1 h-8 mt-2 transition-colors ${
                      step.status === 'completed' ? 'bg-green-200' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="pt-2 flex-1">
                <h3
                  className={`font-medium transition-colors ${
                    step.status === 'completed'
                      ? 'text-green-700'
                      : step.status === 'processing'
                      ? 'text-blue-700'
                      : 'text-slate-500'
                  }`}
                >
                  {step.name}
                </h3>
                {step.status === 'processing' && (
                  <p className="text-sm text-slate-600 mt-1">In progress...</p>
                )}
                {step.status === 'completed' && (
                  <p className="text-sm text-green-600 mt-1">✓ Completed</p>
                )}
                {step.error && (
                  <p className="text-sm text-red-600 mt-1 flex gap-1 items-center">
                    <AlertCircle className="w-4 h-4" />
                    {step.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress info */}
        <div className="mt-12 text-center text-sm text-slate-600">
          <p>Processing your documents...</p>
          <p className="mt-2">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse" /> Please wait
          </p>
        </div>
      </div>
    </div>
  );
}
