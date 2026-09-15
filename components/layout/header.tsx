'use client';

import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

interface HeaderProps {
  onNewAssessment?: () => void;
}

export function Header({ onNewAssessment }: HeaderProps) {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AnswerLens</h1>
              <p className="text-sm text-slate-600">Assessment Extraction & Answer Mapping</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNewAssessment && (
              <Button onClick={onNewAssessment} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Assessment
              </Button>
            )}
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
