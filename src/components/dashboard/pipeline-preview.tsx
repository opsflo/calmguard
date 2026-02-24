'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, Download, AlertTriangle } from 'lucide-react';
import { codeToHtml } from 'shiki/bundle/web';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysisStore } from '@/store/analysis-store';
import type { PipelineConfig } from '@/lib/agents/pipeline-generator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PipelinePreviewProps {
  /** Compact mode for overview page — limits height, hides download button */
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Helper — derive raw content per tab
// ---------------------------------------------------------------------------

function getRawContent(tab: string, pipelineConfig: PipelineConfig): string {
  switch (tab) {
    case 'github':
      return pipelineConfig.githubActions.yaml;
    case 'security':
      return pipelineConfig.securityScanning.tools
        .map((t) => `# ${t.name}\n${t.config}`)
        .join('\n---\n');
    case 'infra':
      return pipelineConfig.infrastructureAsCode.config;
    default:
      return '';
  }
}

function getFilename(tab: string, pipelineConfig: PipelineConfig): string {
  switch (tab) {
    case 'github':
      return 'github-actions.yml';
    case 'security':
      return 'security-scanning.yml';
    case 'infra':
      return `infrastructure.${pipelineConfig.infrastructureAsCode.provider === 'terraform' ? 'tf' : 'yml'}`;
    default:
      return 'pipeline.yml';
  }
}

// ---------------------------------------------------------------------------
// Skeleton code block — shown while shiki is loading
// ---------------------------------------------------------------------------

function CodeSkeleton() {
  return (
    <div className="p-4 space-y-2 font-mono text-xs">
      <Skeleton className="h-3 w-1/4 bg-slate-700/50" />
      <Skeleton className="h-3 w-1/3 bg-slate-700/50" />
      <Skeleton className="h-3 w-2/5 bg-slate-700/50" />
      <div className="pl-4 space-y-2 mt-2">
        <Skeleton className="h-3 w-1/2 bg-slate-700/50" />
        <Skeleton className="h-3 w-3/5 bg-slate-700/50" />
        <Skeleton className="h-3 w-2/3 bg-slate-700/50" />
      </div>
      <Skeleton className="h-3 w-1/3 bg-slate-700/50 mt-2" />
      <div className="pl-4 space-y-2 mt-2">
        <Skeleton className="h-3 w-3/4 bg-slate-700/50" />
        <Skeleton className="h-3 w-2/3 bg-slate-700/50" />
      </div>
      <Skeleton className="h-3 w-1/4 bg-slate-700/50 mt-2" />
      <Skeleton className="h-3 w-1/5 bg-slate-700/50" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PipelinePreview({ compact = false }: PipelinePreviewProps) {
  const analysisResult = useAnalysisStore((state) => state.analysisResult);
  const status = useAnalysisStore((state) => state.status);

  const pipelineConfig = analysisResult?.pipeline ?? null;

  const [activeTab, setActiveTab] = useState('github');
  const [highlightedHtml, setHighlightedHtml] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Pre-compute highlighted HTML for all 3 tabs when pipelineConfig arrives
  useEffect(() => {
    if (!pipelineConfig) return;

    let cancelled = false;

    async function highlight() {
      try {
        const infraLang =
          pipelineConfig!.infrastructureAsCode.provider === 'terraform' ? 'hcl' : 'yaml';

        const secContent = pipelineConfig!.securityScanning.tools
          .map((t: { name: string; config: string }) => `# ${t.name}\n${t.config}`)
          .join('\n---\n');

        const [ghHtml, secHtml, infraHtml] = await Promise.all([
          codeToHtml(pipelineConfig!.githubActions.yaml || '# No GitHub Actions YAML generated', {
            lang: 'yaml',
            theme: 'github-dark',
          }),
          codeToHtml(secContent || '# No security scanning config generated', {
            lang: 'yaml',
            theme: 'github-dark',
          }),
          codeToHtml(pipelineConfig!.infrastructureAsCode.config || '# No infrastructure config generated', {
            lang: infraLang,
            theme: 'github-dark',
          }),
        ]);

        if (!cancelled) {
          setHighlightedHtml({ github: ghHtml, security: secHtml, infra: infraHtml });
        }
      } catch (err) {
        // Shiki failed — fall back to plain text rendering
        console.error('Shiki highlighting failed:', err);
        if (!cancelled) {
          const wrapPlain = (code: string) =>
            `<pre class="p-4 bg-transparent"><code class="leading-relaxed">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

          const secContent = pipelineConfig!.securityScanning.tools
            .map((t: { name: string; config: string }) => `# ${t.name}\n${t.config}`)
            .join('\n---\n');

          setHighlightedHtml({
            github: wrapPlain(pipelineConfig!.githubActions.yaml || '# No content'),
            security: wrapPlain(secContent || '# No content'),
            infra: wrapPlain(pipelineConfig!.infrastructureAsCode.config || '# No content'),
          });
        }
      }
    }

    void highlight();

    return () => { cancelled = true; };
  }, [pipelineConfig]);

  // Copy to clipboard handler
  const handleCopy = async () => {
    if (!pipelineConfig) return;
    await navigator.clipboard.writeText(getRawContent(activeTab, pipelineConfig));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download file handler
  const handleDownload = () => {
    if (!pipelineConfig) return;
    const content = getRawContent(activeTab, pipelineConfig);
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = getFilename(activeTab, pipelineConfig);
    a.click();
    URL.revokeObjectURL(url); // revoke immediately to prevent memory leak
  };

  // Code display max height
  const codeMaxH = compact ? 'max-h-[200px]' : 'max-h-96';

  // Empty state — no analysis run yet
  if (status === 'idle' || status === 'parsed' || status === 'loading') {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-medium text-slate-400">Pipeline Preview</h3>
          <div className="bg-slate-900 rounded-lg">
            <CodeSkeleton />
          </div>
        </div>
      </Card>
    );
  }

  // Analyzing state — show animated skeleton with progress indicator
  if (status === 'analyzing' && !pipelineConfig) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-slate-400">Pipeline Preview</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-blue-400 animate-pulse">Generating...</span>
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg relative overflow-hidden">
            <CodeSkeleton />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent animate-shimmer" />
          </div>
        </div>
      </Card>
    );
  }

  // Graceful degradation — analysis ran but pipeline agent failed
  if (status === 'complete' && !pipelineConfig) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-400">
            Pipeline data unavailable — pipeline generator agent failed
          </p>
        </div>
      </Card>
    );
  }

  const isHighlighting = Object.keys(highlightedHtml).length === 0;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <div className="p-6">
        {/* Header: title + action buttons */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400">Pipeline Preview</h3>
          <div className="flex items-center gap-1">
            {/* Copy button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void handleCopy()}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            {/* Download button — hidden in compact mode */}
            {!compact && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="bg-slate-900 border border-slate-700 h-8 p-0.5 mb-3">
            <TabsTrigger
              value="github"
              className="h-7 px-3 text-xs text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 rounded"
            >
              GitHub Actions
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="h-7 px-3 text-xs text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 rounded"
            >
              Security Scanning
            </TabsTrigger>
            <TabsTrigger
              value="infra"
              className="h-7 px-3 text-xs text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 rounded"
            >
              Infrastructure
            </TabsTrigger>
          </TabsList>

          {(['github', 'security', 'infra'] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {isHighlighting ? (
                <div className="bg-slate-900 rounded-lg">
                  <CodeSkeleton />
                </div>
              ) : (
                <div
                  className={`text-xs font-mono overflow-auto ${codeMaxH} [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:bg-transparent [&_code]:leading-relaxed`}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: highlightedHtml[tab] ?? '' }}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Card>
  );
}
