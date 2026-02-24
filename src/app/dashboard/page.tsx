'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAnalysisStore } from '@/store/analysis-store';
import { useAgentStream } from '@/hooks/use-agent-stream';
import { ComplianceCard } from '@/components/dashboard/compliance-card';
import { PipelinePreview } from '@/components/dashboard/pipeline-preview';
import { ArchitectureGraph } from '@/components/graph/architecture-graph';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const analysisInput = useAnalysisStore((state) => state.analysisInput);
  const analysisResult = useAnalysisStore((state) => state.analysisResult);
  const rawCalmData = useAnalysisStore((state) => state.rawCalmData);
  const selectedFrameworks = useAnalysisStore((state) => state.selectedFrameworks);
  const status = useAnalysisStore((state) => state.status);
  const demoMode = useAnalysisStore((state) => state.demoMode);
  const setDemoMode = useAnalysisStore((state) => state.setDemoMode);
  const { startStream } = useAgentStream();

  // Guard against double-fire on React StrictMode double-invoke
  const hasStartedRef = useRef(false);

  // Demo mode auto-start: fire analysis 800ms after landing to let dashboard render
  useEffect(() => {
    if (demoMode && rawCalmData && status === 'parsed' && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const timer = setTimeout(() => {
        void startStream(rawCalmData, selectedFrameworks, true);
        setDemoMode(false); // Reset after triggering so re-renders don't re-fire
      }, 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [demoMode, rawCalmData, status, startStream, selectedFrameworks, setDemoMode]);

  // If no architecture loaded, show centered empty state with call-to-action
  if (!analysisInput) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-slate-300">
            No Architecture Loaded
          </h2>
          <p className="text-sm text-slate-500 max-w-md">
            Select an architecture and click Analyze to begin your compliance analysis.
          </p>
        </div>
      </div>
    );
  }

  const isComplete = status === 'complete' && analysisResult !== null;
  const isParsed = status === 'parsed';

  return (
    <div className="p-6">
      {/* Completion banner — subtle, non-intrusive, per locked decision */}
      {isComplete && (
        <>
          <div className={`border rounded-lg px-4 py-3 mb-2 flex items-center gap-3 ${
            analysisResult.failedAgents.length > 0
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            {analysisResult.failedAgents.length > 0 ? (
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            )}
            <span className={`text-sm flex-1 ${
              analysisResult.failedAgents.length > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {analysisResult.failedAgents.length > 0
                ? `Partial analysis — ${analysisResult.completedAgents.length}/${analysisResult.completedAgents.length + analysisResult.failedAgents.length} agents succeeded in ${(analysisResult.duration / 1000).toFixed(1)}s`
                : `Analysis complete — ${analysisResult.completedAgents.length} agents finished in ${(analysisResult.duration / 1000).toFixed(1)}s`
              }
            </span>
            {rawCalmData && (
              <Button
                size="sm"
                variant="outline"
                className="ml-auto border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 flex-shrink-0"
                onClick={() => void startStream(rawCalmData, selectedFrameworks)}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Retry Analysis
              </Button>
            )}
          </div>

          {/* Partial results warning — only when agents failed */}
          {analysisResult.failedAgents.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <span className="text-sm text-amber-400">
                Partial results: {analysisResult.failedAgents.join(', ')} failed. Some panels may show incomplete data.
              </span>
            </div>
          )}
        </>
      )}

      {/* Pre-analysis prompt — shown when architecture is loaded but analysis hasn't started */}
      {isParsed && !demoMode && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
          <span className="text-sm text-slate-400">
            Architecture loaded — click <span className="text-slate-200 font-medium">Analyze</span> in the header to begin compliance analysis.
          </span>
        </div>
      )}

      {/* Demo mode loading indicator */}
      {isParsed && demoMode && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
          <span className="text-sm text-emerald-400 animate-pulse">
            Initializing demo analysis...
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Overview</h1>
        <p className="text-sm text-slate-400">
          Compliance analysis dashboard for your CALM architecture
        </p>
      </div>

      {/* Dashboard Grid — 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Left: Compliance Score — real component wired to risk data */}
        <ComplianceCard />

        {/* Top Right: Architecture Graph — real component from Phase 3-05 */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="h-[500px]">
            <ArchitectureGraph compact />
          </div>
        </Card>

        {/* Bottom Left: Pipeline Preview — compact mode for overview grid */}
        <PipelinePreview compact />

        {/* Bottom Right slot: Agent feed moved to permanent right column in layout */}
      </div>
    </div>
  );
}
