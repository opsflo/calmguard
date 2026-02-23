# Phase 03: API Routes & Dashboard Core - Research

**Researched:** 2026-02-23
**Domain:** Next.js SSE API routes, React Flow graph visualization, Zustand state, real-time dashboard
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Dashboard layout & navigation
- Hybrid approach: Overview tab shows summary grid with key metrics from all sections; other tabs (Architecture, Compliance, Pipeline, Findings) show detailed views per section
- Architecture selector: Landing page for first-time selection, header dropdown to switch without leaving dashboard after initial pick
- Explicit "Analyze" button to start analysis (not auto-start on selection)
- Free tab navigation during analysis — user can switch tabs while agents are running, each tab updates in real-time

#### Agent activity feed
- Show every event: started, thinking, finding, completed, error — full visibility into agent reasoning
- Always auto-scroll to latest event during analysis
- Severity-based coloring: green=info, amber=warning, red=critical; agent identity shown via icon/label, not color
- Feed lives in a dedicated right column panel, always visible alongside main content

#### Real-time streaming UX
- Pre-analysis: empty state panels with centered "Select an architecture and click Analyze" call-to-action
- Analysis triggered by explicit button click after architecture selection
- Completion: subtle toast/banner ("Analysis complete — 4 agents finished in 12s"), no dramatic overlay

### Claude's Discretion
- Sidebar behavior (collapsible vs fixed, icon-only mode)
- Overview tab layout design (panel arrangement, metrics placement)
- Architecture graph node visual style (icon + shape approach, dark theme optimization)
- Node click interaction (detail panel vs tooltip)
- Trust boundary visualization style
- Graph layout mode (auto-layout only vs draggable)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| API-01 | POST /api/analyze accepts CALM JSON and returns SSE stream of agent events | SSE pattern: single POST route with ReadableStream returning `text/event-stream` headers; globalThis singleton pattern for event emitter |
| API-02 | POST /api/calm/parse accepts CALM JSON and returns typed AnalysisInput | Simple JSON route; parseCalm + extractAnalysisInput already exist in lib/calm |
| API-03 | GET /api/pipeline returns most recent pipeline generation result | Simple JSON route; need a store for last pipeline result (module-level variable with globalThis pattern) |
| API-04 | SSE events include agent identity (name, icon, color), event type, message, data payload | AgentEvent type already defined in lib/agents/types.ts — wire to SSE data field |
| API-05 | Client EventSource hook manages connection state (idle/running/complete/error) with auto-reconnect | Custom useAgentStream hook; SSE is POST-based so use fetch + ReadableStream reader (not native EventSource) |
| API-06 | API contracts clearly defined with Zod schemas in shared location | Zod schemas already exist; create src/lib/api/schemas.ts as shared contract layer |
| DASH-01 | Dark theme (slate-900 bg, slate-800 cards) with left sidebar navigation | Sidebar already scaffolded; needs real agent status from Zustand store |
| DASH-02 | Sidebar shows agent status dots (gray/blue/green/red) that update in real-time | Connect Sidebar to useAnalysisStore activeAgents; statusColors already defined |
| DASH-03 | Top header with architecture selector dropdown (not just status badge) | Upgrade Header to include Select component for switching architecture while on dashboard |
| DASH-04 | Responsive grid layout for 1920x1080 with feed always visible in right column | Main layout: flex row; left = content grid; right = always-visible feed panel |
| VIZ-01 | React Flow nodes rendered by CALM type (service, database, webclient, actor, system) | @xyflow/react custom nodes with NodeProps<T> typed per node-type |
| VIZ-02 | Graph edges show protocol labels | EdgeLabel or custom edge with `label` prop on React Flow edges |
| VIZ-03 | Node border colors reflect compliance status (green/amber/red), update in real-time | Node data carries `complianceStatus`; update via setNodes when RiskAssessment arrives |
| VIZ-04 | Trust boundaries as dashed-border rectangles grouping nodes | React Flow parent/group nodes with `parentId`; custom group node type with dashed border CSS |
| VIZ-05 | Dagre auto-layout (hierarchical left-to-right) with animated edges during analysis | @dagrejs/dagre with direction='LR'; edges get `animated: true` while status=analyzing |
| FEED-01 | Real-time scrolling agent event feed | ScrollArea with overflow-y; events from useAnalysisStore.agentEvents |
| FEED-02 | Each event shows agent icon + name + timestamp + message | AgentEvent.agent.icon (lucide name), agent.displayName, event.timestamp, event.message |
| FEED-03 | Slide-in animation; thinking events show animated dots | tailwindcss-animate `animate-in slide-in-from-right`; thinking status = pulsing dots |
| FEED-04 | Finding events show severity badge | Severity → Badge variant map: critical=red, high=orange, medium=yellow, low=blue, info=slate |
| FEED-05 | Feed auto-scrolls to latest event | useEffect + scrollIntoView or scrollTop on each new event |
| FEED-06 | Sidebar agent dots light up in sequence as agents start | Derive per-agent status from agentEvents array in Zustand |
</phase_requirements>

---

## Summary

Phase 3 connects the Phase 2 agent infrastructure to the user's screen via three parallel tracks: (1) API routes that accept CALM JSON and stream agent events via SSE, (2) a real-time Zustand-connected dashboard shell with navigation and architecture selector, and (3) React Flow graph visualization and agent activity feed.

The most critical architectural decision is the SSE streaming pattern. Because POST requests are used (CALM JSON is sent in the body), native `EventSource` cannot be used client-side — it only supports GET requests. The pattern is: POST route returns a `ReadableStream` with `text/event-stream` headers, and the client uses the Fetch API to read the stream. The existing `agentEventEmitter` singleton in `src/lib/ai/streaming.ts` must be anchored to `globalThis` to survive Next.js hot reloads and webpack's multi-instance module loading.

React Flow v12 (`@xyflow/react`) is the current package. It requires `@xyflow/react/dist/style.css` import and needs `@dagrejs/dagre` as a companion for hierarchical auto-layout. Trust boundaries are modeled using React Flow's parent/group node system (`parentId` + custom group node type). The dashboard layout puts the agent feed permanently in a right-column panel using flexbox, satisfying the requirement that it be always visible alongside main content.

**Primary recommendation:** Build the SSE route as a POST handler that runs agents inside `ReadableStream.start()` and streams events via the globalThis-anchored emitter. Build the client as a custom `useAgentStream` hook using `fetch()` + async ReadableStream reader rather than `EventSource`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@xyflow/react` | 12.x | Architecture graph visualization | Official v12 of React Flow — package renamed from `reactflow`; active maintenance |
| `@dagrejs/dagre` | 1.x | Hierarchical auto-layout for React Flow | Recommended in React Flow official examples; simple, fast, well-documented |
| `tailwindcss-animate` | 1.x | Slide-in/fade-in animations for feed | Community standard for `animate-in`, `slide-in-from-*` utilities; works with shadcn/ui |
| `zustand` | 5.0.3 | Client-side state (already installed) | Already in project; flat structure, minimal boilerplate |
| `zod` | 3.24.x | API contract validation (already installed) | Already in project; used for all schemas |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@radix-ui/react-scroll-area` | 1.2.x | Feed scroll container (already installed) | Virtualized scroll for agent feed events |
| `@radix-ui/react-toast` | 1.x | Completion toast/banner | Install if not present; show "Analysis complete" toast |
| `lucide-react` | 0.564.x | Node type icons (already installed) | Agent identity icons, nav icons, node type icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@dagrejs/dagre` | `elkjs` | ELK produces better layouts for complex graphs but is much larger and slower; dagre is sufficient for CALM architectures with 5-15 nodes |
| Custom fetch SSE hook | `react-eventsource` / `react-sse-hooks` | Third-party hooks only support GET-based EventSource; POST SSE requires custom fetch-based implementation |
| `tailwindcss-animate` | CSS `@keyframes` in globals.css | tailwindcss-animate integrates with Tailwind classes; globals.css keyframes require v4 `@theme` syntax and more boilerplate |

**Installation:**
```bash
pnpm add @xyflow/react @dagrejs/dagre tailwindcss-animate
pnpm add -D @types/dagre  # if needed
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    api/
      analyze/
        route.ts           # POST → SSE stream (runs orchestrator, streams events)
      calm/
        parse/
          route.ts         # POST → JSON (parseCalm + extractAnalysisInput)
      pipeline/
        route.ts           # GET → JSON (return last pipeline result)
    dashboard/
      layout.tsx           # DashboardLayout wrapper (already exists)
      page.tsx             # Overview tab (already exists, replace skeletons)
      architecture/
        page.tsx           # Architecture graph tab (new)
      compliance/
        page.tsx           # Compliance tab (Phase 4)
      pipeline/
        page.tsx           # Pipeline tab (Phase 4)
      findings/
        page.tsx           # Findings tab (Phase 4)
  lib/
    api/
      schemas.ts           # Shared Zod schemas for API contracts (new)
  hooks/
    use-agent-stream.ts    # Custom fetch-based SSE hook (new)
  components/
    dashboard/
      agent-feed.tsx       # Real feed component (replace skeleton)
      agent-feed-event.tsx # Single event row with animation
      analyze-button.tsx   # Explicit "Analyze" button
      completion-toast.tsx # "Analysis complete" toast
    graph/
      architecture-graph.tsx        # React Flow wrapper with dagre layout
      nodes/
        service-node.tsx            # CALM service node
        database-node.tsx           # CALM database node
        webclient-node.tsx          # CALM webclient node
        actor-node.tsx              # CALM actor node
        system-node.tsx             # CALM system/ecosystem node
        trust-boundary-node.tsx     # Parent group node (dashed border)
      edges/
        protocol-edge.tsx           # Edge with protocol label
```

### Pattern 1: SSE API Route (POST + ReadableStream)

**What:** POST route that accepts CALM JSON, triggers agent orchestration inside a ReadableStream controller, and streams agent events as SSE data frames.

**When to use:** Whenever you need to stream events from a long-running server-side process triggered by a POST body.

**Critical note:** The `agentEventEmitter` singleton must be stored on `globalThis` to work across webpack's multi-instance module loading in Next.js dev and hot reloads.

```typescript
// Source: Next.js official docs + upstash.com/blog/sse-streaming-llm-responses
// src/app/api/analyze/route.ts

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { parseCalmFromString } from '@/lib/calm/parser';
import { extractAnalysisInput } from '@/lib/calm/extractor';
import { runAnalysis } from '@/lib/agents/orchestrator';
import { agentEventEmitter } from '@/lib/ai/streaming';
import type { AgentEvent } from '@/lib/agents/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parseResult = parseCalmFromString(JSON.stringify(body.calm));

  if (!parseResult.success) {
    return Response.json({ error: parseResult.error }, { status: 400 });
  }

  const analysisInput = extractAnalysisInput(parseResult.data);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const unsubscribe = agentEventEmitter.subscribe((event: AgentEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      });

      try {
        const result = await runAnalysis(analysisInput);
        // Store result for GET /api/pipeline
        setLastPipelineResult(result.pipeline);
        // Send completion event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', result })}\n\n`));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(err) })}\n\n`));
      } finally {
        unsubscribe();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
```

### Pattern 2: GlobalThis Singleton for AgentEventEmitter

**What:** Anchor the event emitter on `globalThis` to prevent re-instantiation across webpack module boundaries in Next.js dev mode.

**When to use:** Any module-level singleton shared between route handlers in Next.js App Router.

```typescript
// Source: github.com/vercel/next.js/issues/65350 (verified pattern)
// src/lib/ai/streaming.ts (update existing file)

declare global {
  // eslint-disable-next-line no-var
  var __agentEventEmitter: AgentEventEmitter | undefined;
}

export const agentEventEmitter: AgentEventEmitter =
  globalThis.__agentEventEmitter ??
  (globalThis.__agentEventEmitter = new AgentEventEmitter());
```

### Pattern 3: Client-Side Fetch-Based SSE Hook

**What:** Custom React hook that uses `fetch()` + `ReadableStream` reader to consume SSE from a POST route (native `EventSource` only supports GET).

**When to use:** Consuming SSE from POST endpoints (body required to send CALM JSON).

```typescript
// Source: Verified pattern from SSE streaming research
// src/hooks/use-agent-stream.ts

type StreamStatus = 'idle' | 'running' | 'complete' | 'error';

export function useAgentStream() {
  const { addAgentEvent, setAnalysisResult, startAnalysis, setStatus, analysisInput } = useAnalysisStore();
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async () => {
    if (!analysisInput) return;

    abortRef.current = new AbortController();
    startAnalysis();
    setStreamStatus('running');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calm: analysisInput }),
        signal: abortRef.current.signal,
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const json = JSON.parse(line.slice(6));
            if (json.type === 'done') {
              setAnalysisResult(json.result);
              setStreamStatus('complete');
            } else if (json.type === 'error') {
              setStatus('error');
              setStreamStatus('error');
            } else {
              addAgentEvent(json); // AgentEvent
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setStatus('error');
        setStreamStatus('error');
      }
    }
  }, [analysisInput, addAgentEvent, setAnalysisResult, startAnalysis, setStatus]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStreamStatus('idle');
  }, []);

  return { startStream, abort, streamStatus };
}
```

### Pattern 4: React Flow Custom Node with TypeScript

**What:** Typed custom React Flow node using `NodeProps<T>` generic pattern.

**When to use:** Each CALM node-type gets its own component.

```typescript
// Source: reactflow.dev/learn/advanced-use/typescript (HIGH confidence)
// src/components/graph/nodes/service-node.tsx

import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';

type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | 'unknown';

export type ServiceNodeData = {
  label: string;
  description: string;
  complianceStatus: ComplianceStatus;
};

export type ServiceNodeType = Node<ServiceNodeData, 'service'>;

const borderColors: Record<ComplianceStatus, string> = {
  compliant: 'border-emerald-500',
  partial: 'border-amber-500',
  'non-compliant': 'border-red-500',
  unknown: 'border-slate-600',
};

export function ServiceNode({ data }: NodeProps<ServiceNodeType>) {
  return (
    <div className={`bg-slate-800 border-2 ${borderColors[data.complianceStatus]} rounded-lg px-3 py-2 min-w-32`}>
      <Handle type="target" position={Position.Left} />
      <div className="text-xs font-medium text-slate-200">{data.label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{data.description}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
```

### Pattern 5: Dagre Auto-Layout (Left-to-Right)

**What:** Transform React Flow nodes and edges using dagre to produce hierarchical LR layout.

**When to use:** Called when CALM data is loaded or when nodes change.

```typescript
// Source: reactflow.dev/examples/layout/dagre (HIGH confidence)
// src/components/graph/utils/layout.ts

import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 64;

export function getLayoutedElements<T extends Record<string, unknown>>(
  nodes: Node<T>[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): { nodes: Node<T>[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40 });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const pos = graph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      targetPosition: 'left' as const,
      sourcePosition: 'right' as const,
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

### Pattern 6: Trust Boundary as React Flow Parent Node

**What:** CALM `deployed-in` / `composed-of` relationships become parent group nodes with child nodes nested inside.

**When to use:** Rendering trust boundaries from `trustBoundaries` array in `ArchitectureAnalysis`.

```typescript
// Source: reactflow.dev/learn/layouting/sub-flows (HIGH confidence)
// Trust boundary nodes use parentId to group children

// Parent group node (trust boundary)
{
  id: 'tb-network-zone',
  type: 'trustBoundary',
  position: { x: 0, y: 0 }, // dagre will position this
  data: { label: 'Network Zone', boundaryType: 'network' },
  style: { width: 400, height: 200 },
}

// Child node references parent
{
  id: 'service-api',
  type: 'service',
  parentId: 'tb-network-zone',    // Makes it a child
  extent: 'parent',               // Constrains movement
  position: { x: 20, y: 40 },    // Relative to parent
  data: { label: 'API Service', complianceStatus: 'compliant' },
}
```

### Anti-Patterns to Avoid

- **Re-creating nodeTypes on every render:** Define `nodeTypes` object outside the component or with `useMemo`. Causes remounting of all nodes on re-render.
- **Placing API route file at `route.ts` alongside `page.tsx`:** App Router does not allow both. API routes must be in dedicated folders.
- **Using native `EventSource` for POST SSE:** `EventSource` only supports GET. Use `fetch()` + `ReadableStream` reader.
- **Module-level singletons without globalThis:** Will duplicate across webpack module boundaries in Next.js dev mode; `agentEventEmitter` must be on `globalThis`.
- **Awaiting `runAnalysis` before returning Response:** Buffers everything. The ReadableStream `start()` callback must return immediately; agents run inside the callback.
- **Importing `@xyflow/react` without CSS:** Graph renders invisible. Must import `@xyflow/react/dist/style.css` in the component or a layout file.
- **Trust boundary nodes after their children in nodes array:** React Flow requires parent nodes to appear before children in the `nodes` array.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Graph auto-layout | Custom x/y positioning algorithm | `@dagrejs/dagre` | Handles cycles, ranking, edge crossing minimization, node overlap — all hard to implement |
| Slide-in animations | CSS `@keyframes` + Tailwind arbitrary values | `tailwindcss-animate` | Provides `animate-in`, `slide-in-from-right`, `fade-in` with correct composability and shadcn/ui alignment |
| SSE event parsing | Custom streaming protocol | Standard SSE `data: \n\n` format | Browser and library support; retry/reconnect semantics built in |
| Graph node drag + select | Custom mouse event handling | React Flow built-ins | Handles pointer events, z-index, canvas transforms, selection rectangles |
| Scroll-to-bottom logic | `window.scrollTo` or manual calculations | `element.scrollIntoView({ behavior: 'smooth' })` on last list item ref | Handles varying item heights, scroll container boundaries |

**Key insight:** In graph layout and streaming, the complexity lives in the edge cases (cycles, concurrent events, scroll position during fast updates). Always defer to purpose-built libraries.

---

## Common Pitfalls

### Pitfall 1: agentEventEmitter Singleton Breaks Under Hot Reload
**What goes wrong:** In Next.js dev mode, webpack reloads modules but keeps the same Node.js process. The event emitter is re-instantiated, breaking the connection between the SSE route (which subscribed to the old instance) and the orchestrator (which emits to the new instance).
**Why it happens:** Webpack's module system has a separate module registry from Node's require cache. Module-level `const` variables are recreated per bundle chunk reload.
**How to avoid:** Use the `globalThis` pattern:
```typescript
export const agentEventEmitter =
  globalThis.__agentEventEmitter ??
  (globalThis.__agentEventEmitter = new AgentEventEmitter());
```
**Warning signs:** SSE events emit to server console but never reach the client; route handler connects but receives 0 events.

### Pitfall 2: React Flow Parent/Group Nodes Must Come First in nodes Array
**What goes wrong:** Child nodes (those with `parentId`) render at wrong positions or not at all.
**Why it happens:** React Flow processes the nodes array sequentially; it needs parent dimensions before positioning children.
**How to avoid:** Sort nodes so all group/parent nodes appear before their children when building the nodes array.
**Warning signs:** Trust boundary boxes appear at `{x:0, y:0}` regardless of dagre output; children float outside group.

### Pitfall 3: Next.js Buffers SSE If You Await Before Returning
**What goes wrong:** All SSE events arrive at once after analysis completes instead of streaming in real-time.
**Why it happens:** `return new Response(stream)` must happen synchronously within the route handler. If you `await runAnalysis()` before creating the stream, Next.js buffers the entire response.
**How to avoid:** Create the ReadableStream first, run agents inside `start()` callback, return the Response immediately.
**Warning signs:** Network tab shows SSE request stays pending then dumps all events simultaneously.

### Pitfall 4: nodeTypes Object Recreated on Each Render
**What goes wrong:** React Flow remounts all custom nodes on every parent component render, losing animation state and causing flickering.
**Why it happens:** React Flow uses referential equality to check nodeTypes. `{ service: ServiceNode }` inside a component creates a new object each render.
**How to avoid:** Define `nodeTypes` outside the component scope:
```typescript
const nodeTypes = {
  service: ServiceNode,
  database: DatabaseNode,
  // ... other types
} as const;

export function ArchitectureGraph() {
  return <ReactFlow nodeTypes={nodeTypes} ... />;
}
```
**Warning signs:** Console warnings about nodeTypes changes; visible re-mount flash on every state update.

### Pitfall 5: Missing `@xyflow/react` CSS Import
**What goes wrong:** Graph canvas renders blank; nodes are invisible or unstyled.
**Why it happens:** React Flow requires its own CSS for the canvas background, node handles, and selection styling.
**How to avoid:** Import in the graph component file or root layout:
```typescript
import '@xyflow/react/dist/style.css';
```
**Warning signs:** Empty white or black rectangle where graph should be.

### Pitfall 6: Zustand store's agentEvents Growing Unbounded
**What goes wrong:** After multiple analyses, hundreds of events accumulate in store memory.
**Why it happens:** `addAgentEvent` always appends; `startAnalysis` does clear events, but if user runs many analyses in one session, old events persist between them.
**How to avoid:** `startAnalysis()` already calls `clearAgentEvents()` (confirmed in existing store). Verify this runs before each new stream.
**Warning signs:** Feed shows events from previous analyses mixed with current run.

### Pitfall 7: Tailwind v4 CSS-first Config Required for Custom Animations
**What goes wrong:** Custom `@keyframes` defined in `tailwind.config.ts` are silently ignored.
**Why it happens:** Tailwind v4 uses CSS-first configuration — theme is defined in `globals.css` via `@theme {}`, not in `tailwind.config.ts`.
**How to avoid:** Define custom animations inside `globals.css`:
```css
@theme {
  --animate-slide-in-right: slide-in-right 0.2s ease-out;
  /* ... */
}
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```
Or use `tailwindcss-animate` plugin which handles this automatically.
**Warning signs:** Custom animation class compiles but does nothing; no `@keyframes` in generated CSS.

---

## Code Examples

Verified patterns from official sources:

### SSE Route Handler (Next.js App Router)
```typescript
// Source: nextjs.org/docs/app/api-reference/file-conventions/route (official, 2026-02-20)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Long-running work happens HERE, inside start()
      // Return the Response first (below), then this runs
      await doWork((event) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      });
      controller.close();
    },
  });

  // Return IMMEDIATELY — do not await anything before this
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
```

### React Flow Setup with nodeTypes
```typescript
// Source: reactflow.dev/learn (official docs)
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// OUTSIDE component to prevent re-render recreation
const nodeTypes = {
  service: ServiceNode,
  database: DatabaseNode,
  webclient: WebClientNode,
  actor: ActorNode,
  system: SystemNode,
  trustBoundary: TrustBoundaryNode,
};

export function ArchitectureGraph({ nodes, edges }: Props) {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
```

### Animated Edges During Analysis
```typescript
// Source: @xyflow/react Edge type docs
// Set animated: true on all edges while status === 'analyzing'
const edges = baseEdges.map(edge => ({
  ...edge,
  animated: analysisStatus === 'analyzing',
}));
```

### Feed Auto-Scroll to Latest Event
```typescript
// Source: Standard DOM pattern, no library needed
const bottomRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [events.length]);

// In JSX: <div ref={bottomRef} />  at the end of the events list
```

### Zustand Selector Pattern (Performance)
```typescript
// Source: zustand docs — use selectors to prevent unnecessary re-renders
// Components that only need agent events shouldn't re-render on status changes
const agentEvents = useAnalysisStore(state => state.agentEvents);
const status = useAnalysisStore(state => state.status);
// NOT: const { agentEvents, status } = useAnalysisStore(); // re-renders on any store change
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `reactflow` npm package | `@xyflow/react` | React Flow v12 (2024) | Package renamed; old package still works but @xyflow/react is maintained |
| `dagre` npm package | `@dagrejs/dagre` | 2023 | dagre transferred to @dagrejs org; use new package name |
| `tailwind.config.js` for keyframes | `globals.css @theme` + `@keyframes` | Tailwind CSS v4 (2025) | Config file no longer the place for theme; CSS-first |
| Next.js Pages Router API routes with `res.write()` | App Router `route.ts` with `ReadableStream` | Next.js 13+ | Web standard APIs replace Node.js response objects |

**Deprecated/outdated:**
- `reactflow@11` and `reactflow@10` NodeTypes API: `nodeTypes` prop was same but the package import path `from 'reactflow'` is deprecated — use `from '@xyflow/react'`.
- `dagre` (non-scoped): Still functional but maintenance moved to `@dagrejs/dagre`.
- Next.js Pages Router `pages/api/*.ts` files: Not used in this project (App Router confirmed).

---

## Open Questions

1. **Pipeline result storage between POST /api/analyze and GET /api/pipeline**
   - What we know: The analyze route needs to persist the pipeline result so the GET route can return it.
   - What's unclear: Module-level variable works in dev; on Vercel serverless, each request may hit a different function instance.
   - Recommendation: For the hackathon, use a module-level variable with globalThis pattern. Add a comment noting this won't persist across serverless function instances — good enough for a demo where analyze is always called first in the same session.

2. **CALM data in the analyze POST body**
   - What we know: The analyze route needs CALM JSON as input. The client already has `analysisInput` in Zustand store after parsing.
   - What's unclear: Should the route accept raw CALM JSON (and parse server-side) or pre-parsed `AnalysisInput` (serialized)?
   - Recommendation: Accept the raw CALM document JSON (`CalmDocument`) — parse again on the server using the existing `parseCalm()`. This keeps the server the source of truth for validation. Pass `{ calm: rawCalmData }` from client.

3. **React Flow container height for dashboard layout**
   - What we know: React Flow requires a parent container with explicit width/height.
   - What's unclear: The dashboard layout uses flexbox — will `height: 100%` work or do we need explicit pixels?
   - Recommendation: Use `className="w-full h-full"` on the React Flow container and ensure the parent card has a fixed min-height (e.g., `min-h-[400px]`). This is standard practice with React Flow in responsive layouts.

4. **CALM node-type coverage for React Flow custom nodes**
   - What we know: CALM has 9 node types: actor, ecosystem, system, service, database, network, ldap, webclient, data-asset
   - What's unclear: Whether we need unique visual components for all 9 or can group some (e.g., ldap + network + data-asset into generic nodes).
   - Recommendation: Build full unique components for 5 most common types (service, database, webclient, actor, system/ecosystem), then a generic fallback `DefaultNode` for ldap, network, data-asset. The trading-platform and payment-gateway examples use service, database, webclient, actor — confirmed by reviewing example files.

---

## Sources

### Primary (HIGH confidence)
- `reactflow.dev/learn/getting-started/installation-and-requirements` — Package name `@xyflow/react`, CSS import requirement
- `reactflow.dev/learn/advanced-use/typescript` — `NodeProps<T>` typed pattern, `Node<Data, Type>` generic
- `reactflow.dev/examples/layout/dagre` — `@dagrejs/dagre` package, `getLayoutedElements` function pattern
- `reactflow.dev/learn/layouting/sub-flows` — Parent/group nodes, `parentId`, `extent: 'parent'`
- `nextjs.org/docs/app/api-reference/file-conventions/route` — ReadableStream SSE pattern (2026-02-20)
- Existing codebase: `src/lib/ai/streaming.ts`, `src/store/analysis-store.ts`, `src/lib/agents/types.ts`, `src/lib/calm/extractor.ts`

### Secondary (MEDIUM confidence)
- `upstash.com/blog/sse-streaming-llm-responses` — Single POST route → ReadableStream SSE pattern for LLM agents
- `github.com/vercel/next.js/issues/65350` — globalThis singleton fix for Next.js App Router webpack issue

### Tertiary (LOW confidence)
- WebSearch findings on `tailwindcss-animate` + Tailwind v4 compatibility — Not directly verified against v4 changelog; confirmed it exists and is used by shadcn/ui but v4 specifics need validation during implementation.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All core packages verified against official docs; versions confirmed from package.json and reactflow.dev
- Architecture: HIGH — SSE pattern, React Flow patterns, dagre layout all verified against official sources
- Pitfalls: HIGH — globalThis singleton and ReadableStream buffering verified against Next.js GitHub issues and official examples; React Flow pitfalls from official docs

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (stable libraries; tailwindcss-animate v4 compatibility should be rechecked)
