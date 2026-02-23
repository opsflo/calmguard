'use client';

import type { Node, NodeProps } from '@xyflow/react';

export type TrustBoundaryNodeData = {
  label: string;
  boundaryType: 'network' | 'security-zone' | 'deployment' | 'organizational';
};

export type TrustBoundaryNodeType = Node<TrustBoundaryNodeData, 'trustBoundary'>;

const boundaryTypeColors: Record<TrustBoundaryNodeData['boundaryType'], string> = {
  network: 'border-blue-500/40 text-blue-400',
  'security-zone': 'border-amber-500/40 text-amber-400',
  deployment: 'border-teal-500/40 text-teal-400',
  organizational: 'border-violet-500/40 text-violet-400',
};

export function TrustBoundaryNode({ data }: NodeProps<TrustBoundaryNodeType>) {
  const colorClass = boundaryTypeColors[data.boundaryType] ?? 'border-slate-500/40 text-slate-400';

  return (
    <div
      className={`border-dashed border-2 ${colorClass} bg-slate-900/30 rounded-lg w-full h-full relative`}
    >
      <div className="absolute top-1.5 left-2.5 flex items-center gap-1.5">
        <span className={`text-xs font-medium ${colorClass.split(' ')[1]}`}>{data.label}</span>
        <span className="text-xs text-slate-600 capitalize">({data.boundaryType})</span>
      </div>
    </div>
  );
}
