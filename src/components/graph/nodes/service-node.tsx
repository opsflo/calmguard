'use client';

import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { Server } from 'lucide-react';

export type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | 'unknown';

export const borderColors: Record<ComplianceStatus, string> = {
  compliant: 'border-emerald-500',
  partial: 'border-amber-500',
  'non-compliant': 'border-red-500',
  unknown: 'border-slate-600',
};

export type ServiceNodeData = {
  label: string;
  description: string;
  complianceStatus: ComplianceStatus;
  nodeType: string;
};

export type ServiceNodeType = Node<ServiceNodeData, 'service'>;

export function ServiceNode({ data }: NodeProps<ServiceNodeType>) {
  return (
    <div
      className={`bg-slate-800 border-2 ${borderColors[data.complianceStatus]} rounded-lg min-w-36 overflow-hidden`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="bg-blue-900/40 border-b border-blue-700/30 px-2 py-1 flex items-center gap-1.5">
        <Server className="h-3 w-3 text-blue-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Service</span>
      </div>
      <div className="px-3 py-2">
        <div className="text-xs font-medium text-slate-200 leading-tight">{data.label}</div>
        {data.description && (
          <div className="text-xs text-slate-500 mt-0.5 leading-tight line-clamp-2">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
