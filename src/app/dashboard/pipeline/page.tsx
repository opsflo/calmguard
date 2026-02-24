'use client';

import { PipelinePreview } from '@/components/dashboard/pipeline-preview';

export default function PipelinePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Pipeline</h1>
        <p className="text-sm text-slate-400">
          Generated CI/CD pipeline configurations and security scanning templates
        </p>
      </div>
      <PipelinePreview />
    </div>
  );
}
