'use client';

import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { Activity } from 'lucide-react';
import type { ComplianceStatus } from './service-node';
import { borderColors } from './service-node';

export type DefaultNodeData = {
  label: string;
  description: string;
  complianceStatus: ComplianceStatus;
  nodeType: string;
};

export type DefaultNodeType = Node<DefaultNodeData, 'default'>;

const nodeTypeLabels: Record<string, string> = {
  network: 'Network',
  ldap: 'LDAP',
  'data-asset': 'Data Asset',
};

export function DefaultNode({ data }: NodeProps<DefaultNodeType>) {
  const typeLabel = nodeTypeLabels[data.nodeType] ?? data.nodeType;

  return (
    <div
      className={`bg-slate-800 border-2 ${borderColors[data.complianceStatus]} rounded-lg min-w-36 overflow-hidden`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="bg-slate-700/50 border-b border-slate-600/40 px-2 py-1 flex items-center gap-1.5">
        <Activity className="h-3 w-3 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{typeLabel}</span>
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
