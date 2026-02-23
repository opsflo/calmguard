'use client';

import { useAnalysisStore } from '@/store/analysis-store';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { analysisInput } = useAnalysisStore();

  const nodeCount = analysisInput?.metadata.nodeCount || 0;
  const relationshipCount = analysisInput?.metadata.relationshipCount || 0;

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      {/* Left: Empty or could add breadcrumbs later */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-400">
          Dashboard
        </h2>
      </div>

      {/* Right: Parse status badge */}
      {analysisInput && (
        <Badge
          variant="secondary"
          className="bg-slate-800 text-slate-300 hover:bg-slate-700"
        >
          Parsed: {nodeCount} nodes, {relationshipCount} relationships
        </Badge>
      )}
    </header>
  );
}
