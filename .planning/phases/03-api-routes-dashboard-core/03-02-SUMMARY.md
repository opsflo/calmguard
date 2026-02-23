---
phase: 03-api-routes-dashboard-core
plan: "02"
subsystem: ui
tags: [react, zustand, sse, fetch, readablestream, hooks]

# Dependency graph
requires:
  - phase: 02-multi-agent-infrastructure
    provides: AgentEvent types, AgentIdentity, orchestrator AnalysisResult
  - phase: 03-01
    provides: analysis-store with addAgentEvent/setAnalysisResult/startAnalysis actions

provides:
  - useAgentStream hook — fetch-based SSE consumer for POST /api/analyze
  - StreamStatus type — idle | running | complete | error
  - AGENT_NAMES const — canonical agent name list
  - AGENT_DISPLAY_NAMES const — human-readable labels
  - getAgentStatus() — derived selector for per-agent dot status in sidebar

affects:
  - 03-dashboard-components
  - 03-sidebar-integration
  - any component rendering per-agent status dots

# Tech tracking
tech-stack:
  added: []
  patterns:
    - fetch + ReadableStream for POST-based SSE (EventSource cannot POST)
    - Buffer-based \n\n frame splitting for SSE parsing
    - AbortController ref pattern for user-initiated stream cancellation
    - Exponential backoff retry with retryCountRef (max 3 attempts)
    - Standalone derived selector functions outside Zustand store

key-files:
  created:
    - src/hooks/use-agent-stream.ts
  modified:
    - src/store/analysis-store.ts

key-decisions:
  - "Accept calmData as parameter to startStream rather than reading from store — avoids stale closure issues"
  - "Derived selectors as standalone functions outside store — keeps store lean, avoids duplicate state"
  - "AbortError and HTTP errors excluded from retry — only network/fetch failures trigger auto-reconnect"

patterns-established:
  - "Post-based SSE: use fetch() + ReadableStream reader, never EventSource (GET-only)"
  - "SSE frame parsing: buffer string + split on \\n\\n, last fragment stays in buffer"
  - "Retry pattern: retryCountRef with max 3 attempts, exponential backoff 2^n seconds"

requirements-completed: [API-05, FEED-06, DASH-02]

# Metrics
duration: 3min
completed: 2026-02-23
---

# Phase 03 Plan 02: SSE Hook & Store Selectors Summary

**fetch-based SSE hook for POST /api/analyze with exponential-backoff reconnect and Zustand-derived per-agent status selectors**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-23T17:00:19Z
- **Completed:** 2026-02-23T17:03:25Z
- **Tasks:** 2 completed
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- useAgentStream hook reads SSE from POST /api/analyze using fetch + ReadableStream, dispatches AgentEvents to Zustand store
- Auto-reconnect logic with exponential backoff (1s, 2s, 4s) caps at 3 attempts; AbortError and HTTP errors correctly excluded
- Store enhanced with AGENT_NAMES, AGENT_DISPLAY_NAMES constants and getAgentStatus() derived selector for sidebar dot rendering

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useAgentStream hook** - `c520f7e` (feat)
2. **Task 2: Add derived agent status selectors to store** - `8fe9c42` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/hooks/use-agent-stream.ts` — Custom hook using fetch() + ReadableStream for POST-based SSE; handles buffer splitting, event dispatch, abort, auto-reconnect
- `src/store/analysis-store.ts` — Added AGENT_NAMES, AGENT_DISPLAY_NAMES exports and getAgentStatus() derived selector

## Decisions Made

- Accept `calmData` as parameter to `startStream` rather than reading from store — avoids stale closure issues and makes the hook explicitly data-driven
- Derived selectors implemented as standalone functions (not store state) — keeps Zustand store lean and avoids derived-state synchronization bugs
- AbortError and HTTP errors (response.ok === false) intentionally excluded from retry logic — only transient network failures trigger reconnect

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript errors in hook implementation**
- **Found during:** Task 1 verification (pnpm typecheck)
- **Issue:** Two type errors: (1) `TextDecoder` constructor doesn't accept `{ stream: true }` — the `stream` option goes to `.decode()` call; (2) `Record<string, unknown>` from `JSON.parse` not directly castable to `AgentEvent` — needed `as unknown as AgentEvent`
- **Fix:** Moved stream option to `.decode(value, { stream: true })` call; added double-cast through `unknown` for the AgentEvent assignment
- **Files modified:** `src/hooks/use-agent-stream.ts`
- **Verification:** `pnpm typecheck` passes with zero errors
- **Committed in:** `c520f7e` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — type errors caught during verification)
**Impact on plan:** Necessary TypeScript correctness fix. No scope creep.

## Issues Encountered

- Pre-existing build error in `src/components/graph/utils/layout.ts:127` (React Flow `sourcePosition: "right"` literal vs `Position` enum) causes `pnpm build` to fail. This error was introduced in commit `2b1fa1b` and is out of scope for this plan. Logged to `deferred-items.md`. `pnpm typecheck` (the plan's specified verification) passes cleanly.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- useAgentStream hook is ready for use in dashboard components and the analyze button
- Sidebar can call `getAgentStatus(agentEvents, activeAgents, name)` to render colored status dots reactively
- The pre-existing React Flow type error in layout.ts should be fixed before `pnpm build` is needed for deployment

---
*Phase: 03-api-routes-dashboard-core*
*Completed: 2026-02-23*
