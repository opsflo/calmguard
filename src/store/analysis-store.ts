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
  reset: () => void;
}

const initialState = {
  selectedDemoId: null,
  rawCalmData: null,
  analysisInput: null,
  analysisResult: null,
  agentEvents: [] as AgentEvent[],
  activeAgents: [] as string[],
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

  reset: () => set(initialState),
}));

export type { AnalysisState, AnalysisStatus };
