---
phase: 04-pipeline-generation-compliance-display
plan: 02
subsystem: ui
tags: [compliance, risk-heat-map, control-matrix, zustand, tooltip, select, lucide, tailwind]

# Dependency graph
requires:
  - phase: 04-pipeline-generation-compliance-display
    plan: 04
    provides: selectedFrameworks data flow, shadcn tooltip/select/tabs/checkbox installed

provides:
  - RiskHeatMap component: node x framework risk grid with color-coded cells and tooltips
  - ControlMatrix component: sortable filterable flat control table with status badges
  - /dashboard/compliance page assembling both components

affects:
  - 04-pipeline-generation-compliance-display (compliance deep-dive view now navigable from sidebar)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Cell status derived from nodeRiskMap riskLevel + complianceGaps count (same status across all frameworks per node — acceptable for hackathon)
    - STATUS_ORDER record for deterministic status sort: non-compliant(0) > partial(1) > compliant(2) > not-applicable(3)
    - ControlMatrixInner split from ControlMatrix to enable useMemo/useState hooks after null guard at outer level
    - TooltipProvider wraps each cell independently (not hoisted to component root) to avoid stacking context issues
    - Sticky thead with bg-slate-800 to maintain header visibility during vertical scroll in max-h-96 container

key-files:
  created:
    - src/components/dashboard/risk-heat-map.tsx
    - src/components/dashboard/control-matrix.tsx
    - src/app/dashboard/compliance/page.tsx
  modified: []

key-decisions:
  - "Cell status derived from node-level riskLevel+complianceGaps (same across all frameworks) — no per-framework risk data in schema, acceptable for hackathon visualization"
  - "ControlMatrixInner pattern: outer ControlMatrix does null guard + early returns, inner component uses hooks freely — avoids conditional hook rule violations"
  - "Row key includes index (framework-controlId-idx) to handle duplicate controlIds across frameworks without React key collisions"
  - "Select filter uses shadcn Select with defaultValue='all' — avoids controlled/uncontrolled mismatch"

# Metrics
duration: 3min
completed: 2026-02-24
---

# Phase 04 Plan 02: Risk Heat Map + Control Matrix + Compliance Page Summary

**RiskHeatMap grid (nodes x frameworks) with emerald/amber/red CSS-transition cells and Tooltip overlays, ControlMatrix sortable+filterable flat table with filled-pill status badges, and /dashboard/compliance page assembling both**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-24T04:39:34Z
- **Completed:** 2026-02-24T04:42:34Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

### Task 1: RiskHeatMap component

- Created `src/components/dashboard/risk-heat-map.tsx` as a `'use client'` component
- Reads `analysisResult.risk.nodeRiskMap` and `analysisResult.risk.frameworkScores` from Zustand store
- Derives cell status via `deriveCellStatus(riskLevel, complianceGaps)`: 6-branch mapping covering all risk/gap combinations
- Color-coded cells: emerald (compliant), amber (partial), red (non-compliant), slate-700/30 (not-applicable), slate-700/50 (loading skeleton)
- `transition-colors duration-700 ease-in-out` on every cell div for fade-from-gray effect on data arrival
- Tooltips via `@/components/ui/tooltip` wrapping each cell: shows node name, framework, status, and first risk factor
- Loading skeleton state: 5x4 animated placeholder grid when `status === 'analyzing'`
- Empty state: "Run analysis to view risk heat map" when no data and not analyzing
- Graceful degradation: AlertTriangle warning when compliance data present but risk agent failed
- Legend row at bottom showing all 4 status colors

### Task 2: ControlMatrix + Compliance page

- Created `src/components/dashboard/control-matrix.tsx` as a `'use client'` component
- Reads flat `analysisResult.compliance.frameworkMappings` array directly from Zustand — no flattening needed
- 5 columns: Framework, Control ID (font-mono), Control Name (truncated with Tooltip), CALM Mapping (calmControlId | N/A), Status badge
- Status badges as filled pills: emerald Pass, amber Partial, red Fail, slate N/A
- Sort by Framework, Control ID, or Status columns — click header to toggle asc/desc; new field defaults to desc
- Status sort uses `STATUS_ORDER`: non-compliant(0) > partial(1) > compliant(2) > not-applicable(3) — failures first by default
- Framework filter via shadcn Select dropdown: "All Frameworks" + unique framework names derived from data
- `useMemo` on filter+sort computation to avoid re-sorting on unrelated renders
- Sticky `<thead>` in `max-h-96` scrollable container for long control lists
- Empty state and graceful degradation (AlertTriangle) when agents failed
- Row count footer: "Showing X of Y controls"
- Created `src/app/dashboard/compliance/page.tsx` assembling RiskHeatMap + ControlMatrix under `/dashboard/compliance` (already linked in sidebar)

## Task Commits

(User will commit manually per instructions)

1. **Task 1: Build RiskHeatMap with color-coded cells, transitions, and tooltips** — feat(04-02): build RiskHeatMap component with color-coded cells, CSS transitions, and Tooltip overlays
   - Files: `src/components/dashboard/risk-heat-map.tsx`

2. **Task 2: Build ControlMatrix table and Compliance page** — feat(04-02): build ControlMatrix sortable table and /dashboard/compliance page
   - Files: `src/components/dashboard/control-matrix.tsx`, `src/app/dashboard/compliance/page.tsx`

## Files Created/Modified

- `src/components/dashboard/risk-heat-map.tsx` (248 lines) - Node x framework risk grid with color-coded cells, CSS transitions, tooltips, legend
- `src/components/dashboard/control-matrix.tsx` (311 lines) - Sortable filterable flat control table with status badges, Select filter, sticky header
- `src/app/dashboard/compliance/page.tsx` (19 lines) - Compliance deep-dive page at /dashboard/compliance

## Decisions Made

- Cell status is node-level (same across all framework columns per node). The `complianceGaps` field in `nodeRiskMap` is an integer count with no per-framework breakdown — this approach is pragmatic for the hackathon visualization goal
- Split `ControlMatrixInner` from `ControlMatrix`: the outer component handles null guards and early returns; the inner component uses hooks freely — this avoids React's conditional hook rule violations
- Row key includes array index (`framework-controlId-idx`) to handle duplicate `controlId` values across different frameworks without React key collisions
- `Select` uses `defaultValue="all"` (not `value`) to remain uncontrolled — the state is driven via `onValueChange` callback only, avoiding controlled/uncontrolled mismatch warnings

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `pnpm build`: PASSED — `/dashboard/compliance` appears in route table at 7.76 kB
- `pnpm tsc --noEmit`: PASSED — exit code 0
- All 3 files exist with line counts above minimums (248 vs 80, 311 vs 100, 19 vs 20)
- `RiskHeatMap` exported from risk-heat-map.tsx: confirmed
- Tooltip imports from `@/components/ui/tooltip`: confirmed
- `transition-colors duration-700` in risk-heat-map: confirmed
- `not-applicable` state handling: 5 occurrences confirmed
- Empty state messages: confirmed in both components
- AlertTriangle graceful degradation: confirmed in both components
- STATUS_ORDER + sortField + frameworkFilter sort/filter logic: 23 occurrences in control-matrix

## Issues Encountered

None.

## Self-Check: PASSED

Files confirmed:
- FOUND: src/components/dashboard/risk-heat-map.tsx
- FOUND: src/components/dashboard/control-matrix.tsx
- FOUND: src/app/dashboard/compliance/page.tsx

Build: PASSED (exit code 0)
TypeScript: PASSED (exit code 0)

---
*Phase: 04-pipeline-generation-compliance-display*
*Completed: 2026-02-24*
