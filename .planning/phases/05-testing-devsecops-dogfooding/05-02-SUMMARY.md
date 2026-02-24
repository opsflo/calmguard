---
phase: 05-testing-devsecops-dogfooding
plan: "02"
subsystem: testing
tags: [vitest, next.js, sse, api-routes, orchestrator, mocking, vi.importActual]

# Dependency graph
requires:
  - phase: 05-testing-devsecops-dogfooding
    plan: "01"
    provides: Vitest 4 test infrastructure with path alias resolution and 12 passing unit tests

provides:
  - POST /api/calm/parse contract tests (4 tests): 200 response shape, 400 invalid CALM, 400 missing field, 400 bad JSON
  - POST /api/analyze SSE streaming tests (4 tests): Content-Type text/event-stream, readable stream data frames, 400 error paths
  - runAnalysis orchestrator flow tests (2 tests): Phase 1 parallel + Phase 2 sequential, risk-scorer skip on arch failure
  - TEST-05 documented as deferred (dashboard component tests) in orchestrator.test.ts

affects:
  - 05-testing-devsecops-dogfooding (total suite: 22 tests, 6 files, <1 second)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vi.importActual pattern for partial mocking: spread actual module, override only the function under test — preserves Zod schemas used at module init level"
    - "NextRequest construction for route handler tests: no HTTP server needed, import POST handler directly and call with constructed NextRequest"
    - "SSE stream reading in tests: reader.read() loop + TextDecoder accumulation to verify data frame format"

key-files:
  created:
    - src/__tests__/api/parse.test.ts
    - src/__tests__/api/analyze.test.ts
    - src/__tests__/agents/orchestrator.test.ts
  modified: []

key-decisions:
  - "vi.importActual for agent mocks: orchestrator.ts imports architectureAnalysisSchema/complianceMappingSchema/pipelineConfigSchema at module level to build analysisResultSchema — mocking with {} breaks .nullable() calls; vi.importActual preserves real Zod schemas while replacing only the function"
  - "NextRequest direct construction: API route tests call POST(req) directly with constructed NextRequest — no HTTP server, no supertest, no test server startup"
  - "TEST-05 (dashboard component tests) deferred to post-hackathon: async server components not testable in jsdom"

patterns-established:
  - "Partial agent mock via vi.importActual: use ...actual spread then override function — allows testing orchestration without real LLM calls while preserving exported schema types"
  - "SSE stream test pattern: create ReadableStream reader, accumulate decoded chunks, assert on 'data: ' prefix and terminal event type"
  - "Route handler integration test: import POST from route file, build NextRequest with JSON body, assert on Response.status and .json() body"

requirements-completed: [TEST-03, TEST-04]

# Metrics
duration: 4min
completed: 2026-02-24
---

# Phase 5 Plan 02: API Route Contract Tests + Orchestrator Flow Tests Summary

**22 tests across 6 files covering POST /api/calm/parse (4 tests), POST /api/analyze SSE streaming (4 tests), and runAnalysis orchestration order (2 tests), all mocked — zero LLM calls, runtime 930ms**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-24T08:43:34Z
- **Completed:** 2026-02-24T08:47:09Z
- **Tasks:** 1
- **Files modified:** 3 (created)

## Accomplishments

- Created `parse.test.ts` with 4 contract tests for POST /api/calm/parse: verifies 200 with AnalysisInput shape, 400 for invalid CALM doc (missing unique-id), 400 for missing calm field, 400 for malformed JSON — all call the exported POST handler directly with NextRequest
- Created `analyze.test.ts` with 4 SSE streaming tests for POST /api/analyze: verifies Content-Type is `text/event-stream`, response body is a readable stream yielding `data: ` SSE frames with terminal `done`/`error` event, plus 400 error paths — all LLM agents mocked via vi.importActual
- Created `orchestrator.test.ts` with 2 flow tests: Phase 1 parallel execution verified (all 3 agents called with correct args), Phase 2 risk-scorer receives Phase 1 results as input, and risk-scorer is skipped when architecture agent fails — TEST-05 documented as deferred

## Task Commits

Each task was committed atomically:

1. **Task 1: Write API route contract tests and orchestrator flow test** - `91009e9` (test)

## Files Created/Modified

- `src/__tests__/api/parse.test.ts` - 4 tests for POST /api/calm/parse contract (status codes, response shapes)
- `src/__tests__/api/analyze.test.ts` - 4 tests for POST /api/analyze SSE streaming (Content-Type, stream frames, error paths)
- `src/__tests__/agents/orchestrator.test.ts` - 2 tests for runAnalysis orchestration order (parallel Phase 1, sequential Phase 2, skip logic)

## Decisions Made

- **vi.importActual for partial agent mocking**: `orchestrator.ts` imports `architectureAnalysisSchema`, `complianceMappingSchema`, and `pipelineConfigSchema` at module level to construct `analysisResultSchema = z.object({ architecture: architectureAnalysisSchema.nullable(), ... })`. Mocking these with `{}` causes `TypeError: .nullable is not a function`. Fix: use `vi.mock('@/lib/agents/architecture-analyzer', async () => ({ ...await vi.importActual(...), analyzeArchitecture: vi.fn(...) }))` — spreads the real module (keeping Zod schemas intact) while replacing only the async function.
- **TEST-05 deferred**: Dashboard component tests (async server components, Zustand hooks) are not testable in jsdom without complex setup. Documented in orchestrator.test.ts JSDoc comment.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Schema mock replaced with vi.importActual pattern**
- **Found during:** Task 1 (first test run)
- **Issue:** Mocking agent modules with `{ analyzeArchitecture: vi.fn(), architectureAnalysisSchema: {} }` broke module initialization — `orchestrator.ts` calls `.nullable()` on the exported schemas at top-level const declaration, causing `TypeError: architectureAnalysisSchema.nullable is not a function`
- **Fix:** Changed all 4 agent mocks to use `vi.importActual` to spread real module exports, then override only the function mock. Applied identically in both `analyze.test.ts` and `orchestrator.test.ts`
- **Files modified:** `src/__tests__/api/analyze.test.ts`, `src/__tests__/agents/orchestrator.test.ts`
- **Verification:** `pnpm test:run` passes all 22 tests after fix
- **Committed in:** `91009e9` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — schema mock broke module initialization)
**Impact on plan:** Single fix required, discovered on first run. No scope creep. All plan objectives met.

## Issues Encountered

The vi.importActual fix was the only issue. Plan 01's test infrastructure worked correctly — the test runner, path aliases, and jsdom environment all functioned as expected.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Total test suite: 22 tests, 6 files, runtime 930ms — well within 30-second budget
- All LLM calls mocked: tests run in CI without API keys (plan 03 CI workflow confirmed)
- API contracts verified: parse route (status codes, response shape), analyze route (SSE streaming)
- Orchestration flow verified: parallel Phase 1, sequential Phase 2, graceful degradation on agent failure
- TEST-05 (dashboard component tests) explicitly documented as deferred to post-hackathon

## Self-Check: PASSED

- FOUND: src/__tests__/api/parse.test.ts
- FOUND: src/__tests__/api/analyze.test.ts
- FOUND: src/__tests__/agents/orchestrator.test.ts
- FOUND: commit 91009e9 (test(05-02): add API route contract tests and orchestrator flow tests)

---
*Phase: 05-testing-devsecops-dogfooding*
*Completed: 2026-02-24*
