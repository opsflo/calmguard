---
phase: 04-pipeline-generation-compliance-display
plan: 03
subsystem: ui
tags: [findings, pipeline, shiki, tabs, syntax-highlighting, copy-clipboard, download, select, expandable-rows]

# Dependency graph
requires:
  - phase: 04-pipeline-generation-compliance-display
    plan: 04
    provides: shadcn tabs/select/skeleton components, shiki installed
  - phase: 04-pipeline-generation-compliance-display
    plan: 01
    provides: RiskAssessment type with topFindings array in Zustand
  - phase: 04-pipeline-generation-compliance-display
    plan: 02
    provides: Compliance page pattern reference

provides:
  - FindingsTable: expandable findings with severity badges, framework/severity filter dropdowns
  - PipelinePreview: tabbed YAML viewer with shiki github-dark theme, copy + download
  - /dashboard/findings page
  - /dashboard/pipeline page
  - Overview page uses real PipelinePreview (compact mode) instead of PipelinePreviewSkeleton

affects:
  - 04-pipeline-generation-compliance-display (findings and pipeline now viewable from sidebar)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - shiki codeToHtml from 'shiki/bundle/web' (not 'shiki') — avoids 1MB full bundle, uses ESM-compatible web bundle
    - useEffect pre-computes highlighted HTML for all 3 tabs via Promise.all on pipelineConfig arrival
    - highlightedHtml is local ephemeral state (not Zustand) — display-only, recomputed on each analysis
    - SEVERITY_ORDER record maps severity string to integer for deterministic sort (critical=0 first)
    - compact prop pattern for dual-use components — same component at different height/feature constraints
    - URL.createObjectURL + URL.revokeObjectURL for download with immediate revocation to prevent memory leak

key-files:
  created:
    - src/components/dashboard/findings-table.tsx
    - src/components/dashboard/pipeline-preview.tsx
    - src/app/dashboard/findings/page.tsx
    - src/app/dashboard/pipeline/page.tsx
  modified:
    - src/app/dashboard/page.tsx

key-decisions:
  - "shiki import from 'shiki/bundle/web' not 'shiki' — web bundle avoids loading all 1000+ grammars; only yaml and hcl needed"
  - "highlightedHtml stored as local useState not Zustand — ephemeral display data, not part of analysis result"
  - "compact prop hides download button and limits height to 200px — same component for overview grid (compact) and pipeline page (full)"
  - "SEVERITY_ORDER maps severity strings to integers for useMemo sort — deterministic ordering critical > high > medium > low > info"
  - "framework filter uses optional chaining (f.framework ?? '') — framework field is optional in topFindings Zod schema"

# Metrics
duration: 4min
completed: 2026-02-24
---

# Phase 04 Plan 03: Findings Table + Pipeline Preview + Dashboard Pages Summary

**FindingsTable with expandable rows and severity badges (5 colors), framework/severity filters via shadcn Select, and PipelinePreview with 3 tabs (GitHub Actions, Security Scanning, Infrastructure), shiki github-dark syntax highlighting, copy-to-clipboard with 2s feedback, and download-as-file — wired to /dashboard/findings and /dashboard/pipeline pages with overview updated to compact PipelinePreview**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-24T04:46:48Z
- **Completed:** 2026-02-24T04:50:13Z
- **Tasks:** 2
- **Files created:** 4
- **Files modified:** 1

## Accomplishments

### Task 1: FindingsTable with expandable rows and severity filtering

- Created `src/components/dashboard/findings-table.tsx` as a `'use client'` component (240 lines)
- Reads `analysisResult.risk.topFindings` from Zustand — correctly handles optional `framework` field
- 5 severity badge colors: `critical` (red), `high` (orange), `medium` (amber), `low` (blue), `info` (emerald) via `SEVERITY_COLORS` record
- Expandable rows via `expandedRows: Set<number>` state — click row to toggle; `ChevronRight` rotates 90deg via CSS transition
- Expanded detail shows: framework (defaults to 'General' via `?? 'General'`), recommendation, affected nodes list
- Framework filter dropdown: "All Frameworks" + unique framework values derived from findings (guards `undefined` with `.filter(Boolean)`)
- Severity filter dropdown: "All Severities" + 5 fixed severity levels
- `useMemo` sorts and filters: framework filter → severity filter → sort by `SEVERITY_ORDER` (critical first)
- Row count shown in header when filtered: "(X of Y)"
- Empty state: "Run analysis to view findings" when no analysis run
- Graceful degradation: AlertTriangle warning when analysis complete but risk agent failed
- Created `src/app/dashboard/findings/page.tsx` at `/dashboard/findings` — simple page shell wrapping FindingsTable

### Task 2: PipelinePreview with tabs, shiki highlighting, copy/download, and page wiring

- Created `src/components/dashboard/pipeline-preview.tsx` as a `'use client'` component (262 lines)
- Reads `analysisResult.pipeline` from Zustand — `PipelineConfig` type from pipeline-generator agent
- Shiki: imports `codeToHtml` from `'shiki/bundle/web'` (not `'shiki'`) — uses ESM web bundle with smaller footprint
- `useEffect` pre-computes highlighted HTML for all 3 tabs via `Promise.all` when `pipelineConfig` arrives
- Three tabs via shadcn Tabs: "GitHub Actions" (yaml), "Security Scanning" (tools config joined by `---`), "Infrastructure" (hcl for terraform, yaml for cloudformation)
- Tab content: `dangerouslySetInnerHTML` with shiki HTML; `CodeSkeleton` shown while highlighting in progress
- Copy button: `navigator.clipboard.writeText(getRawContent(activeTab, pipelineConfig))` → 2s "Copied!" checkmark via `setCopied(true)` + `setTimeout`
- Download button: `URL.createObjectURL(new Blob([content]))` → anchor click → `URL.revokeObjectURL` immediately to prevent memory leak; correct extension (`.yml` or `.tf`)
- `compact` prop: limits `max-h` to 200px (vs 384px), hides download button — overview grid uses compact, pipeline page uses full
- Empty state: `CodeSkeleton` placeholder when no analysis run
- Graceful degradation: AlertTriangle warning when pipeline agent failed
- Created `src/app/dashboard/pipeline/page.tsx` at `/dashboard/pipeline`
- Updated `src/app/dashboard/page.tsx`: replaced `PipelinePreviewSkeleton` import/usage with `<PipelinePreview compact />`

## Task Commits

(User will commit manually per instructions)

1. **Task 1: FindingsTable with expandable rows and severity filtering** — feat(04-03): build FindingsTable with expandable rows, severity badges, framework/severity filters, and /dashboard/findings page
   - Files: `src/components/dashboard/findings-table.tsx`, `src/app/dashboard/findings/page.tsx`

2. **Task 2: PipelinePreview with tabs, shiki highlighting, copy/download, and wire pages** — feat(04-03): build PipelinePreview with shiki tabs, copy/download, pipeline page, and update overview
   - Files: `src/components/dashboard/pipeline-preview.tsx`, `src/app/dashboard/pipeline/page.tsx`, `src/app/dashboard/page.tsx`

## Files Created/Modified

- `src/components/dashboard/findings-table.tsx` (240 lines) - Expandable findings table with severity badges (5 colors), framework/severity select filters, useMemo sort, expandable detail rows
- `src/components/dashboard/pipeline-preview.tsx` (262 lines) - Tabbed code viewer with shiki github-dark highlighting, copy-to-clipboard with 2s feedback, download-as-file with memory leak prevention, compact prop
- `src/app/dashboard/findings/page.tsx` (14 lines) - Findings page at /dashboard/findings
- `src/app/dashboard/pipeline/page.tsx` (14 lines) - Pipeline page at /dashboard/pipeline
- `src/app/dashboard/page.tsx` (modified) - Replaced PipelinePreviewSkeleton with PipelinePreview compact

## Decisions Made

- `shiki/bundle/web` import over `shiki` direct — web bundle is significantly smaller, only loads yaml/hcl grammars needed for pipeline YAML display
- `highlightedHtml` is local `useState` not Zustand state — it's ephemeral display data that gets recomputed fresh each time pipelineConfig arrives, shouldn't persist in global store
- `compact` prop instead of separate compact component — same logic, different rendering constraints (height, button visibility); avoids code duplication
- `framework ?? 'General'` in expanded row detail — `framework` is optional in topFindings Zod schema, guard prevents runtime error
- `framework ?? ''` in filter comparison — consistent treatment of undefined framework values in filter logic

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `pnpm build`: PASSED — all 4 new routes in route table, no TypeScript errors
- Route table includes: `/dashboard/findings` (3.75 kB), `/dashboard/pipeline` (3.41 kB), `/dashboard` updated (5.63 kB)
- FindingsTable (240 lines > 100 line minimum)
- PipelinePreview (262 lines > 100 line minimum)
- Contains severity badge colors for all 5 levels: confirmed via Grep (5 occurrences)
- Contains expandable row logic: confirmed via Grep (5 occurrences)
- Contains shiki `codeToHtml` from `shiki/bundle/web`: confirmed via Grep (4 occurrences)
- Contains `navigator.clipboard.writeText`: confirmed via Grep (1 occurrence)
- Contains `URL.createObjectURL` + `URL.revokeObjectURL`: confirmed via Grep (2 occurrences)
- Contains Tabs components: confirmed via Grep (11 occurrences)
- Overview page imports PipelinePreview (not PipelinePreviewSkeleton): confirmed

## Issues Encountered

None.

## Self-Check: PASSED

Files confirmed:
- FOUND: src/components/dashboard/findings-table.tsx
- FOUND: src/components/dashboard/pipeline-preview.tsx
- FOUND: src/app/dashboard/findings/page.tsx
- FOUND: src/app/dashboard/pipeline/page.tsx

Build: PASSED (exit code 0)
TypeScript: PASSED (included in build lint step)

---
*Phase: 04-pipeline-generation-compliance-display*
*Completed: 2026-02-24*
