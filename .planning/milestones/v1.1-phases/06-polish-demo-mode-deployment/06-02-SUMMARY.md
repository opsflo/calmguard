---
phase: 06-polish-demo-mode-deployment
plan: 02
subsystem: demo-mode
tags: [demo, ux, export, report, orchestrator, store]
dependency_graph:
  requires: [06-01]
  provides: [demo-mode-flag, run-demo-cta, export-report-modal, completion-summary-card]
  affects: [src/store/analysis-store.ts, src/app/page.tsx, src/app/dashboard/page.tsx, src/lib/agents/orchestrator.ts]
tech_stack:
  added: [@radix-ui/react-dialog, shadcn-dialog]
  patterns: [Blob-download, demo-mode-flag, orchestrator-sleep-pacing, KEY-FINDING-badge]
key_files:
  created:
    - src/lib/report/generate-report.ts
    - src/components/dashboard/export-report-modal.tsx
    - src/components/ui/dialog.tsx
  modified:
    - src/store/analysis-store.ts
    - src/app/page.tsx
    - src/app/dashboard/page.tsx
    - src/lib/agents/orchestrator.ts
    - src/app/api/analyze/route.ts
    - src/hooks/use-agent-stream.ts
    - src/lib/api/schemas.ts
    - src/components/dashboard/agent-feed-event.tsx
    - src/app/globals.css
decisions:
  - "demoMode resets to false after auto-start fires — prevents re-trigger on re-render"
  - "hasStartedRef prevents StrictMode double-fire of useEffect auto-start"
  - "pipeline.recommendations are objects with .recommendation field — not strings (Rule 1 bug fix)"
  - "sleep() helper in orchestrator is additive with real LLM latency — not instead of it"
  - "ExportReportModal uses Blob + createObjectURL — no server round-trip for download"
  - "Summary card built with animate-slide-up keyframes in globals.css — Tailwind v4 @theme pattern"
metrics:
  duration: "9 minutes"
  completed_date: "2026-02-24"
  tasks: 2
  files: 9
---

# Phase 6 Plan 02: Demo Mode — Run Demo CTA, Auto-Start, Export Report Summary

**One-liner:** Guided demo mode with cinematic orchestrator pacing, KEY FINDING badges, completion summary card, and client-side markdown export report download.

## What Was Built

### Task 1: Demo Mode Core (commit: 53d1cf0)

Full demo mode pipeline from landing page to auto-analysis:

1. **Analysis Store** — Added `demoMode: boolean` field and `setDemoMode(v: boolean)` action. `initialState` defaults to `false`. `reset()` clears it automatically via `set(initialState)`.

2. **Landing Page "Run Demo" CTA** (`src/app/page.tsx`) — Emerald-bordered CTA section above the "Get Started" card. Clicking it:
   - Finds the `trading-platform` demo from `DEMO_ARCHITECTURES`
   - Parses it via `parseCalm()` and extracts analysis input
   - Pre-selects all 4 compliance frameworks
   - Calls `setCalmData()`, `setDemoMode(true)`, then `router.push('/dashboard')`

3. **Dashboard Auto-Start** (`src/app/dashboard/page.tsx`) — `useEffect` watches `demoMode + rawCalmData + status === 'parsed'`. When all conditions met, fires `startStream(rawCalmData, selectedFrameworks, true)` after an 800ms delay. `hasStartedRef.current` guards against StrictMode double-fire. `setDemoMode(false)` resets after triggering to prevent re-trigger.

4. **API Schema** — Added `demoMode: z.boolean().optional().default(false)` to `analyzeRequestSchema`. Flows: hook body → route extraction → `runAnalysis` parameter.

5. **Orchestrator Dramatic Pacing** (`src/lib/agents/orchestrator.ts`) — Added `sleep()` helper and `demoMode?: boolean` parameter. Sleeps inserted:
   - `800ms` after orchestrator "started" event (let dashboard render)
   - `500ms` after each Phase 1 result extraction (stagger announcements)
   - `1500ms` before Phase 2 Risk Scorer (dramatic "and now the verdict" pause)

6. **KEY FINDING Badge** (`src/components/dashboard/agent-feed-event.tsx`) — When `demoMode=true` AND event is `finding` with `severity === 'critical' | 'high'`: adds amber pulsing "KEY FINDING" badge + `ring-1 ring-amber-500/30` glow on the event row.

### Task 2: Export Report + Completion Summary Card (commit: 078e824)

1. **Markdown Report Generator** (`src/lib/report/generate-report.ts`) — `generateMarkdownReport(analysisResult, analysisInput, architectureName, date)` produces branded markdown with:
   - CALMGuard + DTCC/FINOS Hackathon header
   - Executive summary (from `risk.executiveSummary`)
   - Architecture overview (node/relationship/flow/control counts, node types, protocols)
   - Compliance findings by framework (score, compliant/partial/non-compliant counts)
   - Top findings with severity, affected nodes, recommendations
   - Risk scores table by framework
   - Generated pipeline YAML preview (first 2000 chars)
   - Actionable recommendations (from pipeline + risk findings, deduplicated)
   - Failed agents warning section if any
   - Branded footer

2. **ExportReportModal** (`src/components/dashboard/export-report-modal.tsx`) — shadcn `Dialog` with `ScrollArea` containing a `<pre>` markdown preview. Footer has Cancel + "Download .md" button. Download uses `Blob + URL.createObjectURL + <a>.click()` — pure client-side, no server round-trip.

3. **Completion Summary Card** (`src/app/dashboard/page.tsx`) — Slides in via `animate-slide-up` when analysis completes. Shows:
   - Overall score (large, color-coded: emerald ≥80, amber ≥60, red <60)
   - Agent count, duration, findings count in a stats row
   - "Export Report" button (emerald-600) → opens ExportReportModal

4. **slide-up animation** — Added `@keyframes slide-up` + `--animate-slide-up` CSS variable + `.animate-slide-up` class to `globals.css`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pipeline recommendations type mismatch**
- **Found during:** Task 2 typecheck
- **Issue:** `pipeline.recommendations` is `Array<{ recommendation: string; category: ...; priority: ... }>` not `string[]`. Report generator attempted `recommendations.push(...pipeline.recommendations)` causing TS2345.
- **Fix:** Changed to `pipeline.recommendations.map((r) => r.recommendation)` to extract the string field.
- **Files modified:** `src/lib/report/generate-report.ts`
- **Commit:** 078e824 (inline fix before commit)

## Verification Results

| Check | Result |
|-------|--------|
| `pnpm typecheck` | PASS (0 errors) |
| `pnpm build` | PASS (11 pages, no errors) |
| `pnpm test:run` | PASS (22/22 tests) |
| "Run Demo" button on landing page | Present (emerald CTA section above "Get Started") |
| Store has demoMode + setDemoMode | Present |
| Orchestrator sleep pauses | Present (800ms + 500ms×2 + 1500ms) |
| KEY FINDING badge | Present (critical/high findings in demo mode) |
| generate-report.ts exported | Present |
| ExportReportModal with Dialog + download | Present |
| Summary card on completion | Present (animate-slide-up) |

## Self-Check: PASSED

All files verified present. All commits verified in git log. All key patterns verified in source code.
