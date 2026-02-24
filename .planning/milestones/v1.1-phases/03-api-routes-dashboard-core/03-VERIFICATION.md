---
phase: 03-api-routes-dashboard-core
verified: 2026-02-23T00:00:00Z
status: passed
score: 20/20 must-haves verified
re_verification: false
---

# Phase 3: API Routes & Dashboard Core — Verification Report

**Phase Goal:** HTTP API routes accept CALM JSON and stream agent events via SSE, dashboard displays real-time agent activity feed and interactive architecture graph with compliance coloring.
**Verified:** 2026-02-23
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | POST /api/analyze accepts CALM JSON and returns SSE text/event-stream | VERIFIED | `src/app/api/analyze/route.ts` parses body with `analyzeRequestSchema`, calls `parseCalm`, runs `runAnalysis` inside ReadableStream.start(), returns `text/event-stream; charset=utf-8` headers |
| 2 | POST /api/calm/parse accepts CALM JSON and returns typed AnalysisInput as JSON | VERIFIED | `src/app/api/calm/parse/route.ts` validates with `parseRequestSchema`, calls `parseCalm` + `extractAnalysisInput`, returns `{ success: true, data: analysisInput }` |
| 3 | GET /api/pipeline returns most recent pipeline generation result | VERIFIED | `src/app/api/pipeline/route.ts` reads `globalThis.__lastPipelineResult`, returns `{ pipeline: PipelineConfig }` or `{ pipeline: null, message: string }` |
| 4 | SSE events include agent identity, event type, message, and data payload | VERIFIED | `sseAgentEventSchema` in `schemas.ts` enforces `type`, `agent` (identity), `message`, `severity`, `data`, `timestamp`; events serialized as `data: ${JSON.stringify(event)}\n\n` |
| 5 | API contracts are defined with Zod schemas in src/lib/api/schemas.ts | VERIFIED | File exports `analyzeRequestSchema`, `parseRequestSchema`, `sseAgentEventSchema`, `sseDoneEventSchema`, `sseErrorEventSchema`, `sseEventSchema`, `parseResponseSchema`, `pipelineResponseSchema` |
| 6 | Client hook connects to POST /api/analyze via fetch and reads SSE stream | VERIFIED | `src/hooks/use-agent-stream.ts` uses `fetch('/api/analyze', { method: 'POST' })`, reads `response.body.getReader()`, splits on `\n\n` frame boundaries |
| 7 | Hook exposes stream status (idle, running, complete, error) with auto-reconnect | VERIFIED | `StreamStatus` type defined; retry logic caps at 3 attempts with exponential backoff (1000 * 2^n ms); AbortError and HTTP errors excluded from retry |
| 8 | Hook dispatches SSE events to Zustand store via addAgentEvent and setAnalysisResult | VERIFIED | Regular events → `addAgentEvent(parsed)`, done events → `setAnalysisResult(parsed.result)`, error events → `setStatus('error')` |
| 9 | Sidebar agent dots derive status from store's agentEvents array | VERIFIED | `sidebar.tsx` imports `getAgentStatus`, `AGENT_NAMES`, `AGENT_DISPLAY_NAMES` from store; maps over AGENT_NAMES with live store selectors |
| 10 | Dashboard has dark theme (slate-900/950) with left sidebar navigation | VERIFIED | `dashboard-layout.tsx` uses `bg-slate-950`; `sidebar.tsx` uses `bg-slate-900 border-r border-slate-800`; nav items: Overview, Architecture, Compliance, Pipeline, Findings |
| 11 | Sidebar shows agent status indicators that update in real-time from store | VERIFIED | `statusColors` map: idle=`bg-slate-600`, running=`bg-blue-500 animate-pulse`, complete=`bg-emerald-500`, error=`bg-red-500`; no hardcoded agents array |
| 12 | Header contains architecture selector dropdown and Analyze button | VERIFIED | `header.tsx` renders `<Select>` with DEMO_ARCHITECTURES and `<AnalyzeButton>` component; on change loads and parses demo CALM data |
| 13 | Agent feed shows real-time scrolling events with auto-scroll | VERIFIED | `agent-feed.tsx` reads from store `agentEvents`, renders `<AgentFeedEvent>` list, `useEffect` on `agentEvents.length` calls `bottomRef.current?.scrollIntoView({ behavior: 'smooth' })` |
| 14 | Each event displays agent icon, agent name, timestamp, and message | VERIFIED | `agent-feed-event.tsx` renders icon (from ICON_MAP), `event.agent.displayName`, `formatTime(event.timestamp)` (HH:MM:SS), `event.message` |
| 15 | Finding events show severity badge with color coding | VERIFIED | SEVERITY_STYLES map covers critical/high/medium/low/info; badge rendered conditionally when `event.type === 'finding' && event.severity` |
| 16 | Thinking events show animated pulsing dots | VERIFIED | `{event.type === 'thinking' && <span className="animate-pulse ml-1 text-slate-500">...</span>}` |
| 17 | Architecture graph renders CALM nodes as custom React Flow nodes by type | VERIFIED | `architecture-graph.tsx` defines `nodeTypes` outside component; `calmToFlow` maps CALM node-type to service/database/webclient/actor/system/default |
| 18 | Graph edges show protocol labels between connected nodes | VERIFIED | `ProtocolEdge` uses `EdgeLabelRenderer` to render `data.protocol` at `(labelX, labelY)` midpoint; `calmToFlow` sets `data: { protocol: rel.protocol }` |
| 19 | Node border colors reflect compliance status (green/amber/red) | VERIFIED | `borderColors` in `service-node.tsx`: compliant=`border-emerald-500`, partial=`border-amber-500`, non-compliant=`border-red-500`, unknown=`border-slate-600` |
| 20 | Graph uses dagre auto-layout and edges animate during analysis | VERIFIED | `layout.ts` uses `@dagrejs/dagre` with `rankdir: direction` (LR); `architecture-graph.tsx` sets `animated: isAnalyzing` on all edges via `animatedEdges` useMemo |

**Score:** 20/20 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/api/schemas.ts` | Shared Zod schemas for API request/response contracts | VERIFIED | Exports `analyzeRequestSchema`, `parseRequestSchema`, `sseEventSchema`, `pipelineResponseSchema` and all inferred types |
| `src/app/api/analyze/route.ts` | POST SSE streaming endpoint | VERIFIED | Exports `POST`; `dynamic = 'force-dynamic'`; uses ReadableStream.start(); text/event-stream headers |
| `src/app/api/calm/parse/route.ts` | POST CALM parse endpoint | VERIFIED | Exports `POST`; calls `parseCalm` + `extractAnalysisInput`; returns JSON |
| `src/app/api/pipeline/route.ts` | GET pipeline result endpoint | VERIFIED | Exports `GET`; reads `globalThis.__lastPipelineResult`; `dynamic = 'force-dynamic'` |
| `src/lib/ai/streaming.ts` | GlobalThis singleton event emitter | VERIFIED | `globalThis.__agentEventEmitter ?? (globalThis.__agentEventEmitter = new AgentEventEmitter())` pattern present |
| `src/hooks/use-agent-stream.ts` | Custom fetch-based SSE hook | VERIFIED | Exports `useAgentStream` with `startStream`, `abort`, `streamStatus`; uses fetch not EventSource |
| `src/store/analysis-store.ts` | Updated store with derived agent status selectors | VERIFIED | Exports `getAgentStatus`, `AGENT_NAMES`, `AGENT_DISPLAY_NAMES`; `addAgentEvent` manages `activeAgents` |
| `src/components/dashboard/sidebar.tsx` | Sidebar with live agent status dots | VERIFIED | Imports `getAgentStatus`, `AGENT_NAMES`; maps over AGENT_NAMES dynamically |
| `src/components/dashboard/header.tsx` | Header with architecture selector and Analyze button | VERIFIED | Contains `useAgentStream`, `<Select>`, `<AnalyzeButton>` |
| `src/components/dashboard/analyze-button.tsx` | Analyze button with loading state | VERIFIED | Exports `AnalyzeButton`; Play icon normal state; Loader2 animate-spin loading state |
| `src/components/layout/dashboard-layout.tsx` | Layout with right column for feed panel | VERIFIED | Flex row main: `<div className="flex-1 overflow-auto">` + `<div className="w-80 border-l border-slate-800 flex-shrink-0"><AgentFeed /></div>` |
| `src/components/dashboard/agent-feed.tsx` | Agent feed container with ScrollArea and auto-scroll | VERIFIED | Exports `AgentFeed`; reads store; `useEffect` auto-scroll; empty states for idle and analyzing |
| `src/components/dashboard/agent-feed-event.tsx` | Individual event row with animation and severity badge | VERIFIED | Exports `AgentFeedEvent`; `animate-slide-in-right` class; staggered `animationDelay`; all 5 event types handled |
| `src/components/graph/architecture-graph.tsx` | React Flow wrapper with custom node types | VERIFIED | Exports `ArchitectureGraph`; `nodeTypes`/`edgeTypes` defined outside component; reads store; `useMemo` for calmToFlow |
| `src/components/graph/nodes/service-node.tsx` | Custom node for service CALM type | VERIFIED | Handle elements; compliance border; Server icon; blue accent |
| `src/components/graph/nodes/trust-boundary-node.tsx` | Trust boundary group node | VERIFIED | No Handles; dashed border; `w-full h-full relative`; label top-left |
| `src/components/graph/edges/protocol-edge.tsx` | Protocol-labeled edge | VERIFIED | `BaseEdge` + `EdgeLabelRenderer`; `getBezierPath`; renders `data.protocol` at midpoint |
| `src/components/graph/utils/layout.ts` | Dagre auto-layout function | VERIFIED | Exports `getLayoutedElements`; excludes trustBoundary from dagre; computes parent bounds from children |
| `src/components/graph/utils/calm-to-flow.ts` | CALM-to-Flow transformer | VERIFIED | Exports `calmToFlow`; maps nodes/edges/trust boundaries; applies dagre; handles null analysis gracefully |
| `src/app/dashboard/page.tsx` | Overview tab with graph and completion banner | VERIFIED | Renders `<ArchitectureGraph>` in card; completion banner with `CheckCircle2`; empty state CTA |
| `src/app/dashboard/architecture/page.tsx` | Dedicated architecture graph page | VERIFIED | Exports default; renders `<ArchitectureGraph>` full-height |
| `src/app/globals.css` | slide-in-right animation | VERIFIED | `@keyframes slide-in-right` + `--animate-slide-in-right: slide-in-right 0.3s ease-out forwards` in `@theme` |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `api/analyze/route.ts` | `lib/agents/orchestrator.ts` | `runAnalysis()` inside ReadableStream.start() | WIRED | Line 90: `const result = await runAnalysis(analysisInput);` inside `async start(controller)` |
| `api/analyze/route.ts` | `lib/ai/streaming.ts` | `agentEventEmitter.subscribe()` | WIRED | Line 79: `const unsubscribe = agentEventEmitter.subscribe(...)` |
| `api/calm/parse/route.ts` | `lib/calm/parser.ts` | `parseCalm()` for validation | WIRED | Line 38: `const parseResult = parseCalm(bodyResult.data.calm)` |
| `use-agent-stream.ts` | `/api/analyze` | fetch POST with ReadableStream reader | WIRED | Line 48: `fetch('/api/analyze', { method: 'POST', ... })` + `response.body.getReader()` |
| `use-agent-stream.ts` | `analysis-store.ts` | `addAgentEvent`, `setAnalysisResult`, `startAnalysis`, `setStatus` | WIRED | Line 34: destructures all four from `useAnalysisStore()` |
| `sidebar.tsx` | `analysis-store.ts` | `useAnalysisStore` for agentEvents and activeAgents | WIRED | Lines 44-45: individual selectors `state => state.agentEvents`, `state => state.activeAgents` |
| `header.tsx` | `use-agent-stream.ts` | `useAgentStream` for triggering analysis | WIRED | Line 28: `const { startStream } = useAgentStream()` |
| `header.tsx` | `analysis-store.ts` | store for rawCalmData and status | WIRED | Lines 19-26: individual selectors for rawCalmData, analysisInput, status, etc. |
| `agent-feed.tsx` | `analysis-store.ts` | `useAnalysisStore` for agentEvents | WIRED | Line 50: `useAnalysisStore((state) => state.agentEvents)` |
| `dashboard-layout.tsx` | `agent-feed.tsx` | `AgentFeed` in right column | WIRED | Line 6: `import { AgentFeed }` + rendered at line 31 in w-80 right column |
| `architecture-graph.tsx` | `calm-to-flow.ts` | `calmToFlow` transforms CALM data | WIRED | Line 8: `import { calmToFlow }` + used in `useMemo` at line 66 |
| `calm-to-flow.ts` | `layout.ts` | `getLayoutedElements` applies dagre | WIRED | Line 6: `import { getLayoutedElements }` + called at line 182 |
| `architecture-graph.tsx` | `analysis-store.ts` | reads `analysisInput`, `analysisResult`, `status` | WIRED | Lines 53-55: three individual store selectors |
| `dashboard/page.tsx` | `architecture-graph.tsx` | `ArchitectureGraph` in overview grid | WIRED | Line 7: `import { ArchitectureGraph }` + rendered inside Card at line 71 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| API-01 | 03-01 | POST /api/analyze accepts CALM JSON and returns SSE stream | SATISFIED | `src/app/api/analyze/route.ts` — ReadableStream with text/event-stream headers |
| API-02 | 03-01 | POST /api/calm/parse accepts CALM JSON and returns typed AnalysisInput | SATISFIED | `src/app/api/calm/parse/route.ts` — returns `{ success: true, data: analysisInput }` |
| API-03 | 03-01 | GET /api/pipeline returns most recent pipeline result | SATISFIED | `src/app/api/pipeline/route.ts` — reads globalThis.__lastPipelineResult |
| API-04 | 03-01 | SSE events include agent identity, event type, message, and data payload | SATISFIED | `sseAgentEventSchema` enforces agent identity (name/displayName/icon/color), type, message, severity, data, timestamp |
| API-05 | 03-02 | Client EventSource hook manages connection state with auto-reconnect | SATISFIED | `use-agent-stream.ts` — StreamStatus FSM, retryCountRef, exponential backoff, AbortError excluded |
| API-06 | 03-01 | API contracts defined with Zod schemas in shared location | SATISFIED | `src/lib/api/schemas.ts` — single source of truth for all API contracts |
| DASH-01 | 03-03 | Dashboard has dark theme with left sidebar navigation | SATISFIED | `dashboard-layout.tsx` bg-slate-950; `sidebar.tsx` bg-slate-900 with 5 nav items |
| DASH-02 | 03-02, 03-03 | Sidebar shows navigation items with agent status indicators | SATISFIED | Nav items present; agent dots driven by `getAgentStatus` from store |
| DASH-03 | 03-03 | Top header displays "CALMGuard" with architecture selector | SATISFIED | Logo "CALMGuard" in sidebar; header has `<Select>` with architecture dropdown |
| DASH-04 | 03-03, 03-06 | Main content area uses responsive grid layout optimized for 1920x1080 | SATISFIED | `lg:grid-cols-2` grid on dashboard page; flex layout with permanent right column |
| VIZ-01 | 03-05 | Architecture graph renders CALM nodes as custom React Flow nodes by type | SATISFIED | 6 custom node types: service/database/webclient/actor/system/default; mapped in calmToFlow |
| VIZ-02 | 03-05 | Graph edges show protocol labels | SATISFIED | ProtocolEdge renders `data.protocol` via EdgeLabelRenderer at bezier midpoint |
| VIZ-03 | 03-05 | Node border colors reflect compliance status and update in real-time | SATISFIED | borderColors map in service-node.tsx; complianceStatus from riskAssessment.nodeRiskMap |
| VIZ-04 | 03-05 | Trust boundaries render as dashed-border rectangles grouping nodes | SATISFIED | TrustBoundaryNode: `border-dashed border-2`; trust boundary parent nodes with `parentId`/`extent: 'parent'` |
| VIZ-05 | 03-05 | Graph uses dagre auto-layout with animated edges during analysis | SATISFIED | `getLayoutedElements` with `rankdir: 'LR'`; `animated: isAnalyzing` set on all edges |
| FEED-01 | 03-04 | Real-time scrolling agent event feed | SATISFIED | `AgentFeed` with ScrollArea; reads from store; auto-scroll useEffect |
| FEED-02 | 03-04 | Each event shows colored agent icon + name + timestamp + message | SATISFIED | ICON_MAP with 5 agent icons; `event.agent.color` inline style; formatTime(HH:MM:SS); displayName |
| FEED-03 | 03-04 | Events appear with slide-in animation; thinking events show animated dots | SATISFIED | `animate-slide-in-right` CSS class; `@keyframes slide-in-right` in globals.css; `animate-pulse` on thinking |
| FEED-04 | 03-04 | Finding events show severity badge (critical=red, high=orange, medium=yellow, low=blue) | SATISFIED | SEVERITY_STYLES with all 5 levels; badge rendered on `event.type === 'finding' && event.severity` |
| FEED-05 | 03-04 | Feed auto-scrolls to latest event | SATISFIED | `useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [agentEvents.length])` |
| FEED-06 | 03-02, 03-03 | Sidebar agent dots light up in sequence as each agent starts | SATISFIED | `addAgentEvent` maintains `activeAgents`; `getAgentStatus` returns 'running' when in activeAgents; pulse animation applied |

**All 21 Phase 3 requirement IDs verified as SATISFIED.**

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/components/calm/architecture-selector.tsx:128` | "Coming soon" text on file upload feature | Info | Expected — CALM-04 (file upload) is deferred to Phase 6 per REQUIREMENTS.md traceability |
| `deferred-items.md` | `pnpm build` fails without API keys due to eager provider validation | Warning | Pre-existing from Phase 2; documented. Requires env var to build. Dev server works. |
| `src/components/dashboard/compliance-card-skeleton.tsx` | Skeleton placeholder for compliance card | Info | Expected — COMP-01 through COMP-06 are Phase 4 deliverables; intentional placeholder |
| `src/components/dashboard/pipeline-preview-skeleton.tsx` | Skeleton placeholder for pipeline preview | Info | Expected — PIPE-01 through PIPE-03 are Phase 4 deliverables; intentional placeholder |

No blockers found. All placeholders are explicitly intentional for future phases.

---

## Human Verification Required

### 1. SSE Streaming End-to-End

**Test:** Select a demo architecture in the header dropdown, click "Analyze," and observe the agent feed.
**Expected:** Agent dots in sidebar light up blue in sequence as each agent starts, events slide in from the right in the feed panel, thinking events show pulsing dots, finding events show severity badges.
**Why human:** Requires a running dev server with `GOOGLE_GENERATIVE_AI_API_KEY` set; SSE streaming behavior is not verifiable from static code.

### 2. Architecture Graph Rendering

**Test:** Load the Trading Platform demo and wait for analysis to complete.
**Expected:** Graph renders CALM nodes as typed custom nodes (server icon for services, database icon for databases, etc.), edges display protocol labels (HTTPS, JDBC, etc.), and node border colors transition from gray to green/amber/red as compliance results arrive.
**Why human:** React Flow rendering, dagre layout quality, and compliance coloring require visual inspection.

### 3. Tab Navigation During Analysis

**Test:** Click "Analyze," then switch between Overview, Architecture, Compliance, Pipeline tabs while analysis is running.
**Expected:** Agent feed remains visible in right column across all tabs; sidebar dots continue updating; no layout breakage.
**Why human:** Routing behavior under concurrent state updates requires live testing.

### 4. Auto-Scroll Behavior

**Test:** Trigger an analysis that produces many events (>10) in the feed.
**Expected:** Feed automatically scrolls to show latest event as each new event arrives.
**Why human:** ScrollArea + scrollIntoView behavior depends on DOM layout and scrolling mechanics.

---

## Gaps Summary

No gaps found. All 20/20 observable truths verified. All 21 requirement IDs (API-01 through API-06, DASH-01 through DASH-04, VIZ-01 through VIZ-05, FEED-01 through FEED-06) have implementation evidence in the codebase.

The phase goal is achieved:
- HTTP API routes accept CALM JSON and stream agent events via SSE (API routes fully wired to orchestrator and event emitter)
- Dashboard displays real-time agent activity feed (AgentFeed in permanent right column, events slide in with animation)
- Interactive architecture graph with compliance coloring (React Flow + dagre + 7 custom node types + compliance border colors)

Notable constraints properly documented:
- Build requires LLM API keys (pre-existing Phase 2 issue, not a Phase 3 gap)
- File upload (CALM-04) and compliance display (COMP-01 to COMP-06) are intentionally deferred to later phases

---

_Verified: 2026-02-23T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
