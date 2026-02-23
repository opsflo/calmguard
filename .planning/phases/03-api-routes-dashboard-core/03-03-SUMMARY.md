---
phase: 03-api-routes-dashboard-core
plan: "03"
subsystem: dashboard-shell
tags: [dashboard, sidebar, header, zustand, sse, layout]
dependency_graph:
  requires: [03-02]
  provides: [sidebar-agent-dots, header-architecture-selector, analyze-button, dashboard-layout-flex]
  affects: [03-05, 03-06]
tech_stack:
  added: []
  patterns: [zustand-individual-selectors, sse-trigger-from-header, flex-layout-right-column-slot]
key_files:
  created:
    - src/components/dashboard/analyze-button.tsx
  modified:
    - src/components/dashboard/sidebar.tsx
    - src/components/dashboard/header.tsx
    - src/components/layout/dashboard-layout.tsx
    - src/app/dashboard/page.tsx
decisions:
  - "Individual Zustand selectors in Sidebar (not destructuring) for render performance"
  - "Header owns demo loading logic (parseCalm + extractAnalysisInput) — mirrors landing page pattern"
  - "Analyze button disabled when no rawCalmData or status=analyzing (explicit double guard)"
  - "Dashboard empty state drops Back-to-Home link — header dropdown replaces navigation need"
metrics:
  duration: 2 min
  completed: 2026-02-23
  tasks: 2
  files: 5
---

# Phase 3 Plan 03: Dashboard Shell — Live Sidebar + Analyze Header Summary

**One-liner:** Interactive dashboard shell with Zustand-reactive agent status dots in sidebar and architecture selector + Analyze trigger button in header.

## What Was Built

Transformed the static Phase 1 dashboard skeleton into an interactive control surface. The sidebar agent dots now derive their status from the Zustand `agentEvents` and `activeAgents` state in real-time. The header gained an architecture selector dropdown (reusing the same parseCalm/extractAnalysisInput pattern from the landing page) and an explicit Analyze button that calls `startStream(rawCalmData)` — separating selection from triggering. The layout now uses a flex row to reserve the right column for the agent feed panel (implemented in Plan 03-05).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Upgrade Sidebar with live agent status dots | bc55106 | sidebar.tsx |
| 2 | Upgrade Header, Layout, Dashboard page | 84cfb91 | header.tsx, analyze-button.tsx, dashboard-layout.tsx, dashboard/page.tsx |

## Decisions Made

1. **Individual Zustand selectors in Sidebar** — `useAnalysisStore(state => state.agentEvents)` and separate `useAnalysisStore(state => state.activeAgents)` rather than destructuring. Prevents re-renders when unrelated state changes.

2. **Header owns demo loading logic** — Mirrors the `ArchitectureSelector` pattern exactly (parseCalm → extractAnalysisInput → setCalmData). Avoids duplicating state management or creating a new abstraction for a 10-line operation.

3. **Double guard on Analyze button** — Disabled when `rawCalmData === null` OR `status === 'analyzing'`. Prevents both no-data clicks and double-trigger during active analysis.

4. **Removed Back-to-Home link from dashboard empty state** — The header dropdown makes navigating back to `/` unnecessary. Cleaner single-surface interaction model.

## Verification

All 7 criteria passed:
- `pnpm typecheck` — zero errors
- `pnpm build` — succeeded (6 static/dynamic routes)
- Sidebar agent dots driven by store (AGENT_NAMES map + getAgentStatus)
- Header renders Select dropdown (SelectTrigger/SelectContent/SelectItem)
- Analyze button wires to `startStream(rawCalmData)` via useAgentStream
- Layout main content uses `flex-1 flex overflow-hidden` (flex row)
- Dashboard empty state: "Select an architecture and click Analyze"

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

Checking created/modified files and commits...

## Self-Check: PASSED

All files present and all commits verified:
- FOUND: src/components/dashboard/analyze-button.tsx
- FOUND: src/components/dashboard/sidebar.tsx
- FOUND: src/components/dashboard/header.tsx
- FOUND: src/components/layout/dashboard-layout.tsx
- FOUND: src/app/dashboard/page.tsx
- FOUND commit: bc55106 (Task 1 - sidebar)
- FOUND commit: 84cfb91 (Task 2 - header/layout/page)
