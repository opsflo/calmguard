# Phase 6: Polish, Demo Mode & Deployment - Research

**Researched:** 2026-02-24
**Domain:** UX polish, animations, file upload, Vercel deployment, CALM validation
**Confidence:** HIGH (existing codebase fully audited + official Vercel docs verified)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Demo Mode Flow**
- "Run Demo" button is a prominent CTA on the landing page hero section
- Clicking transitions directly into the dashboard with the trading platform analysis running
- Dramatic 1-2 second pauses between agent phases so judges can see each agent activate — builds tension
- Critical/high-risk findings get a brief glow animation and a "KEY FINDING" badge in the agent feed
- On completion, a summary card slides in showing overall score and key stats with a prominent "Export Report" button
- Dashboard stays visible behind the summary card

**CALM Upload Experience**
- Dedicated drag-and-drop section in the left sidebar, always accessible while viewing the dashboard
- Inline status indicator in the sidebar drop zone: parsing → validating via calm-cli → ready
- Validation errors appear inline with specific line/field information
- Offer 2-3 preset example CALM files via dropdown (e.g., trading platform, simple microservice, data pipeline) so judges can see variety
- Presets are selectable alongside the upload option

**Animation Choreography**
- Cinematic and deliberate overall feel — slower, dramatic animations
- Compliance score uses odometer-style digit roll: each digit rolls independently like a slot machine, ones place spins fast, tens place slower
- Score counting animation takes 2-3 seconds with easing
- Cascading animation sequence: sidebar agent dot lights up → feed items slide in → graph nodes color → heat map fills → score updates
- Architecture graph nodes transition from gray to compliance color with smooth CSS transitions
- Agent feed events slide in from right with fade animation (already implemented)
- Heat map cells fade from gray to their color as data arrives (already partially implemented)
- Pipeline preview code appears line-by-line with syntax highlighting applied per line, short delay between lines

**Export Report**
- Executive summary + detailed sections format
- Sections: overall compliance score, architecture summary (nodes, relationships, flows), compliance findings by framework, generated pipeline config, actionable recommendations
- Branded header with CALMGuard logo/name, tagline, analysis date, and architecture name
- Preview rendered report in a modal/panel first, then user confirms download
- Downloads as a .md file

### Claude's Discretion
- Error recovery strategy when calm-cli validation fails on uploaded files (show errors and allow re-upload vs best-effort analysis)
- Exact easing curves and timing values for animations
- Loading skeleton and transition designs between states
- React.memo optimization boundaries
- Vercel deployment configuration details
- Responsive layout adjustments for 1366x768

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CALM-04 | User can upload custom CALM JSON file via drag-and-drop with validation feedback | HTML5 drag-drop API + inline validation display; no external library needed |
| CALM-05 | System integrates with @finos/calm-cli to validate uploaded architectures against official CALM schema | calm-cli is CLI-only — must spawn child_process in Next.js API route (Node.js runtime, not Edge) |
| DEMO-01 | "Run Demo" button on landing page auto-selects trading platform architecture | Modify landing page.tsx: add "Run Demo" CTA that sets Zustand state + navigates to /dashboard with auto-start flag |
| DEMO-02 | Demo mode runs analysis with slight delays between agent events for dramatic effect | Add `demoMode` flag to store; orchestrator adds `sleep()` calls between agent phases when flag is set |
| DEMO-03 | Demo highlights key findings as they appear | Extend AgentFeedEvent: when `demoMode=true`, critical/high findings get glow + "KEY FINDING" badge |
| DEMO-04 | "Export Report" button generates downloadable markdown summary | Client-side Blob download from AnalysisResult data; modal preview first using shadcn Dialog |
| ANIM-01 | Compliance score counts up digit-by-digit with easing | Replace current linear useCountUp with odometer-style OdometerDigit component using CSS translateY animation |
| ANIM-02 | Architecture graph nodes transition from gray to compliance color with smooth CSS transition | React Flow node custom components already use inline style; add CSS transition on border-color |
| ANIM-03 | Agent feed events slide in from right with fade animation | Already implemented via `animate-slide-in-right` CSS animation in globals.css |
| ANIM-04 | Heat map cells fade from gray to their color as data arrives | HeatMapCell already has `transition-colors duration-700 ease-in-out`; needs staggered reveal timing |
| ANIM-05 | Pipeline preview code appears with typewriter effect | Replace current full-dump syntax highlight with line-by-line reveal using setInterval + shiki per-line |
| INFRA-01 | Application deploys to Vercel with SSE streaming working in production | Add `export const maxDuration = 300` to analyze route; Vercel Fluid Compute handles SSE duration |
</phase_requirements>

---

## Summary

Phase 6 is a UX and deployment phase, not a backend systems phase. The core data pipeline (agents, SSE, store, compliance, graph) is fully operational from Phases 1-5. This phase polishes the experience: demo mode choreography, file upload, CALM validation via CLI subprocess, odometer animations, export report, and Vercel deployment configuration.

The most significant implementation decision this phase concerns `@finos/calm-cli` integration for CALM-05. The CLI exposes NO programmatic API — it is a pure CLI tool with `dist/index.js` as both its bin and main entry, and no exported TypeScript functions. Integration requires spawning it as a child process from a Next.js API route using Node.js runtime (not Edge). This affects architecture: a dedicated `/api/calm/validate` route (Node.js runtime) spawns `calm validate`, writes temp files, parses stdout JSON, then cleans up. This approach is confined to the server and never touches client code.

For Vercel deployment, the `/api/analyze` SSE route currently has no `maxDuration` export. With Vercel Fluid Compute (enabled by default), the default is 300 seconds — but explicitly exporting `maxDuration = 300` in the route segment config is required to prevent silent truncation on deploys. Fluid Compute makes SSE streaming over Node.js serverless functions viable without Edge Runtime.

**Primary recommendation:** Tackle in this order: (1) Vercel config + `maxDuration` in analyze route, (2) CALM upload with calm-cli subprocess, (3) Demo mode with orchestrator sleep, (4) Animations (odometer, heat map stagger, pipeline typewriter), (5) Export report modal, (6) Final React.memo audit and layout checks.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Already installed (pnpm) | — | All animation work done with Tailwind v4 + custom CSS keyframes | Project convention; no animation library needed |
| `@finos/calm-cli` | latest | CALM schema validation — spawned as child process | Required by CALM-05 requirement |
| `child_process` (Node.js built-in) | Node.js 22 built-in | Spawn `calm validate` subprocess in API route | Only viable integration path for CLI-only tool |
| Vercel platform | — | Deployment + SSE streaming via Fluid Compute | Specified in INFRA-01; CLAUDE.md |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `shadcn/ui Dialog` | Already installed (via Radix) | Export Report preview modal | Radix `@radix-ui/react-dialog` is a devDependency via shadcn already |
| Tailwind v4 `@keyframes` | Already installed | Odometer digit roll, stagger reveals | CSS-only approach; no JS animation library needed |
| `react-slot-counter` | ^3.x | Optional odometer digits — only if pure CSS approach is insufficient | Use only if CSS translateY slot machine is too complex |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| child_process calm-cli | Direct Zod validation against CALM JSON schema | Would duplicate schema definition already maintained by FINOS; calm-cli is authoritative |
| CSS keyframes odometer | `react-slot-counter` npm package | Library adds ~10KB; CSS is zero-cost but more complex to author; either works |
| Blob/URL.createObjectURL for export | Next.js `/api/export` route | Server route is unnecessary — all data is already in Zustand client state; Blob is simpler |
| shadcn Dialog for report preview | Custom modal overlay | Dialog is already in the component library via Radix; no new dependency |

**Installation (only new dependency):**
```bash
pnpm add @finos/calm-cli
```

---

## Architecture Patterns

### Recommended Project Structure for Phase 6

```
src/
  app/
    page.tsx                     # MODIFIED: Add "Run Demo" CTA button
    api/
      calm/
        validate/
          route.ts               # NEW: POST /api/calm/validate — spawns calm-cli
      analyze/
        route.ts                 # MODIFIED: Add export const maxDuration = 300
  lib/
    calm/
      cli-validator.ts           # NEW: calm-cli subprocess wrapper
    demo/
      demo-mode.ts               # NEW: Demo mode helpers (sleep, auto-start logic)
  store/
    analysis-store.ts            # MODIFIED: Add demoMode flag, uploadedCalmData state
  components/
    calm/
      architecture-selector.tsx  # MODIFIED: Add "Run Demo" button
      calm-upload-zone.tsx       # NEW: Drag-and-drop upload with validation
    dashboard/
      sidebar.tsx                # MODIFIED: Add upload zone section
      agent-feed-event.tsx       # MODIFIED: KEY FINDING badge in demo mode
      compliance-card.tsx        # MODIFIED: Replace useCountUp with OdometerScore
    ui/
      odometer-score.tsx         # NEW: Digit-roll animation component
      export-report-modal.tsx    # NEW: Report preview + download modal
    graph/
      nodes/                     # MODIFIED: Add CSS transition on node border-color
```

### Pattern 1: calm-cli Subprocess Integration

**What:** Next.js API route (Node.js runtime) writes CALM JSON to a temp file, spawns `calm validate`, reads stdout JSON, returns parsed errors.
**When to use:** CALM-05 requirement; anytime CALM JSON needs official schema validation.

```typescript
// src/lib/calm/cli-validator.ts
// Source: Node.js docs + @finos/calm-cli CLI interface (no programmatic API)
import { execFile } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface CalmValidationResult {
  valid: boolean;
  errors: Array<{ message: string; path?: string }>;
}

export async function validateWithCalmCli(
  calmJson: unknown,
): Promise<CalmValidationResult> {
  // Write CALM JSON to temp file (calm validate requires file path)
  const tmpFile = join(tmpdir(), `calm-validate-${Date.now()}.json`);
  await writeFile(tmpFile, JSON.stringify(calmJson), 'utf-8');

  try {
    // calm validate --format json exits with code 0 if valid, non-zero if errors
    const { stdout } = await execFileAsync('calm', ['validate', '-a', tmpFile, '--format', 'json'], {
      timeout: 15_000, // 15s max for validation
    });
    // stdout is JSON array of validation results
    const results = JSON.parse(stdout) as Array<{ message: string; path?: string }>;
    return { valid: results.length === 0, errors: results };
  } catch (err) {
    // Non-zero exit = validation errors; stdout still contains JSON
    const execError = err as { stdout?: string; code?: number };
    if (execError.stdout) {
      try {
        const results = JSON.parse(execError.stdout) as Array<{ message: string; path?: string }>;
        return { valid: false, errors: results };
      } catch {
        // JSON parse failure = CLI crash, not validation error
      }
    }
    return { valid: false, errors: [{ message: 'calm-cli validation failed to run' }] };
  } finally {
    // Always clean up temp file
    await unlink(tmpFile).catch(() => {});
  }
}
```

```typescript
// src/app/api/calm/validate/route.ts
import { type NextRequest } from 'next/server';
import { validateWithCalmCli } from '@/lib/calm/cli-validator';

// MUST use Node.js runtime (not Edge) — child_process not available in Edge Runtime
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json() as { calm: unknown };
  const result = await validateWithCalmCli(body.calm);
  return Response.json(result);
}
```

### Pattern 2: Demo Mode with Auto-Start

**What:** "Run Demo" on landing page sets store flags, navigates to /dashboard, and the dashboard auto-triggers `startStream` when demoMode is detected.
**When to use:** DEMO-01 and DEMO-02.

```typescript
// Store additions
interface AnalysisState {
  // ... existing
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
}

// Landing page Run Demo button
const handleRunDemo = () => {
  // 1. Select trading-platform architecture
  const demo = DEMO_ARCHITECTURES.find((d) => d.id === 'trading-platform')!;
  const result = parseCalm(demo.data);
  if (result.success) {
    const input = extractAnalysisInput(result.data);
    setCalmData(result.data, input);
    setDemoMode(true);   // NEW flag
    router.push('/dashboard');
  }
};

// Dashboard page: auto-start when demoMode is set
useEffect(() => {
  if (demoMode && rawCalmData && status === 'parsed') {
    // Brief delay for cinematic effect — user sees dashboard load first
    const timer = setTimeout(() => {
      void startStream(rawCalmData, selectedFrameworks);
    }, 800);
    return () => clearTimeout(timer);
  }
}, [demoMode, rawCalmData, status]);
```

### Pattern 3: Odometer Digit Animation

**What:** Each decimal digit of the compliance score rolls vertically through a strip of 0-9 digits, landing on the target value. Ones place spins faster than tens, which is faster than hundreds.
**When to use:** ANIM-01 replacement for `useCountUp` in `ComplianceCard`.

```typescript
// src/components/ui/odometer-score.tsx
// CSS translateY strip approach — no library dependency
// Source: CSS animation pattern from shadcn "Sliding Number" component
'use client';

import { useEffect, useState } from 'react';

interface OdometerDigitProps {
  digit: number;       // Target digit 0-9
  duration?: number;   // Animation duration ms (slower for higher-order digits)
}

function OdometerDigit({ digit, duration = 600 }: OdometerDigitProps) {
  const [displayDigit, setDisplayDigit] = useState(0);

  useEffect(() => {
    setDisplayDigit(digit);
  }, [digit]);

  return (
    <div className="relative overflow-hidden h-[1em] w-[0.65em]">
      <div
        className="absolute flex flex-col"
        style={{
          transform: `translateY(-${displayDigit * 10}%)`,
          transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="h-[1em] flex items-center justify-center">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OdometerScore({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const hundreds = Math.floor(clamped / 100);
  const tens = Math.floor((clamped % 100) / 10);
  const ones = clamped % 10;

  return (
    <div className="flex text-4xl font-bold tabular-nums" aria-label={`${score} out of 100`}>
      {/* Show hundreds only for score === 100 */}
      {clamped === 100 && <OdometerDigit digit={hundreds} duration={2400} />}
      <OdometerDigit digit={tens} duration={1800} />
      <OdometerDigit digit={ones} duration={1200} />
    </div>
  );
}
```

### Pattern 4: Drag-and-Drop Upload Zone in Sidebar

**What:** HTML5 native drag-and-drop + `<input type="file">` click-to-browse. No external library. File is read via `FileReader` API, parsed then sent to `/api/calm/validate`.
**When to use:** CALM-04 implementation.

```typescript
// src/components/calm/calm-upload-zone.tsx
'use client';
import { useRef, useState, useCallback } from 'react';

type UploadStatus = 'idle' | 'parsing' | 'validating' | 'ready' | 'error';

export function CalmUploadZone() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrors(['Only .json files are accepted']);
      setStatus('error');
      return;
    }
    setStatus('parsing');
    setErrors([]);

    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setErrors(['Invalid JSON — file could not be parsed']);
      setStatus('error');
      return;
    }

    // Local Zod parse first (fast feedback)
    const localResult = parseCalm(parsed);
    if (!localResult.success) {
      setErrors(['CALM schema validation failed — check file structure']);
      setStatus('error');
      return;
    }

    // Server-side calm-cli validation (authoritative)
    setStatus('validating');
    const res = await fetch('/api/calm/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calm: parsed }),
    });
    const validation = await res.json() as { valid: boolean; errors: Array<{ message: string }> };

    if (!validation.valid) {
      setErrors(validation.errors.map((e) => e.message));
      setStatus('error');
      return;
    }

    // Valid — update store
    const input = extractAnalysisInput(localResult.data);
    setCalmData(localResult.data, input);
    setStatus('ready');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  }, [processFile]);

  // ... dragover/dragleave handlers, render dropzone UI
}
```

### Pattern 5: Vercel maxDuration for SSE Route

**What:** Export `maxDuration` constant from the analyze route segment to prevent Vercel from terminating the SSE stream before AI agents finish.
**When to use:** INFRA-01 — required for production deployment.

```typescript
// src/app/api/analyze/route.ts — ADD at top of file
export const dynamic = 'force-dynamic';  // already present
export const maxDuration = 300;          // NEW: 300s = 5 minutes; works on Hobby + Pro with Fluid Compute
```

**Verified:** Vercel Fluid Compute (enabled by default as of 2025) provides 300s default on all plans. Explicit export overrides any dashboard-level default. Source: Vercel official docs.

### Pattern 6: Export Report as Markdown Blob

**What:** Client-side generation of a markdown string from Zustand store state, previewed in a Dialog, then downloaded via `Blob + URL.createObjectURL`.
**When to use:** DEMO-04.

```typescript
// src/lib/report/generate-report.ts
import type { AnalysisResult } from '@/lib/agents/orchestrator';
import type { AnalysisInput } from '@/lib/calm/extractor';

export function generateMarkdownReport(
  analysisResult: AnalysisResult,
  analysisInput: AnalysisInput,
  architectureName: string,
  date: string,
): string {
  const { risk, compliance, architecture, pipeline } = analysisResult;

  return `# CALMGuard Compliance Report

> **CALMGuard** — CALM-native continuous compliance platform
> DTCC/FINOS Innovate.DTCC AI Hackathon 2026

---

**Architecture:** ${architectureName}
**Analysis Date:** ${date}
**Overall Score:** ${risk?.overallScore ?? 'N/A'}/100 (${risk?.overallRating ?? 'unknown'})

## Executive Summary

${risk?.executiveSummary ?? 'Analysis incomplete.'}

## Architecture Overview

- **Nodes:** ${analysisInput.metadata.nodeCount}
- **Relationships:** ${analysisInput.metadata.relationshipCount}
- **Flows:** ${analysisInput.flows.length}

## Compliance Findings by Framework

${compliance?.frameworkScores.map((fs) =>
  `### ${fs.framework === 'CCC' ? 'FINOS-CCC' : fs.framework}\n- Score: ${fs.score}%\n- Compliant: ${fs.compliantControls}/${fs.totalControls} controls`
).join('\n\n') ?? 'No compliance data.'}

## Top Findings

${risk?.topFindings.slice(0, 10).map((f, i) =>
  `${i + 1}. **[${f.severity.toUpperCase()}]** ${f.finding}\n   - Recommendation: ${f.recommendation}`
).join('\n\n') ?? 'No findings.'}

## Generated Pipeline

\`\`\`yaml
${pipeline?.githubActions.yaml.slice(0, 2000) ?? '# Pipeline generation failed'}
\`\`\`

## Actionable Recommendations

${pipeline?.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n') ?? 'See findings above.'}

---
*Generated by CALMGuard on ${date}*
`;
}
```

### Anti-Patterns to Avoid

- **Edge Runtime for calm-cli route:** `child_process` is not available in Edge Runtime. The validate route MUST use `export const runtime = 'nodejs'`.
- **Importing calm-cli as a module:** Its `dist/index.js` calls `program.parse(process.argv)` on import — it would hijack the Next.js process if imported directly. NEVER `import '@finos/calm-cli'` directly; always spawn it as a subprocess.
- **Defining nodeTypes/edgeTypes inside ArchitectureGraph:** Already avoided correctly (defined at module level). Do not move them inside the component when adding animations.
- **Animating with JS setInterval per-frame for score:** The existing `useCountUp` RAF approach is fine for the linear counter. The odometer needs CSS transitions, not JS animation frames per digit — CSS GPU compositing is faster.
- **React.memo everywhere blindly:** Apply only to components that re-render due to parent store updates but have stable props. Heavy targets: ArchitectureGraph (already stable), RiskHeatMap (stable after data arrives), AgentFeedEvent (per-event).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CALM JSON validation | Custom JSON schema validator | `@finos/calm-cli` subprocess | Requirement specifies official CLI; hand-rolled would diverge from FINOS schema evolution |
| Markdown download | Server API route | `Blob + URL.createObjectURL` | All data is in Zustand; no server roundtrip needed |
| File drag-drop | react-dropzone library | HTML5 native DragEvent API | React 19 compatibility issues with react-dropzone; native API is 30 lines and fully sufficient |
| Dialog/Modal for report preview | Custom overlay | shadcn Dialog (Radix already installed) | @radix-ui/react-dialog is already in package.json as a transitive dependency of existing shadcn components |
| Typewriter code animation | External library | CSS animation + line-by-line shiki | Shiki is already installed; highlight each line separately, reveal with `animation-delay` |

**Key insight:** Almost every problem in this phase has a solution already in the project's dependency tree or native browser APIs. New dependencies are only justified for `@finos/calm-cli` (requirement) and nothing else.

---

## Common Pitfalls

### Pitfall 1: calm-cli `PATH` Not Available in Vercel Serverless
**What goes wrong:** `execFile('calm', ...)` fails with `ENOENT` — the `calm` binary is not on PATH in Vercel's Node.js runtime.
**Why it happens:** Vercel serverless functions run in a Lambda-like environment; `node_modules/.bin` is not automatically on PATH.
**How to avoid:** Use the full binary path: `node_modules/.bin/calm` resolved via `require.resolve('@finos/calm-cli/dist/index.js')` or `path.join(process.cwd(), 'node_modules/.bin/calm')`. Alternatively, use `execFile('node', [require.resolve('@finos/calm-cli/dist/index.js'), 'validate', ...])`.
**Warning signs:** Works in local dev, fails in Vercel with `spawn ENOENT`.

```typescript
// Safe binary resolution for Vercel
import { resolve } from 'path';
const calmBin = resolve(process.cwd(), 'node_modules/.bin/calm');
// Then: execFile(calmBin, ['validate', '-a', tmpFile, '--format', 'json'])
```

### Pitfall 2: SSE Stream Truncated at 10s on Vercel Without maxDuration
**What goes wrong:** Analysis completes locally but times out after 10s on Vercel, client sees empty result.
**Why it happens:** Without explicit `maxDuration` export, Vercel uses the plan default (10s Hobby without Fluid Compute).
**How to avoid:** Add `export const maxDuration = 300` to `/api/analyze/route.ts`. Fluid Compute is enabled by default, giving 300s on all plans.
**Warning signs:** Vercel function logs show `FUNCTION_INVOCATION_TIMEOUT`.

### Pitfall 3: Demo Mode State Persists After Navigation
**What goes wrong:** User completes a demo, returns to landing page, and "Run Demo" triggers an immediate re-analysis without user action.
**Why it happens:** `demoMode: true` remains in Zustand after the demo completes.
**How to avoid:** Reset `demoMode` to `false` in the `reset()` action and after the auto-start effect fires. The auto-start useEffect should run only once per mount (use a `hasStarted` ref guard).

### Pitfall 4: calm-cli Temp File Leak on Timeout
**What goes wrong:** If calm-cli validation times out (15s), the temp file is never deleted.
**Why it happens:** `await execFileAsync(...)` throws on timeout; the `unlink` in `finally` block runs correctly. BUT if the API request itself is aborted (client navigates away), the `finally` still runs — this is correct Node.js behavior.
**How to avoid:** The `try/finally` pattern in Pattern 1 above is correct. Add `timeout: 15_000` to execFileAsync options. Vercel's ephemeral filesystem means leaked temp files are cleaned at function end anyway.

### Pitfall 5: Odometer Animation Flickering When Score Updates Multiple Times
**What goes wrong:** If Zustand pushes multiple `analysisResult` updates, the odometer re-animates from the intermediate value each time.
**Why it happens:** The score may update as agent events stream in (if the store subscribes to partial results — currently it only updates once on `done` event).
**How to avoid:** Score only arrives via the terminal `done` SSE event in the current architecture (see `use-agent-stream.ts` lines 103-110). The odometer will only animate once per analysis. No extra guarding needed.

### Pitfall 6: React Flow Node CSS Transition Requires `style` Not `className` for border-color
**What goes wrong:** Tailwind `transition-colors` works on background/text but React Flow nodes use inline `style` for the border — Tailwind class won't animate inline style changes.
**Why it happens:** React Flow custom nodes set border color via `style={{ border: '...' }}` (see existing node components). Tailwind `transition-colors` only applies to properties managed by CSS classes.
**How to avoid:** In node components, set `transition: 'border-color 0.6s ease-out'` as part of the inline `style` object alongside the border color. This enables CSS transition on the dynamically-set border.

### Pitfall 7: Pipeline Typewriter Effect with Shiki — Don't Re-Highlight Per Line
**What goes wrong:** Calling `codeToHtml` once per line is ~50 lines × async shiki load = very slow.
**Why it happens:** Shiki loads language grammars on first call; subsequent calls are fast — but the design of calling it per line still adds overhead.
**How to avoid:** Highlight the full content first (one `codeToHtml` call), then split the resulting HTML by `<span>` line groups and reveal lines sequentially. Alternatively: split raw text into lines, join subsets, highlight subset at each step — but the full-highlight-then-reveal-lines approach is cleanest. Shiki's HTML output for YAML wraps each logical line in a consistent structure.

---

## Code Examples

### Demo Mode Auto-Start Guard (prevents double-fire)

```typescript
// In dashboard page.tsx
const hasStartedRef = useRef(false);

useEffect(() => {
  if (demoMode && rawCalmData && status === 'parsed' && !hasStartedRef.current) {
    hasStartedRef.current = true;
    const timer = setTimeout(() => {
      void startStream(rawCalmData, selectedFrameworks);
      setDemoMode(false); // Reset demo mode after triggering
    }, 800);
    return () => clearTimeout(timer);
  }
}, [demoMode, rawCalmData, status, startStream, selectedFrameworks, setDemoMode]);
```

### Heat Map Staggered Reveal (ANIM-04 enhancement)

```typescript
// In RiskHeatMap — when data arrives, reveal cells with stagger
// The existing `transition-colors duration-700 ease-in-out` already handles the color fade.
// Add animation-delay per row index for the cascading effect:
{nodeRiskMap.map((node, rowIndex) => (
  <HeatMapCell
    key={`${node.nodeId}-${fw}`}
    cellStatus={cellStatus}
    style={{ animationDelay: `${rowIndex * 80}ms` }}
    // The transition-colors handles the gray → color fade naturally
  />
))}
```

### Export Report Modal (shadcn Dialog)

```typescript
// src/components/ui/export-report-modal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExportReportModalProps {
  open: boolean;
  onClose: () => void;
  markdown: string;
  filename: string;
}

export function ExportReportModal({ open, onClose, markdown, filename }: ExportReportModalProps) {
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Compliance Report Preview</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0 font-mono text-sm text-slate-300 bg-slate-950 rounded p-4">
          <pre className="whitespace-pre-wrap">{markdown}</pre>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleDownload}>
            Download .md
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vercel 10s default duration (Hobby) | Fluid Compute 300s default | Late 2024 / early 2025 | SSE AI workloads now work on free tier without Edge Runtime |
| Edge Runtime required for long SSE | Node.js runtime + Fluid Compute | Vercel Fluid Compute GA | Eliminates Edge Runtime complexity; `child_process` available |
| react-dropzone for file upload | HTML5 DragEvent API | React 19 (2024) | react-dropzone has React 19 peer dep issues; native is simpler |
| JS-based number counting (RAF) | CSS translateY odometer digits | Always preferred | CSS animations run on GPU compositor thread; no JS frame budget |

**Deprecated/outdated:**
- `next/image` optimization for this project: Not needed — no images in dashboard.
- EventSource (native) for SSE: Already correctly avoided (project uses fetch + ReadableStream due to POST body requirement).
- `process.env` check at build time for API keys: Already handled with fail-fast runtime validation in provider.ts.

---

## Open Questions

1. **calm-cli binary availability in Vercel build**
   - What we know: `@finos/calm-cli` installs to `node_modules/.bin/calm`. Vercel includes all `node_modules` in the bundle for Node.js runtime functions.
   - What's unclear: Whether Vercel's Lambda environment makes `node_modules/.bin` contents executable. The binary has a shebang (`#!/usr/bin/env node`), which should work with `node_modules/.bin/calm`.
   - Recommendation: Use `execFile('node', [require.resolve('@finos/calm-cli/dist/index.js'), 'validate', ...])` as the safe approach — explicitly calls `node` with the resolved script path, bypassing PATH lookup entirely.

2. **Vercel project environment setup for GOOGLE_GENERATIVE_AI_API_KEY**
   - What we know: Env vars must be configured in Vercel project settings; they are not committed.
   - What's unclear: Whether the hackathon judge environment will have API keys pre-configured.
   - Recommendation: Add environment variable setup to the README deployment section. Consider a fallback message in the UI when no API key is detected.

3. **Demo mode timing vs actual LLM latency**
   - What we know: The orchestrator adds sleep() pauses between phases for dramatic effect. Real Gemini latency per agent is 3-15 seconds.
   - What's unclear: Whether additional artificial delays (1-2s between phases) are additive with LLM latency or whether the real LLM already provides natural pacing.
   - Recommendation: Add minimal sleep (500ms-1s) only between the orchestrator starting and the first agent event appearing — not between individual agent phases, since those already have real latency. If Gemini is fast, the natural pauses disappear.

---

## Existing Implementation Audit (What's Already Done)

The following phase 6 requirements are **already partially or fully implemented** and need enhancement, not from scratch:

| Requirement | Current State | Gap to Fill |
|-------------|---------------|-------------|
| ANIM-03 (feed slide-in) | COMPLETE — `animate-slide-in-right` in globals.css + agent-feed-event.tsx | No gap |
| ANIM-02 (graph node color transition) | PARTIAL — nodes update color but no CSS transition on inline style | Add `transition: 'border-color 0.6s ease-out'` to node inline styles |
| ANIM-04 (heat map fade) | PARTIAL — `transition-colors duration-700 ease-in-out` exists but no stagger | Add row-based `animation-delay` for cascading reveal |
| ANIM-01 (score count-up) | PARTIAL — linear `useCountUp` hook with RAF exists | Replace with `OdometerScore` component (per-digit CSS translateY) |
| FEED-06 (sidebar dots light up) | COMPLETE — sidebar uses `statusColors` with `animate-pulse` on running | No gap |
| DEMO-01 (demo button) | NOT STARTED — landing page has no "Run Demo" CTA | Add prominent button to hero section |
| DEMO-02 (demo pacing) | NOT STARTED — orchestrator has no demo mode | Add demoMode flag + sleep between phases |
| DEMO-03 (key finding highlight) | NOT STARTED | Extend AgentFeedEvent for demoMode badge |
| DEMO-04 (export report) | NOT STARTED — AnalyzeButton area has no export | Add ExportReportModal + report generator |
| CALM-04 (drag-drop upload) | STUB ONLY — landing page has placeholder `<div>` with "Coming soon" | Build actual CalmUploadZone component |
| CALM-05 (calm-cli validation) | NOT STARTED | Build `/api/calm/validate` route + cli-validator.ts |
| INFRA-01 (Vercel deployment) | PARTIAL — app builds and runs; no `maxDuration` or vercel.json | Add `maxDuration = 300` to analyze route; create `vercel.json` |

---

## Sources

### Primary (HIGH confidence)
- Vercel official docs (verified 2026-02-24): `maxDuration` export syntax, Fluid Compute 300s default duration — https://vercel.com/docs/functions/configuring-functions/duration
- GitHub finos/architecture-as-code raw files (verified 2026-02-24): `@finos/calm-cli` has NO programmatic API; `index.ts` calls `program.parse(process.argv)` directly; `package.json` main is `dist/index.js`
- Project codebase (verified 2026-02-24 via direct file reads): full audit of store, hooks, components, API routes, CSS animations

### Secondary (MEDIUM confidence)
- FINOS CALM docs (calm.finos.org/working-with-calm/validate/): validate command CLI interface, `--format json` output structure
- React Flow docs (reactflow.dev/learn/advanced-use/performance): `React.memo` requirement for custom node components; nodeTypes/edgeTypes at module level

### Tertiary (LOW confidence — needs validation)
- WebSearch results on react-slot-counter and shadcn Sliding Number: CSS translateY approach for odometer animation — code patterns unverified against React 19 specifically
- WebSearch on react-dropzone React 19 compatibility: reported issues requiring `--legacy-peer-deps`; recommend native DragEvent API instead

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified in package.json; only @finos/calm-cli is new
- Architecture: HIGH — existing codebase fully read; patterns derived from actual code
- Pitfalls: HIGH for Vercel/calm-cli issues (verified via official docs); MEDIUM for animation details (CSS behavior verified, timing values require tuning)
- calm-cli integration: HIGH — confirmed CLI-only by reading source; subprocess approach is the only viable path

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable libraries; Vercel Fluid Compute behavior may change)
