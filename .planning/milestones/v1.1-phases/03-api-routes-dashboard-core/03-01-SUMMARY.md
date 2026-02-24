---
phase: 03-api-routes-dashboard-core
plan: "01"
subsystem: api-routes
tags: [api, sse, streaming, zod, next-js, routes]
dependency_graph:
  requires:
    - 02-05-SUMMARY.md  # Agent orchestrator and store integration
    - src/lib/agents/orchestrator.ts
    - src/lib/calm/parser.ts
    - src/lib/calm/extractor.ts
  provides:
    - src/lib/api/schemas.ts
    - src/app/api/analyze/route.ts
    - src/app/api/calm/parse/route.ts
    - src/app/api/pipeline/route.ts
  affects:
    - src/lib/ai/streaming.ts  # upgraded to globalThis singleton
    - src/lib/ai/provider.ts   # deferred fail-fast validation
    - src/components/graph/utils/layout.ts  # Position enum fix
tech_stack:
  added: []
  patterns:
    - ReadableStream SSE pattern for Next.js App Router
    - globalThis singleton for hot-reload-safe singletons
    - Deferred provider validation for build-time compatibility
    - z.union for SSE event schema (avoids discriminated union conflicts)
key_files:
  created:
    - src/lib/api/schemas.ts
    - src/app/api/analyze/route.ts
    - src/app/api/calm/parse/route.ts
    - src/app/api/pipeline/route.ts
  modified:
    - src/lib/ai/streaming.ts
    - src/lib/ai/provider.ts
    - src/components/graph/utils/layout.ts
decisions:
  - Deferred LLM provider validation from module init to first use — allows pnpm build without API keys while preserving fail-fast behavior at runtime
  - Used z.union instead of z.discriminatedUnion for sseEventSchema — agentEventTypeSchema includes 'error' which conflicts with terminal SseErrorEvent type literal
  - globalThis singleton for AgentEventEmitter — survives Next.js webpack hot reloads in dev mode
metrics:
  duration: "~6 minutes"
  completed: "2026-02-23"
  tasks_completed: 2
  files_created: 4
  files_modified: 3
---

# Phase 03 Plan 01: API Routes and SSE Streaming Infrastructure Summary

**One-liner:** Three Next.js API routes (POST SSE analyze, POST CALM parse, GET pipeline) backed by shared Zod schemas and a hot-reload-safe globalThis event emitter singleton.

## What Was Built

### Task 1: Shared API Schemas + Event Emitter Upgrade

**`src/lib/api/schemas.ts`** — Single source of truth for all API contracts:
- `analyzeRequestSchema` / `parseRequestSchema` — request body validators
- `sseAgentEventSchema`, `sseDoneEventSchema`, `sseErrorEventSchema` — SSE frame shapes
- `sseEventSchema` — z.union of all SSE event types
- `parseResponseSchema` — CALM parse response shape
- `pipelineResponseSchema` — pipeline result shape (nullable)

**`src/lib/ai/streaming.ts`** — Upgraded to globalThis singleton pattern:
```typescript
export const agentEventEmitter: AgentEventEmitter =
  globalThis.__agentEventEmitter ??
  (globalThis.__agentEventEmitter = new AgentEventEmitter());
```

### Task 2: Three API Routes

**`src/app/api/analyze/route.ts`** — POST SSE streaming endpoint:
- Validates body via `analyzeRequestSchema`
- Parses CALM via `parseCalm()`, returns 400 on invalid CALM
- Creates `ReadableStream` — subscribes to `agentEventEmitter` inside `start()`
- Calls `runAnalysis()` inside the stream callback (not before Response)
- Stores pipeline result in `globalThis.__lastPipelineResult`
- Sends terminal `{ type: 'done', result }` or `{ type: 'error', message }` events
- Returns `text/event-stream` with no-cache headers

**`src/app/api/calm/parse/route.ts`** — POST JSON validation endpoint:
- Validates and parses CALM without running agents
- Returns `{ success: true, data: AnalysisInput }` on success
- Returns 400 with structured error details on failure

**`src/app/api/pipeline/route.ts`** — GET last pipeline result:
- Reads from `globalThis.__lastPipelineResult`
- Returns pipeline config or `{ pipeline: null, message: '...' }` when not available

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pre-existing TypeScript errors in `use-agent-stream.ts`**
- **Found during:** Task 1 typecheck
- **Issue:** `TextDecoderOptions` didn't accept `stream` property; `AgentEvent` cast from `Record<string, unknown>` was a type overlap error
- **Fix:** Linter auto-resolved both (TextDecoder constructor options fix, added `unknown` intermediate cast)
- **Files modified:** `src/hooks/use-agent-stream.ts`
- **Commit:** ed4bc1a

**2. [Rule 1 - Bug] Pre-existing TypeScript errors in `layout.ts` (React Flow Position enum)**
- **Found during:** Task 2 typecheck
- **Issue:** `'left' as const` and `'right' as const` string literals not assignable to React Flow `Position` enum type
- **Fix:** Imported `Position` from `@xyflow/react` and replaced string literals with `Position.Left` / `Position.Right`
- **Files modified:** `src/components/graph/utils/layout.ts`
- **Commit:** d9fcdd7

**3. [Rule 1 - Bug] LLM provider fail-fast runs at module initialization, blocking `pnpm build`**
- **Found during:** Task 2 build verification
- **Issue:** `throw new Error('No LLM provider API keys configured...')` executed at module level; Next.js static build doesn't have API keys so it threw during "Collecting page data"
- **Fix:** Moved validation into `assertProviderConfigured()` helper called inside `getDefaultModel()` and `getModelForAgent()` — fail-fast preserved at runtime, build-time safe
- **Files modified:** `src/lib/ai/provider.ts`
- **Commit:** d9fcdd7

**4. [Rule 1 - Bug] Zod discriminated union conflict in `sseEventSchema`**
- **Found during:** Task 2 build verification
- **Issue:** `z.discriminatedUnion` requires unique discriminator values per variant; `agentEventTypeSchema` enum includes `'error'` and `sseErrorEventSchema` also uses `z.literal('error')` — duplicate discriminator key
- **Fix:** Changed `z.discriminatedUnion` to `z.union` — client code still uses `parsed.type` for discrimination, behavior identical
- **Files modified:** `src/lib/api/schemas.ts`
- **Commit:** d9fcdd7

## Verification Results

```
pnpm typecheck  EXIT 0  (zero errors)
pnpm build      EXIT 0  (all 3 routes compiled as ƒ dynamic routes)

Route (app)
├ ƒ /api/analyze      130 B
├ ƒ /api/calm/parse   130 B
├ ƒ /api/pipeline     130 B
```

- globalThis pattern confirmed: `grep globalThis.__agentEventEmitter streaming.ts` ✓
- SSE headers confirmed: `text/event-stream; charset=utf-8` in analyze/route.ts ✓
- `runAnalysis` inside `start()` callback confirmed (not before Response) ✓
- All 4 new files exist on disk ✓

## Commits

| Hash | Description |
|------|-------------|
| `ed4bc1a` | feat(03-01): add shared API schemas and upgrade event emitter to globalThis singleton |
| `d9fcdd7` | feat(03-01): add SSE analyze route, CALM parse route, and pipeline route |

## Self-Check: PASSED
