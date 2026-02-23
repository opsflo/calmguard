'use client';

import { useAnalysisStore } from '@/store/analysis-store';
import { ArchitectureSelector } from '@/components/calm/architecture-selector';
import { ParseErrorDisplay } from '@/components/calm/parse-error-display';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function Home() {
  const { error, reset } = useAnalysisStore();

  const handleDismissError = () => {
    reset();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-emerald-500" />
            <h1 className="text-4xl font-bold text-slate-50">CALMGuard</h1>
          </div>
          <p className="text-lg text-slate-400">
            CALM-native continuous compliance platform
          </p>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Upload a FINOS CALM architecture and get instant AI-powered
            compliance analysis, risk assessment, and generated CI/CD pipeline
            configurations
          </p>
        </div>

        {/* Main Selector Card */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-200 mb-1">
                Get Started
              </h2>
              <p className="text-sm text-slate-400">
                Choose a demo architecture or upload your own CALM JSON file
              </p>
            </div>
            <ArchitectureSelector />
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <ParseErrorDisplay error={error} onDismiss={handleDismissError} />
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-600">
          <p>Built for DTCC/FINOS Innovate.DTCC AI Hackathon 2026</p>
          <p className="mt-1">
            Powered by FINOS CALM, Vercel AI SDK, and Google Gemini
          </p>
        </div>
      </div>
    </main>
  );
}
