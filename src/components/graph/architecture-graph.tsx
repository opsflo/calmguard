'use client';

import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
} from '@xyflow/react';
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

/** Dwell time on each node before moving to the next (ms) */
const TOUR_DWELL_MS = 4000;
/** Zoom level when focused on a single node */
const TOUR_ZOOM = 1.0;
/** Stop touring after this many full loops */
const TOUR_MAX_LOOPS = 2;

/**
 * TouringCamera — pans/zooms to each node in sequence while analysis runs.
 * Runs inside ReactFlowProvider so useReactFlow() is available.
 */
function TouringCamera({ nodes, isAnalyzing }: { nodes: Node[]; isAnalyzing: boolean }) {
  const { setCenter, fitView } = useReactFlow();
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tourableNodes = useMemo(
    () => nodes.filter((n) => n.type !== 'trustBoundary'),
    [nodes],
  );

  const visitNext = useCallback(() => {
    if (tourableNodes.length === 0) return;

    // Stop after max loops — zoom back out and hold
    const maxVisits = tourableNodes.length * TOUR_MAX_LOOPS;
    if (indexRef.current >= maxVisits) {
      if (timerRef.current) clearInterval(timerRef.current);
      fitView({ padding: 0.4, duration: 800 });
      return;
    }

    const node = tourableNodes[indexRef.current % tourableNodes.length];
    const x = (node.position?.x ?? 0) + ((node.measured?.width ?? 200) / 2);
    const y = (node.position?.y ?? 0) + ((node.measured?.height ?? 100) / 2);
    setCenter(x, y, { zoom: TOUR_ZOOM, duration: 1200 });
    indexRef.current += 1;
  }, [tourableNodes, setCenter, fitView]);

  useEffect(() => {
    if (!isAnalyzing || tourableNodes.length === 0) {
      // When analysis ends, zoom back out to full view
      if (!isAnalyzing && tourableNodes.length > 0) {
        fitView({ padding: 0.4, duration: 800 });
      }
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Start tour: visit first node, then cycle
    indexRef.current = 0;
    visitNext();
    timerRef.current = setInterval(visitNext, TOUR_DWELL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnalyzing, tourableNodes.length, visitNext, fitView]);

  return null;
}

interface ArchitectureGraphProps {
  compact?: boolean;
}

/**
 * Inner graph component rendered inside ReactFlowProvider.
 * Separated so TouringCamera can use useReactFlow().
 */
function ArchitectureGraphInner({ compact = false }: ArchitectureGraphProps) {
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

  return (
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
      <TouringCamera nodes={nodes} isAnalyzing={isAnalyzing} />
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
  );
}

export const ArchitectureGraph = memo(function ArchitectureGraph({ compact = false }: ArchitectureGraphProps) {
  const analysisInput = useAnalysisStore((state) => state.analysisInput);

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
      <ReactFlowProvider>
        <ArchitectureGraphInner compact={compact} />
      </ReactFlowProvider>
    </div>
  );
});
