'use client';

import { useRouter } from 'next/navigation';
import { useAnalysisStore } from '@/store/analysis-store';
import { ArchitectureSelector } from '@/components/calm/architecture-selector';
import { ParseErrorDisplay } from '@/components/calm/parse-error-display';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Play } from 'lucide-react';
import { DEMO_ARCHITECTURES } from '../../examples';
import { parseCalm } from '@/lib/calm/parser';
import { extractAnalysisInput } from '@/lib/calm/extractor';

export default function Home() {
  const router = useRouter();
  const { error, reset, setCalmData, setDemoMode, setSelectedFrameworks } = useAnalysisStore();

  const handleDismissError = () => {
    reset();
  };

  const handleRunDemo = () => {
    // Find the trading platform demo architecture
    const demo = DEMO_ARCHITECTURES.find((d) => d.id === 'trading-platform');
    if (!demo) return;

    // Parse the CALM document
    const parseResult = parseCalm(demo.data);
    if (!parseResult.success) return;

    // Extract structured analysis input
    const analysisInput = extractAnalysisInput(parseResult.data);

    // Pre-select all frameworks for a comprehensive demo
    setSelectedFrameworks(['SOX', 'PCI-DSS', 'NIST-CSF', 'CCC']);

    // Populate store with trading platform data
    setCalmData(parseResult.data, analysisInput);

    // Set demo mode flag — dashboard will auto-start analysis
    setDemoMode(true);

    // Navigate to dashboard
    router.push('/dashboard');
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

        {/* Run Demo CTA — primary action for hackathon judges */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
            Live Demo
          </p>
          <p className="text-sm text-slate-400">
            See CALMGuard analyze a trading platform architecture in real-time
          </p>
          <Button
            onClick={handleRunDemo}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base h-12 gap-2"
          >
            <Play className="h-5 w-5" />
            Run Demo
          </Button>
          <p className="text-xs text-slate-600">
            Trading Platform — Multi-service system with FIX protocol, order management, and real-time market data
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
