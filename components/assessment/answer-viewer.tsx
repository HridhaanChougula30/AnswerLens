'use client';

import React, { useState } from 'react';
import { Assessment, Mapping } from '@/types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnswerViewerProps {
  mapping: Mapping | null | undefined;
  assessment: Assessment;
}

export function AnswerViewer({ mapping, assessment }: AnswerViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const totalPages = Math.max(...assessment.answers.map(a => a.page || 1), 1);
  const answersOnCurrentPage = assessment.answers.filter(a => a.page === currentPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="bg-white rounded-lg border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Answer Sheet</h2>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 py-1 text-xs bg-slate-100 rounded">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="gap-1"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="px-2 py-1 text-xs bg-slate-100 rounded min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="gap-1"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(100)}
              className="gap-1"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50">
        <div
          className="bg-slate-200 rounded-lg shadow-lg relative"
          style={{
            width: `${600 * (zoom / 100)}px`,
            height: `${800 * (zoom / 100)}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Mock Answer Sheet */}
          <div className="w-full h-full bg-white p-8 rounded-lg relative">
            {/* Page content */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Answer Sheet - Page {currentPage}</h3>

              {answersOnCurrentPage.length === 0 ? (
                <p className="text-slate-500 italic text-center py-20">No answers on this page</p>
              ) : (
                answersOnCurrentPage.map((answer, idx) => (
                  <div key={idx} className="mb-4 p-3 bg-slate-50 rounded border">
                    <p className="text-sm font-semibold text-slate-900">
                      {answer.questionNumber ? `Q${answer.questionNumber}` : 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-700 mt-1">{answer.text.substring(0, 100)}...</p>
                  </div>
                ))
              )}
            </div>

            {/* Highlight boxes for selected answer */}
            {mapping && mapping.regions && mapping.regions.length > 0 && (
              <>
                {mapping.regions.map((region, idx) => {
                  if (region.page !== currentPage) return null;

                  const { bbox } = region;
                  return (
                    <div
                      key={idx}
                      className="absolute border-2 border-yellow-400 bg-yellow-200/30"
                      style={{
                        left: `${bbox.x * 100}%`,
                        top: `${bbox.y * 100}%`,
                        width: `${bbox.width * 100}%`,
                        height: `${bbox.height * 100}%`,
                        pointerEvents: 'none',
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
