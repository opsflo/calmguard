'use client';

import { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAnalysisStore } from '@/store/analysis-store';
import { calmToFlow } from './utils/calm-to-flow';

// Custom node components
import { ServiceNode } from './nodes/service-node';
import { DatabaseNode } from './nodes/database-node';
import { WebClientNode } from './nodes/webclient-node';
import { ActorNode } from './nodes/actor-node';
import { SystemNode } from './nodes/system-node';
import { TrustBoundaryNode } from './nodes/trust-boundary-node';
import { DefaultNode } from './nodes/default-node';

// Custom edge components
import { ProtocolEdge } from './edges/protocol-edge';

/**
 * nodeTypes defined OUTSIDE the component to prevent referential equality
 * changes on every render — React Flow would remount all nodes otherwise.
 * See research Pitfall #4.
 */
const nodeTypes = {
  service: ServiceNode,
  database: DatabaseNode,
  webclient: WebClientNode,
  actor: ActorNode,
  system: SystemNode,
  trustBoundary: TrustBoundaryNode,
  default: DefaultNode,
} as const;

const edgeTypes = {
  protocol: ProtocolEdge,
} as const;

/**
 * ArchitectureGraph
 *
 * React Flow wrapper that renders the CALM architecture as an interactive
 * node-edge diagram. Reads directly from Zustand store:
 * - analysisInput: provides nodes and relationships to visualize
 * - analysisResult: provides trust boundary groupings and compliance coloring
 * - status: when 'analyzing', all edges animate
 *
 * Uses dagre LR auto-layout — nodes are not manually draggable (auto-layout only).
 */
interface ArchitectureGraphProps {
  compact?: boolean;
}

export function ArchitectureGraph({ compact = false }: ArchitectureGraphProps) {
  const analysisInput = useAnalysisStore((state) => state.analysisInput);
  const analysisResult = useAnalysisStore((state) => state.analysisResult);
  const status = useAnalysisStore((state) => state.status);

  const isAnalyzing = status === 'analyzing';

  // Transform CALM data into React Flow nodes/edges with dagre layout
  const { nodes, edges } = useMemo(() => {
    if (!analysisInput) return { nodes: [], edges: [] };

    const architectureAnalysis = analysisResult?.architecture ?? null;
    const riskAssessment = analysisResult?.risk ?? null;

    return calmToFlow(analysisInput, architectureAnalysis, riskAssessment);
  }, [analysisInput, analysisResult]);

  // Animate edges while analysis is running
  const animatedEdges = useMemo(
    () => edges.map((edge) => ({ ...edge, animated: isAnalyzing })),
    [edges, isAnalyzing]
  );

  // Empty state when no architecture is loaded
  if (!analysisInput) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-900/50 rounded-lg border border-dashed border-slate-700">
        <div className="text-center">
          <p className="text-slate-400 text-sm">Load an architecture to view graph</p>
          <p className="text-slate-600 text-xs mt-1">Select a demo or upload a CALM JSON file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px]">
      <ReactFlow
        nodes={nodes}
        edges={animatedEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        maxZoom={1.2}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#334155" gap={16} />
        {!compact && (
          <Controls className="!bg-slate-800 !border-slate-700 !rounded-lg" />
        )}
        {!compact && (
          <MiniMap
            nodeColor={(node) => {
              const complianceStatus = (node.data as { complianceStatus?: string })?.complianceStatus;
              switch (complianceStatus) {
                case 'compliant':
                  return '#10b981'; // emerald-500
                case 'partial':
                  return '#f59e0b'; // amber-500
                case 'non-compliant':
                  return '#ef4444'; // red-500
                default:
                  return '#475569'; // slate-600
              }
            }}
            className="!bg-slate-900 !border-slate-700 !rounded-lg"
          />
        )}
      </ReactFlow>
    </div>
  );
}
