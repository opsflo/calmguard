'use client';

import {
  Search,
  Shield,
  GitBranch,
  BarChart3,
  Layers,
  Activity,
  Play,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import type { AgentEvent, Severity } from '@/lib/agents/types';

// ---------------------------------------------------------------------------
// Icon registry — maps agent.icon field to Lucide component
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, LucideIcon> = {
  search: Search,
  shield: Shield,
  'git-branch': GitBranch,
  'bar-chart': BarChart3,
  layers: Layers,
};

function resolveIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Activity;
}

// ---------------------------------------------------------------------------
// Severity badge styling
// ---------------------------------------------------------------------------
const SEVERITY_STYLES: Record<Severity, string> = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/50',
  high: 'bg-orange-500/20 text-orange-400 border border-orange-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/50',
  low: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
  info: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50',
};

// ---------------------------------------------------------------------------
// Timestamp formatter — ISO 8601 → HH:MM:SS
// ---------------------------------------------------------------------------
function formatTime(isoTimestamp: string): string {
  try {
    const date = new Date(isoTimestamp);
    return date.toTimeString().slice(0, 8); // "HH:MM:SS"
  } catch {
    return '--:--:--';
  }
}

// ---------------------------------------------------------------------------
// AgentFeedEvent props
// ---------------------------------------------------------------------------
export interface AgentFeedEventProps {
  event: AgentEvent;
  /** Position index in the feed list — used for staggered animation delay */
  index: number;
}

// ---------------------------------------------------------------------------
// AgentFeedEvent component
// ---------------------------------------------------------------------------
export function AgentFeedEvent({ event, index }: AgentFeedEventProps) {
  const IconComponent = resolveIcon(event.agent.icon);

  // Cap stagger delay so old events don't wait forever
  const animationDelay = `${Math.min(index * 50, 500)}ms`;

  // Event-type-specific row background
  const rowBg = event.type === 'error' ? 'bg-red-500/5' : '';

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg animate-slide-in-right ${rowBg}`}
      style={{ animationDelay }}
    >
      {/* Agent icon */}
      <div className="mt-0.5 shrink-0">
        <IconComponent
          className="h-4 w-4"
          style={{ color: event.agent.color }}
          aria-hidden="true"
        />
      </div>

      {/* Middle column: header + message */}
      <div className="flex-1 min-w-0">
        {/* Header row: agent name + timestamp */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-semibold text-slate-200 truncate">
            {event.agent.displayName}
          </span>
          <span className="text-xs text-slate-500 shrink-0 font-mono">
            {formatTime(event.timestamp)}
          </span>
        </div>

        {/* Message row */}
        <div className="flex items-center gap-2">
          {event.type === 'started' && (
            <Play className="h-3 w-3 text-slate-500 shrink-0" aria-hidden="true" />
          )}
          {event.type === 'completed' && (
            <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" aria-hidden="true" />
          )}

          <span className="text-xs text-slate-400 leading-relaxed">
            {event.message ?? ''}
            {event.type === 'thinking' && (
              <span className="animate-pulse ml-1 text-slate-500">...</span>
            )}
          </span>
        </div>
      </div>

      {/* Right: severity badge (only for finding events with severity) */}
      {event.type === 'finding' && event.severity && (
        <div className="shrink-0 mt-0.5">
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${SEVERITY_STYLES[event.severity]}`}
          >
            {event.severity}
          </span>
        </div>
      )}
    </div>
  );
}
