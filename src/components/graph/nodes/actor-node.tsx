'use client';

import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { User } from 'lucide-react';
import type { ComplianceStatus } from './service-node';
import { borderColors } from './service-node';

export type ActorNodeData = {
  label: string;
  description: string;
  complianceStatus: ComplianceStatus;
  nodeType: string;
};

export type ActorNodeType = Node<ActorNodeData, 'actor'>;

export function ActorNode({ data }: NodeProps<ActorNodeType>) {
  return (
    <div
      className={`bg-slate-800 border-2 ${borderColors[data.complianceStatus]} rounded-lg min-w-36 overflow-hidden`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="bg-orange-900/40 border-b border-orange-700/30 px-2 py-1 flex items-center gap-1.5">
        <User className="h-3 w-3 text-orange-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-orange-300 uppercase tracking-wider">Actor</span>
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
