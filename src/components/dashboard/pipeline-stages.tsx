'use client';

import {
  GitCommit,
  CheckCircle,
  FlaskConical,
  Shield,
  Package,
  Rocket,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalysisStore } from '@/store/analysis-store';
import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Stage definitions
// ---------------------------------------------------------------------------

interface Stage {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

const STAGES: Stage[] = [
  { id: 'source', label: 'Source', icon: GitCommit, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  { id: 'quality', label: 'Quality', icon: CheckCircle, color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
  { id: 'test', label: 'Test', icon: FlaskConical, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  { id: 'security', label: 'Security', icon: Shield, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { id: 'build', label: 'Build', icon: Package, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  { id: 'deploy', label: 'Deploy', icon: Rocket, color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
];

// ---------------------------------------------------------------------------
// Tool icon colors
// ---------------------------------------------------------------------------

const TOOL_COLORS: Record<string, string> = {
  semgrep: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  codeql: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  trivy: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'npm-audit': 'bg-red-500/20 text-red-300 border-red-500/30',
  gitleaks: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  syft: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PipelineStages() {
  const analysisResult = useAnalysisStore((state) => state.analysisResult);
  const status = useAnalysisStore((state) => state.status);

  const pipeline = analysisResult?.pipeline ?? null;

  // Loading skeleton
  if (status === 'idle' || status === 'parsed' || status === 'loading') {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-medium text-slate-400">Pipeline Stages</h3>
          <div className="flex items-center gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-14 w-20 rounded-lg bg-slate-700/50" />
                {i < 5 && <Skeleton className="h-0.5 w-6 bg-slate-700/50" />}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Analyzing — show animated skeleton
  if (status === 'analyzing' && !pipeline) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-slate-400">Pipeline Stages</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-blue-400 animate-pulse">Generating...</span>
            </div>
          </div>
          <div className="flex items-center gap-3 relative overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-14 w-20 rounded-lg bg-slate-700/50" />
                {i < 5 && <Skeleton className="h-0.5 w-6 bg-slate-700/50" />}
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent animate-shimmer" />
          </div>
        </div>
      </Card>
    );
  }

  // Pipeline agent failed
  if (status === 'complete' && !pipeline) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-400">
            Pipeline stages unavailable — pipeline generator agent failed
          </p>
        </div>
      </Card>
    );
  }

  if (!pipeline) return null;

  const toolCount = pipeline.securityScanning.tools.length;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-400">Pipeline Stages</h3>
          <span className="text-xs text-slate-500">{pipeline.githubActions.name}</span>
        </div>

        {/* Stage Flow */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {STAGES.map((stage, i) => (
            <div
              key={stage.id}
              className="flex items-center gap-1 shrink-0"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <StageNode
                stage={stage}
                badge={stage.id === 'security' && toolCount > 0 ? String(toolCount) : undefined}
              />
              {i < STAGES.length - 1 && (
                <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Security Tools */}
        {toolCount > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Security Tools</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {pipeline.securityScanning.tools.map((tool) => (
                <ToolCard key={tool.name} name={tool.name} description={tool.description} />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {pipeline.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Recommendations</h4>
            <div className="space-y-2">
              {pipeline.recommendations.map((rec, i) => (
                <RecommendationRow key={i} {...rec} />
              ))}
            </div>
          </div>
        )}

        {/* IaC Provider */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
          <span className="text-xs text-slate-500">Infrastructure:</span>
          <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
            {pipeline.infrastructureAsCode.provider === 'terraform' ? 'Terraform' : 'CloudFormation'}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StageNode({ stage, badge }: { stage: Stage; badge?: string }) {
  const Icon = stage.icon;
  return (
    <div className={`relative flex flex-col items-center gap-1.5 rounded-lg border ${stage.borderColor} ${stage.bgColor} px-4 py-3 transition-colors hover:brightness-125`}>
      <Icon className={`h-5 w-5 ${stage.color}`} />
      <span className="text-[11px] font-medium text-slate-300">{stage.label}</span>
      {badge && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-900">
          {badge}
        </span>
      )}
    </div>
  );
}

function ToolCard({ name, description }: { name: string; description: string }) {
  const colorClass = TOOL_COLORS[name] ?? 'bg-slate-700/50 text-slate-300 border-slate-600/50';
  return (
    <div className={`rounded-lg border px-3 py-2 ${colorClass}`}>
      <div className="text-xs font-semibold">{name}</div>
      <div className="text-[10px] opacity-70 mt-0.5 line-clamp-2">{description}</div>
    </div>
  );
}

function RecommendationRow({
  category,
  recommendation,
  priority,
}: {
  category: string;
  recommendation: string;
  priority: string;
}) {
  const priorityColor = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS['low'];
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-medium border shrink-0 ${priorityColor}`}>
        {priority}
      </span>
      <span className="text-slate-500 shrink-0">{category}:</span>
      <span className="text-slate-300">{recommendation}</span>
    </div>
  );
}
