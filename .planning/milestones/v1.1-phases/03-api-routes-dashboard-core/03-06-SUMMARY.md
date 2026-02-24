---
phase: 03-api-routes-dashboard-core
plan: 06
subsystem: ui
tags: [next.js, react, zustand, react-flow, tailwind, dashboard, layout]

# Dependency graph
requires:
  - phase: 03-api-routes-dashboard-core-03-03
    provides: Dashboard shell with Sidebar, Header, and DashboardLayout
  - phase: 03-api-routes-dashboard-core-03-04
    provides: AgentFeed component with live events and auto-scroll
  - phase: 03-api-routes-dashboard-core-03-05
    provides: ArchitectureGraph React Flow component with dagre layout and compliance coloring
provides:
  - AgentFeed permanently visible in layout right column (w-80, always alongside main content)
  - Architecture tab page at /dashboard/architecture with full-height interactive graph
  - Overview page with real ArchitectureGraph in 300px panel, emerald completion banner, pre-analysis prompt
  - Full Phase 3 flow wired: select → analyze → stream → graph updates → feed → banner
affects: [04-compliance-visualization, 05-pipeline-generation, 06-polish-demo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Layout-level feed panel — AgentFeed in DashboardLayout right column, not per-page; always visible during tab navigation
    - Status-driven banners — completion and pre-analysis hints derived from Zustand status state
    - Card-wrapped graph panel — ArchitectureGraph inside Card with fixed height in grid

key-files:
  created:
    - src/app/dashboard/architecture/page.tsx
  modified:
    - src/components/layout/dashboard-layout.tsx
    - src/app/dashboard/page.tsx

key-decisions:
  - "AgentFeed placed in DashboardLayout right column (w-80) rather than per-page — always visible during all tab navigation per locked decision"
  - "Completion banner uses emerald-500/10 background + emerald-500/30 border — subtle, non-intrusive per locked decision (no modal/overlay)"
  - "Pre-analysis prompt inline (not modal) when status=parsed — architecture loaded but analysis not started"
  - "Overview grid reduced to 3 panels — Compliance placeholder, ArchitectureGraph card, Pipeline placeholder (AgentFeed moved to layout)"

patterns-established:
  - "Layout-level permanent panels: Place always-visible panels in DashboardLayout not pages to survive tab navigation"
  - "Status-conditional UI: Derive banners/prompts from Zustand status field (idle/loading/parsed/analyzing/complete/error)"
  - "Card wrapper for graph panels: Wrap ArchitectureGraph in Card with explicit height (h-[300px]) for grid embedding"

requirements-completed: [DASH-04]

# Metrics
duration: 3min
completed: 2026-02-23
---

# Phase 03 Plan 06: Dashboard Integration — AgentFeed Layout + Architecture Tab + Overview Wiring Summary

**AgentFeed wired permanently into DashboardLayout right column, Architecture tab page created with full-height React Flow graph, and Overview page upgraded with real ArchitectureGraph panel, emerald completion banner, and pre-analysis status hints**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-23T17:13:21Z
- **Completed:** 2026-02-23T17:16:01Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- AgentFeed permanently visible in 320px right column panel throughout all dashboard tab navigation
- New `/dashboard/architecture` page renders ArchitectureGraph at `calc(100vh - 12rem)` for maximum visual impact
- Overview page upgraded: real ArchitectureGraph replaces skeleton, completion banner shows agent count + duration, pre-analysis inline prompt added
- TypeScript strict typecheck and production build both pass with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Integrate AgentFeed into layout right column, add Architecture tab page** - `d96b3f7` (feat)
2. **Task 2: Update Overview page with graph panel, completion banner, and metric placeholders** - `7ce7679` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/components/layout/dashboard-layout.tsx` - Added AgentFeed import and w-80 right column panel with border-l separator
- `src/app/dashboard/architecture/page.tsx` - New page: full-height ArchitectureGraph with empty state for no-input scenario
- `src/app/dashboard/page.tsx` - Replaced AgentFeedSkeleton + ArchitectureGraphSkeleton with real ArchitectureGraph in Card, added completion banner and pre-analysis prompt

## Decisions Made
- AgentFeed placed at layout level (not per-page) so it persists during tab navigation — matches locked decision "Feed lives in a dedicated right column panel, always visible alongside main content"
- Completion banner: `bg-emerald-500/10 border border-emerald-500/30` — subtle background tint, not full overlay/modal per locked decision
- Pre-analysis prompt shown inline when `status === 'parsed'` so users know to click Analyze
- Overview grid uses 3 panels (removed 4th slot) since AgentFeed is now in layout right column

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Full Phase 3 flow is now complete: user selects architecture → clicks Analyze → agents stream events to feed → graph updates with compliance colors → sidebar dots light up → completion banner shows
- Phase 4 (Compliance Visualization) can now slot ComplianceCard into the top-left grid panel
- Phase 5 (Pipeline Generation) can replace PipelinePreviewSkeleton in bottom-left grid panel
- Both placeholder skeletons are clearly marked in the code with comments pointing to their Phase 4/5 replacements

---
*Phase: 03-api-routes-dashboard-core*
*Completed: 2026-02-23*

## Self-Check: PASSED

All files verified present. Both task commits confirmed in git log.
