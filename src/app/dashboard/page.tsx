'use client';

import { CheckCircle2 } from 'lucide-react';
import { useAnalysisStore } from '@/store/analysis-store';
import { ComplianceCardSkeleton } from '@/components/dashboard/compliance-card-skeleton';
import { PipelinePreviewSkeleton } from '@/components/dashboard/pipeline-preview-skeleton';
import { ArchitectureGraph } from '@/components/graph/architecture-graph';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const analysisInput = useAnalysisStore((state) => state.analysisInput);
  const analysisResult = useAnalysisStore((state) => state.analysisResult);
  const status = useAnalysisStore((state) => state.status);

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
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          <span className="text-sm text-emerald-400">
            Analysis complete — {analysisResult.completedAgents.length} agents finished
            in {(analysisResult.duration / 1000).toFixed(1)}s
          </span>
        </div>
      )}

      {/* Pre-analysis prompt — shown when architecture is loaded but analysis hasn't started */}
      {isParsed && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
          <span className="text-sm text-slate-400">
            Architecture loaded — click <span className="text-slate-200 font-medium">Analyze</span> in the header to begin compliance analysis.
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
        {/* Top Left: Compliance Score — placeholder for Phase 4 */}
        <ComplianceCardSkeleton />

        {/* Top Right: Architecture Graph — real component from Phase 3-05 */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <div className="h-[300px]">
            <ArchitectureGraph />
          </div>
        </Card>

        {/* Bottom Left: Pipeline Preview — placeholder for Phase 4 */}
        <PipelinePreviewSkeleton />

        {/* Bottom Right slot: Agent feed moved to permanent right column in layout */}
      </div>
    </div>
  );
}
