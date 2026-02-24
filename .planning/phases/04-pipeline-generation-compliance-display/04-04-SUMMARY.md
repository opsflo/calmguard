---
phase: 04-pipeline-generation-compliance-display
plan: 04
subsystem: ui
tags: [shadcn, sonner, checkbox, tabs, tooltip, shiki, zustand, sse, toast]

# Dependency graph
requires:
  - phase: 03-api-routes-dashboard-core
    provides: Zustand store, useAgentStream hook, analyze API route, orchestrator

provides:
  - selectedFrameworks state (SOX, PCI-DSS, NIST-CSF, CCC) with toggleFramework action
  - frameworks field in analyzeRequestSchema flowing through full stack to orchestrator
  - shadcn Sonner (toast), Tabs, Checkbox, Tooltip components
  - Toast error notifications on SSE stream failures
  - Framework checkboxes on landing page (all 4 checked by default)
  - Retry Analysis button in completion banner on partial failures
  - Partial results warning banner with failed agent names

affects:
  - 04-pipeline-generation-compliance-display (all subsequent plans in phase 4)

# Tech tracking
tech-stack:
  added: [sonner, shiki, @radix-ui/react-checkbox, @radix-ui/react-tabs, @radix-ui/react-tooltip]
  patterns:
    - Framework enum value (CCC) decoupled from display label (FINOS-CCC) via FRAMEWORKS const array
    - selectedFrameworks persists across analyses — not reset in startAnalysis or reset actions
    - Optional parameter threading: selectedFrameworks flows store -> hook -> fetch body -> route -> orchestrator -> agents
    - Toast notifications on all SSE failure paths (HTTP error, null body, max retries)

key-files:
  created:
    - src/components/ui/sonner.tsx
    - src/components/ui/tabs.tsx
    - src/components/ui/checkbox.tsx
    - src/components/ui/tooltip.tsx
  modified:
    - src/store/analysis-store.ts
    - src/lib/api/schemas.ts
    - src/hooks/use-agent-stream.ts
    - src/app/api/analyze/route.ts
    - src/lib/agents/orchestrator.ts
    - src/lib/agents/compliance-mapper.ts
    - src/lib/agents/risk-scorer.ts
    - src/app/layout.tsx
    - src/components/calm/architecture-selector.tsx
    - src/components/dashboard/header.tsx
    - src/app/dashboard/page.tsx

key-decisions:
  - "Framework enum values use 'CCC' internally (matches Zod schema) but display as 'FINOS-CCC' to users — decoupled via FRAMEWORKS const array with value+label fields"
  - "selectedFrameworks not reset in startAnalysis or reset — user selection persists across analyses"
  - "mapCompliance and scoreRisk accept _selectedFrameworks as unused parameter with eslint-disable comment — parameter threading established for future filter implementation"
  - "Toast errors fire on all 3 failure paths: HTTP error, null response.body, and max retries exhausted"
  - "Completion banner conditionally amber (partial failure) or emerald (success) — Retry button always visible when rawCalmData available"

patterns-established:
  - "FRAMEWORKS const array pattern: { value, label } for decoupling internal enum from display text"
  - "selectedFrameworks threading: add to store interface, add to hook parameter, add to fetch body, extract in route, pass to orchestrator, accept in agents"

requirements-completed:
  - LLM-06
  - INFRA-04
  - INFRA-05

# Metrics
duration: 12min
completed: 2026-02-24
---

# Phase 04 Plan 04: Shared UI Packages + Framework Selector + Toast Notifications Summary

**4 shadcn components (sonner/tabs/checkbox/tooltip) and shiki installed, selectedFrameworks flowing store-to-orchestrator, framework checkboxes on landing page, toast errors on SSE failures, retry button and partial-results warning in completion banner**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-24T00:00:00Z
- **Completed:** 2026-02-24T00:12:00Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments

- Installed 4 shadcn components (sonner, tabs, checkbox, tooltip) and shiki via pnpm
- Added `selectedFrameworks: string[]` to Zustand store with `toggleFramework` action that prevents removing the last framework
- Threaded selectedFrameworks through entire stack: store state -> useAgentStream POST body -> analyzeRequestSchema -> route handler -> runAnalysis() -> mapCompliance() and scoreRisk() function signatures
- Added toast.error() calls on all SSE failure paths using sonner
- Added framework checkboxes to landing page (SOX, PCI-DSS, NIST-CSF, FINOS-CCC) — all 4 checked by default
- Added Toaster to root layout with dark-themed styles
- Updated completion banner: amber variant for partial failures, Retry Analysis button, separate partial results warning

## Task Commits

(User will commit manually per instructions)

1. **Task 1: Install shared packages and add framework selector data flow** - (feat: install shadcn sonner/tabs/checkbox/tooltip, add selectedFrameworks through full stack)
2. **Task 2: Add framework selector UI, Toaster, and error handling** - (feat: framework checkboxes on landing page, Toaster in layout, retry button in completion banner)

## Files Created/Modified

- `src/components/ui/sonner.tsx` - shadcn Sonner toast wrapper component (auto-generated)
- `src/components/ui/tabs.tsx` - shadcn Tabs component (auto-generated)
- `src/components/ui/checkbox.tsx` - shadcn Checkbox component (auto-generated)
- `src/components/ui/tooltip.tsx` - shadcn Tooltip component (auto-generated)
- `src/store/analysis-store.ts` - Added selectedFrameworks state + setSelectedFrameworks and toggleFramework actions
- `src/lib/api/schemas.ts` - Added optional frameworks field to analyzeRequestSchema (Zod enum array)
- `src/hooks/use-agent-stream.ts` - Changed startStream signature to accept selectedFrameworks, added toast.error() on all failure paths
- `src/app/api/analyze/route.ts` - Extracted frameworks from bodyResult.data, passed as 2nd arg to runAnalysis()
- `src/lib/agents/orchestrator.ts` - Added selectedFrameworks parameter to runAnalysis(), threads to mapCompliance() and scoreRisk()
- `src/lib/agents/compliance-mapper.ts` - Added _selectedFrameworks optional parameter to mapCompliance() signature
- `src/lib/agents/risk-scorer.ts` - Added _selectedFrameworks optional parameter to scoreRisk() signature
- `src/app/layout.tsx` - Added Toaster with dark theme styles (position bottom-right, 5s duration)
- `src/components/calm/architecture-selector.tsx` - Added FRAMEWORKS const and 4 Checkbox components below demo selector
- `src/components/dashboard/header.tsx` - Reads selectedFrameworks from store, passes to startStream()
- `src/app/dashboard/page.tsx` - Imports useAgentStream, adds retry button and partial results warning to completion banner

## Decisions Made

- Framework enum value `'CCC'` kept for Zod schema compatibility, display label `'FINOS-CCC'` shown to users via `FRAMEWORKS` const array with `value` + `label` fields
- `selectedFrameworks` deliberately not reset in `startAnalysis` or `reset` — user's framework selection persists across analyses
- `mapCompliance` and `scoreRisk` accept `_selectedFrameworks` as unused prefixed parameter with `eslint-disable-next-line @typescript-eslint/no-unused-vars` — parameter threading infrastructure established, internal filtering logic deferred to future plan
- Completion banner changes to amber color scheme when `failedAgents.length > 0`, with separate partial results warning below it listing failed agent names

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- selectedFrameworks data flow fully established — all subsequent Phase 4 plans can use it
- shadcn components ready for use in compliance card, pipeline viewer, and risk panel
- shiki installed for code syntax highlighting in pipeline YAML preview
- Toast notification infrastructure available for all Phase 4 error handling

---
*Phase: 04-pipeline-generation-compliance-display*
*Completed: 2026-02-24*
