---
phase: 03-api-routes-dashboard-core
plan: 05
subsystem: ui
tags: [react-flow, dagre, graph-visualization, calm, compliance-coloring, architecture-graph]

# Dependency graph
requires:
  - phase: 02-multi-agent-infrastructure
    provides: ArchitectureAnalysis, RiskAssessment types with trustBoundaries and nodeRiskMap
  - phase: 01-foundation-calm-parser
    provides: AnalysisInput, CalmNode, CalmRelationship types from extractor.ts
  - phase: 03-api-routes-dashboard-core
    plan: 01-04
    provides: Zustand store with analysisInput, analysisResult, status fields

provides:
  - React Flow architecture graph (ArchitectureGraph component) reads from Zustand store
  - 7 custom node components mapped to CALM node-types with compliance border colors
  - Protocol-labeled bezier edge (ProtocolEdge) with EdgeLabelRenderer
  - Dagre LR auto-layout utility (getLayoutedElements) with trust boundary grouping
  - CALM-to-Flow data transformer (calmToFlow) that bridges CALM data to React Flow

affects:
  - 03-06 architecture tab page (uses ArchitectureGraph component)
  - Dashboard overview page (may embed ArchitectureGraph in overview panel)

# Tech tracking
tech-stack:
  added:
    - "@xyflow/react 12.10.1 — React Flow v12 (renamed from reactflow)"
    - "@dagrejs/dagre 2.0.4 — Hierarchical graph auto-layout"
  patterns:
    - "nodeTypes/edgeTypes defined outside component to prevent referential equality breaks"
    - "Parent nodes always precede children in React Flow nodes array"
    - "Dagre excludes trust boundary parent nodes; their bounds computed from children"
    - "ComplianceStatus maps risk levels to border colors: low=compliant, medium=partial, high/critical=non-compliant"
    - "useMemo for expensive calmToFlow transformation keyed on analysisInput + analysisResult"

key-files:
  created:
    - src/components/graph/architecture-graph.tsx
    - src/components/graph/nodes/service-node.tsx
    - src/components/graph/nodes/database-node.tsx
    - src/components/graph/nodes/webclient-node.tsx
    - src/components/graph/nodes/actor-node.tsx
    - src/components/graph/nodes/system-node.tsx
    - src/components/graph/nodes/trust-boundary-node.tsx
    - src/components/graph/nodes/default-node.tsx
    - src/components/graph/edges/protocol-edge.tsx
    - src/components/graph/utils/layout.ts
    - src/components/graph/utils/calm-to-flow.ts
  modified:
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "nodeTypes/edgeTypes defined as module-level constants outside ArchitectureGraph component to prevent React Flow remounting all nodes on re-render"
  - "Auto-layout only (nodesDraggable=false) for visual consistency in demo — dagre positions are authoritative"
  - "Trust boundary parent nodes excluded from dagre — bounds computed from children's positioned coordinates plus padding"
  - "Risk level maps to compliance: low=compliant (emerald), medium=partial (amber), high/critical=non-compliant (red)"
  - "Empty state renders dashed border placeholder when no analysisInput loaded"
  - "7 distinct node types with shared ComplianceStatus/borderColors exported from service-node.tsx as canonical source"

patterns-established:
  - "React Flow custom node: 'use client', NodeProps<T> generic typing, Handle at Position.Left/Right, compliance border color from data.complianceStatus"
  - "React Flow parent nodes (trust boundaries): no Handle elements, dashed-border styling, zIndex:-1, size computed by layout.ts"
  - "calmToFlow signature: (analysisInput, architectureAnalysis | null, riskAssessment | null) — handles nulls gracefully"

requirements-completed: [VIZ-01, VIZ-02, VIZ-03, VIZ-04, VIZ-05]

# Metrics
duration: 4min
completed: 2026-02-23
---

# Phase 03 Plan 05: Architecture Graph Summary

**React Flow architecture graph with 7 CALM-typed custom nodes, protocol-labeled edges, compliance border coloring from risk assessment, trust boundary groupings, and dagre LR auto-layout**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-23T17:00:38Z
- **Completed:** 2026-02-23T17:04:00Z
- **Tasks:** 2
- **Files modified:** 11 created + 2 modified (package.json, pnpm-lock.yaml)

## Accomplishments

- Installed `@xyflow/react` 12.x and `@dagrejs/dagre` 2.x and wired up 11 files
- 7 CALM-typed custom nodes (service/blue, database/purple, webclient/teal, actor/orange, system/slate, trust-boundary/dashed, default/generic) with compliance border coloring
- ProtocolEdge renders HTTPS/JDBC/etc labels at edge midpoints via EdgeLabelRenderer
- `getLayoutedElements()` applies dagre LR layout, excludes trust boundary nodes, computes their bounds from children
- `calmToFlow()` transforms CALM `AnalysisInput` + `ArchitectureAnalysis` + `RiskAssessment` into React Flow data
- `ArchitectureGraph` component reads from Zustand store, animates edges during analysis, compliance-colors minimap

## Task Commits

Each task was committed atomically:

1. **Task 1: Install React Flow + dagre, create 7 custom node types and protocol edge** - `2b1fa1b` (feat)
2. **Task 2: Create dagre layout utility, CALM-to-Flow transformer, and main ArchitectureGraph component** - `01cda8d` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `src/components/graph/architecture-graph.tsx` — React Flow wrapper (reads Zustand, useMemo transform, animated edges)
- `src/components/graph/nodes/service-node.tsx` — Service node with blue accent + canonical ComplianceStatus types
- `src/components/graph/nodes/database-node.tsx` — Database node with purple accent
- `src/components/graph/nodes/webclient-node.tsx` — Web client node with teal accent
- `src/components/graph/nodes/actor-node.tsx` — Actor node with orange accent
- `src/components/graph/nodes/system-node.tsx` — System/ecosystem node with slate accent
- `src/components/graph/nodes/trust-boundary-node.tsx` — Parent group node, dashed border, boundary type colors
- `src/components/graph/nodes/default-node.tsx` — Fallback for network/ldap/data-asset
- `src/components/graph/edges/protocol-edge.tsx` — Bezier edge with EdgeLabelRenderer for protocol badges
- `src/components/graph/utils/layout.ts` — Dagre LR layout with trust boundary parent computation
- `src/components/graph/utils/calm-to-flow.ts` — CALM AnalysisInput → React Flow nodes/edges transformer
- `package.json` — Added @xyflow/react, @dagrejs/dagre

## Decisions Made

- nodeTypes/edgeTypes defined at module level (not inside component) to maintain referential equality and prevent React Flow remounting
- Auto-layout only (`nodesDraggable=false`) — graph is read-only visualization, not interactive diagram
- Trust boundary nodes excluded from dagre graph; their dimensions are computed from children's final positions + 40px padding + 24px header space
- ComplianceStatus color mapping: `low` risk → `compliant` (emerald), `medium` → `partial` (amber), `high`/`critical` → `non-compliant` (red), unknown → slate-600
- Shared `ComplianceStatus` type and `borderColors` map exported from `service-node.tsx` (canonical single source) imported by all other node files

## Deviations from Plan

None — plan executed exactly as written.

The linter automatically improved `layout.ts` to use `Position.Left`/`Position.Right` enum values instead of string literals `'left'`/`'right'`. This is correct behavior aligning with React Flow's TypeScript requirements.

## Issues Encountered

**Pre-existing build failure:** `pnpm build` fails on this branch because `src/lib/ai/provider.ts` throws at module initialization if no LLM API keys are configured. This was a deliberate Phase 2 architectural decision ("fail-fast provider validation") and pre-exists our changes. Verified via `git stash + pnpm build` — same error occurs without any of our new files. Fix: set `GOOGLE_GENERATIVE_AI_API_KEY` env var before running `pnpm build`. `pnpm typecheck` passes cleanly.

## User Setup Required

None — no external service configuration required for this plan.

## Next Phase Readiness

- `ArchitectureGraph` is ready for use in the architecture tab page (plan 03-06)
- All 5 VIZ requirements (VIZ-01 through VIZ-05) completed
- Graph reads from Zustand store — no props required, just mount it in the architecture dashboard tab

## Self-Check: PASSED

- All 11 source files verified present on disk
- Task commit 2b1fa1b (Task 1) found in git log
- Task commit 01cda8d (Task 2) found in git log

---
*Phase: 03-api-routes-dashboard-core*
*Completed: 2026-02-23*
