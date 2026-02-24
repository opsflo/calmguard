import { create } from 'zustand';
import type { CalmDocument } from '@/lib/calm/types';
import type { AnalysisInput } from '@/lib/calm/extractor';
import type { ParseError } from '@/lib/calm/parser';
import type { AnalysisResult } from '@/lib/agents/orchestrator';
import type { AgentEvent } from '@/lib/agents/types';

type AnalysisStatus = 'idle' | 'loading' | 'parsed' | 'analyzing' | 'complete' | 'error';

interface AnalysisState {
  // Data
  selectedDemoId: string | null;
  rawCalmData: CalmDocument | null;
  analysisInput: AnalysisInput | null;
  analysisResult: AnalysisResult | null;
  agentEvents: AgentEvent[];
  activeAgents: string[];
  selectedFrameworks: string[];

  // Status
  status: AnalysisStatus;
  error: ParseError['error'] | null;

  // Actions
  setSelectedDemo: (demoId: string) => void;
  setCalmData: (data: CalmDocument, input: AnalysisInput) => void;
  setStatus: (status: AnalysisStatus) => void;
  setError: (error: ParseError['error']) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  addAgentEvent: (event: AgentEvent) => void;
  startAnalysis: () => void;
  clearAgentEvents: () => void;
  setSelectedFrameworks: (frameworks: string[]) => void;
  toggleFramework: (framework: string) => void;
  reset: () => void;
}

const initialState = {
  selectedDemoId: null,
  rawCalmData: null,
  analysisInput: null,
  analysisResult: null,
  agentEvents: [] as AgentEvent[],
  activeAgents: [] as string[],
  selectedFrameworks: ['SOX', 'PCI-DSS', 'NIST-CSF', 'CCC'] as string[],
  status: 'idle' as AnalysisStatus,
  error: null,
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  ...initialState,

  setSelectedDemo: (demoId) =>
    set({
      selectedDemoId: demoId,
      rawCalmData: null,
      analysisInput: null,
      error: null,
    }),

  setCalmData: (data, input) =>
    set({
      rawCalmData: data,
      analysisInput: input,
      status: 'parsed',
      error: null,
    }),

  setStatus: (status) =>
    set({ status }),

  setError: (error) =>
    set({
      error,
      status: 'error',
    }),

  setAnalysisResult: (result) =>
    set({
      analysisResult: result,
      status: 'complete',
    }),

  addAgentEvent: (event) =>
    set((state) => {
      // Update active agents based on event type
      let activeAgents = [...state.activeAgents];

      if (event.type === 'started') {
        // Add agent to active list if not already present
        if (!activeAgents.includes(event.agent.name)) {
          activeAgents.push(event.agent.name);
        }
      } else if (event.type === 'completed' || event.type === 'error') {
        // Remove agent from active list
        activeAgents = activeAgents.filter((name) => name !== event.agent.name);
      }

      return {
        agentEvents: [...state.agentEvents, event],
        activeAgents,
      };
    }),

  startAnalysis: () =>
    set({
      status: 'analyzing',
      agentEvents: [],
      analysisResult: null,
      activeAgents: [],
    }),

  clearAgentEvents: () =>
    set({
      agentEvents: [],
      activeAgents: [],
    }),

  setSelectedFrameworks: (frameworks) =>
    set({ selectedFrameworks: frameworks }),

  toggleFramework: (framework) =>
    set((state) => {
      // Prevent removing the last framework
      if (state.selectedFrameworks.length === 1 && state.selectedFrameworks.includes(framework)) {
        return state;
      }
      const isSelected = state.selectedFrameworks.includes(framework);
      return {
        selectedFrameworks: isSelected
          ? state.selectedFrameworks.filter((f) => f !== framework)
          : [...state.selectedFrameworks, framework],
      };
    }),

  reset: () => set(initialState),
}));

export type { AnalysisState, AnalysisStatus };

// ---------------------------------------------------------------------------
// Derived Selectors (standalone functions — not store state)
// ---------------------------------------------------------------------------

/**
 * List of canonical agent names used throughout the system.
 * Matches the `name` field in each agent's YAML definition.
 */
export const AGENT_NAMES = [
  'architecture-analyzer',
  'compliance-mapper',
  'pipeline-generator',
  'risk-scorer',
] as const;

/** Human-readable display names keyed by agent name. Used in sidebar and event feeds. */
export const AGENT_DISPLAY_NAMES: Record<string, string> = {
  'architecture-analyzer': 'Architecture Analyzer',
  'compliance-mapper': 'Compliance Mapper',
  'pipeline-generator': 'Pipeline Generator',
  'risk-scorer': 'Risk Scorer',
};

/**
 * Derive per-agent status from agentEvents array.
 *
 * Used by Sidebar to show colored dots:
 *   idle    → gray
 *   running → blue (pulse)
 *   complete → green
 *   error    → red
 *
 * @param agentEvents - All events in the current analysis session
 * @param activeAgents - Agent names currently running (maintained by store)
 * @param agentName - The specific agent to query status for
 */
export function getAgentStatus(
  agentEvents: AgentEvent[],
  activeAgents: string[],
  agentName: string,
): 'idle' | 'running' | 'complete' | 'error' {
  // Check if agent has any events at all
  const agentEvts = agentEvents.filter((e) => e.agent.name === agentName);
  if (agentEvts.length === 0) return 'idle';

  // Check the most recent event type for this agent
  const lastEvent = agentEvts[agentEvts.length - 1];
  if (lastEvent.type === 'completed') return 'complete';
  if (lastEvent.type === 'error') return 'error';

  // Agent has events but hasn't completed/errored — check if actively running
  if (activeAgents.includes(agentName)) return 'running';

  return 'idle';
}
