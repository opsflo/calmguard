---
status: diagnosed
trigger: "Architecture tab graph has nodes clustered in center with excess empty space"
created: 2026-02-24T00:00:00Z
updated: 2026-02-24T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - Dagre spacing too tight + fitView only scales the compact layout, does not spread nodes
test: Read all layout/graph/page files, analyzed spacing math against viewport
expecting: Tight ranksep/nodesep producing compact graph that fitView centers but cannot spread
next_action: Return diagnosis

## Symptoms

expected: Graph fills viewport with well-spaced nodes across the available area
actual: Nodes clustered in center-left area with lots of unused empty space
errors: None (visual layout issue)
reproduction: Navigate to /dashboard/architecture page
started: Unknown

## Eliminated

## Evidence

- timestamp: 2026-02-24T00:01:00Z
  checked: layout.ts dagre config (line 26)
  found: ranksep=80, nodesep=40, NODE_WIDTH=180, NODE_HEIGHT=72
  implication: With ~5 ranks and ~3 nodes per rank, total graph is ~1300x300px — very compact

- timestamp: 2026-02-24T00:01:00Z
  checked: architecture-graph.tsx fitView config (lines 94-95)
  found: fitView with padding=0.2, no minZoom override
  implication: fitView scales compact layout to fit container but preserves tight proportions

- timestamp: 2026-02-24T00:01:00Z
  checked: page.tsx container (line 25)
  found: h-[calc(100vh-12rem)] gives ~888px tall container on 1080p viewport
  implication: LR graph is ~300px tall in ~888px container — huge vertical empty space

- timestamp: 2026-02-24T00:01:00Z
  checked: Custom node dimensions (service-node.tsx line 28)
  found: Nodes use min-w-36 (144px) with variable content, dagre assumes fixed 180x72
  implication: Minor mismatch but not the primary cause of clustering

- timestamp: 2026-02-24T00:01:00Z
  checked: trading-platform.calm.json
  found: 10 nodes, 8 edges, LR layout produces wide-but-short graph
  implication: Aspect ratio mismatch between wide graph and tall container

## Resolution

root_cause: Dagre spacing (ranksep=80, nodesep=40) is too tight, producing a compact ~1300x300px graph. fitView only scales and centers that compact layout inside a ~full-height container (~888px); it cannot redistribute nodes. The graph's wide-and-short aspect ratio mismatches the tall container, leaving large vertical dead zones.
fix:
verification:
files_changed: []
