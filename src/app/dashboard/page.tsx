'use client';

import { useAnalysisStore } from '@/store/analysis-store';
import { ComplianceCardSkeleton } from '@/components/dashboard/compliance-card-skeleton';
import { ArchitectureGraphSkeleton } from '@/components/dashboard/architecture-graph-skeleton';
import { AgentFeedSkeleton } from '@/components/dashboard/agent-feed-skeleton';
import { PipelinePreviewSkeleton } from '@/components/dashboard/pipeline-preview-skeleton';

export default function DashboardPage() {
  const { analysisInput } = useAnalysisStore();

  // If no architecture loaded, show empty state with call-to-action
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

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-200 mb-2">
          Overview
        </h1>
        <p className="text-sm text-slate-400">
          Compliance analysis dashboard for your CALM architecture
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Left: Compliance Score */}
        <ComplianceCardSkeleton />

        {/* Top Right: Architecture Graph */}
        <ArchitectureGraphSkeleton />

        {/* Bottom Left: Agent Activity Feed */}
        <AgentFeedSkeleton />

        {/* Bottom Right: Pipeline Preview */}
        <PipelinePreviewSkeleton />
      </div>
    </div>
  );
}
