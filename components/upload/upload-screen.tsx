'use client';

import React, { useState } from 'react';
import { Upload, X, AlertCircle, FileText, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateFile } from '@/lib/validation';
import { formatFileSize } from '@/lib/pdf/processing';

interface UploadScreenProps {
  onUpload: (questionFile: File, answerFile: File) => Promise<void>;
  error?: string | null;
}

export function UploadScreen({ onUpload, error }: UploadScreenProps) {
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    isQuestion: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      if (isQuestion) {
        setQuestionError(validation.error || 'Invalid file');
        setQuestionFile(null);
      } else {
        setAnswerError(validation.error || 'Invalid file');
        setAnswerFile(null);
      }
      return;
    }

    if (isQuestion) {
      setQuestionFile(file);
      setQuestionError(null);
    } else {
      setAnswerFile(file);
      setAnswerError(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    isQuestion: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      if (isQuestion) {
        setQuestionError(validation.error || 'Invalid file');
      } else {
        setAnswerError(validation.error || 'Invalid file');
      }
      return;
    }

    if (isQuestion) {
      setQuestionFile(file);
      setQuestionError(null);
    } else {
      setAnswerFile(file);
      setAnswerError(null);
    }
  };

  const handleSubmit = async () => {
    if (!questionFile || !answerFile) return;

    setIsLoading(true);
    try {
      await onUpload(questionFile, answerFile);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Assessment</h2>
          <p className="text-slate-600">
            Upload your question paper and student answer sheet to begin extraction and mapping
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Processing Error</h3>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Question Paper Upload */}
          <div
            onDrop={(e) => handleDrop(e, true)}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer group bg-white"
          >
            <label className="cursor-pointer block">
              <div className="mb-4">
                {questionFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <span className="text-sm font-medium text-slate-900">{questionFile.name}</span>
                  </div>
                ) : (
                  <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Question Paper</h3>
              <p className="text-sm text-slate-600 mb-4">
                Upload the question paper containing printed questions
              </p>
              {questionFile && (
                <p className="text-xs text-slate-500 mb-3">
                  {formatFileSize(questionFile.size)} • {questionFile.type.split('/')[1].toUpperCase()}
                </p>
              )}
              <p className="text-xs text-slate-500">Supported: PDF, PNG, JPG, JPEG</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
                onChange={(e) => handleFileSelect(e, true)}
              />
            </label>
            {questionFile && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 gap-2 mx-auto"
                onClick={(e) => {
                  e.preventDefault();
                  setQuestionFile(null);
                }}
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            )}
          </div>

          {/* Answer Sheet Upload */}
          <div
            onDrop={(e) => handleDrop(e, false)}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer group bg-white"
          >
            <label className="cursor-pointer block">
              <div className="mb-4">
                {answerFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileImage className="w-8 h-8 text-green-600" />
                    <span className="text-sm font-medium text-slate-900">{answerFile.name}</span>
                  </div>
                ) : (
                  <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Student Answer Sheet</h3>
              <p className="text-sm text-slate-600 mb-4">
                Upload the student&apos;s handwritten answer sheet
              </p>
              {answerFile && (
                <p className="text-xs text-slate-500 mb-3">
                  {formatFileSize(answerFile.size)} • {answerFile.type.split('/')[1].toUpperCase()}
                </p>
              )}
              <p className="text-xs text-slate-500">Supported: PDF, PNG, JPG, JPEG</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
                onChange={(e) => handleFileSelect(e, false)}
              />
            </label>
            {answerFile && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 gap-2 mx-auto"
                onClick={(e) => {
                  e.preventDefault();
                  setAnswerFile(null);
                }}
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {(questionError || answerError) && (
          <div className="space-y-2 mb-6">
            {questionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {questionError}
              </div>
            )}
            {answerError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {answerError}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!questionFile || !answerFile || isLoading}
            className="gap-2 px-8"
          >
            {isLoading ? 'Processing...' : 'Analyze Assessment'}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Requirements</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Both files must be uploaded before analysis</li>
            <li>• Maximum file size: 50MB each</li>
            <li>• Supported formats: PDF, PNG, JPG, JPEG</li>
            <li>• For best results, use clear, high-resolution scans</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
